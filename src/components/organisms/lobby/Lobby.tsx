import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PartySocket from "partysocket";
import {
  initializeWebSocket,
  subscribeToMessages,
  switchRoom,
  getWebSocketInstance,
} from "@/services/webSocketService";
import { PARTYKIT_URL } from "@/services/env";
import { sendEnteredLobby, sendPlayerEnters } from "@/utils/gameMessageUtils";
import type { Player } from "@/types/gameTypes";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { useGameContext } from "@/hooks/useGameContext";

import RoomTab from "@/components/atoms/roomTab/RoomTab";
import ButtonStyle from "@/components/atoms/buttonStyle/ButtonStyle";
import Footer from "@/components/atoms/footer/Footer";

interface LobbyProps {
  rooms: string[];
  setRooms?: (rooms: string[]) => void;
}

const Lobby = ({ rooms, setRooms }: LobbyProps) => {
  const navigate = useNavigate();
  const [roomPlayers, setRoomPlayers] = useState<{ [key: string]: Player[] }>(
    {},
  );
  const [roomStatus, setRoomStatus] = useState<{
    [key: string]: {
      isFull?: boolean;
      isInProgress?: boolean;
      isGameOver?: boolean;
      disconnectedPlayerNames?: string[];
    };
  }>({});
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);

  // Get player data from context (preferred) and localStorage (fallback)
  const {
    playerId: contextPlayerId,
    playerName: contextPlayerName,
    avatar: contextAvatar,
  } = useGlobalContext();
  const { resetGameState } = useGameContext();
  const avatar = contextAvatar || localStorage.getItem("avatarImage");
  const playerName = contextPlayerName || localStorage.getItem("playerName");
  const playerId = contextPlayerId || localStorage.getItem("playerId");

  // Use a ref to track if we've already fetched initial rooms
  const hasFetchedInitialRooms = useRef(false);
  // Use refs to avoid stale closures in the fetch callback
  const roomsRef = useRef(rooms);
  const setRoomsRef = useRef(setRooms);

  // Keep refs updated
  useEffect(() => {
    roomsRef.current = rooms;
    setRoomsRef.current = setRooms;
  }, [rooms, setRooms]);

  // Fetch available rooms from server
  const fetchAvailableRooms = useCallback(async () => {
    try {
      const response = await fetch(
        `${PARTYKIT_URL}/parties/main/lobby?availableRooms=true`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.rooms && setRoomsRef.current) {
          const currentRooms = roomsRef.current;
          const serverRoomNames = data.rooms.map(
            (r: { name: string }) => r.name,
          );

          // Reconcile: keep only rooms that still exist on the server,
          // plus any special entries like "Create room", and add new ones.
          const reconciledRooms = currentRooms.filter(
            (r) => r === "Create room" || serverRoomNames.includes(r),
          );
          const newRooms = serverRoomNames.filter(
            (name: string) => !currentRooms.includes(name),
          );
          const mergedRooms = [...reconciledRooms, ...newRooms];

          // Also clear sessionStorage if the stored room no longer exists on the server
          const storedRoom = sessionStorage.getItem("currentRoom");
          if (storedRoom && !serverRoomNames.includes(storedRoom)) {
            sessionStorage.removeItem("currentRoom");
          }

          if (
            JSON.stringify(mergedRooms.sort()) !==
            JSON.stringify(currentRooms.sort())
          ) {
            setRoomsRef.current(mergedRooms);
          }
        }
      }
    } catch (error) {
      console.error("[Lobby] Failed to fetch available rooms:", error);
    }
  }, []);

  // Fetch available rooms on mount and periodically
  useEffect(() => {
    // Only fetch initial rooms once
    if (!hasFetchedInitialRooms.current) {
      hasFetchedInitialRooms.current = true;
      // Use a small timeout to avoid immediate setState in effect
      const initialFetch = setTimeout(fetchAvailableRooms, 100);
      return () => clearTimeout(initialFetch);
    }

    // Poll every 5 seconds for room list + status flags
    const pollInterval = setInterval(fetchAvailableRooms, 5000);

    return () => clearInterval(pollInterval);
  }, [fetchAvailableRooms]);

  // Fetch player data from each room's own endpoint (the only source of truth
  // for both player avatars AND room status like isFull/isInProgress)
  const fetchRoomPlayers = useCallback(async (room: string) => {
    if (room === "Create room") return;
    try {
      const response = await fetch(`${PARTYKIT_URL}/parties/main/${room}`);
      if (response.ok) {
        const data = await response.json();
        setRoomPlayers((prev) => ({
          ...prev,
          [room]: data.players || [],
        }));
        // Status flags come from this endpoint too (the actual room server)
        setRoomStatus((prev) => ({
          ...prev,
          [room]: {
            isFull: data.isFull,
            isInProgress: data.isInProgress,
            isGameOver: data.isGameOver,
            disconnectedPlayerNames: data.disconnectedPlayerNames,
          },
        }));
      }
    } catch (error) {
      console.error(`[Lobby] Failed to fetch players for room ${room}:`, error);
    }
  }, []);

  // Poll player data for all rooms
  useEffect(() => {
    rooms.forEach((room) => fetchRoomPlayers(room));

    const pollInterval = setInterval(() => {
      rooms.forEach((room) => fetchRoomPlayers(room));
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [rooms, fetchRoomPlayers]);

  // Subscribe to room updates and new room notifications
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Listen for new room creation broadcasts and room deletions
    const roomEventsUnsubscribe = subscribeToMessages((message) => {
      if (message.type === "roomCreated" && setRoomsRef.current) {
        const newRoomName = message.roomName;
        const currentRooms = roomsRef.current;
        if (newRoomName && !currentRooms.includes(newRoomName)) {
          setRoomsRef.current([...currentRooms, newRoomName]);
        }
      }

      // Listen for room deletion
      if (message.type === "roomDeleted" && setRoomsRef.current) {
        const deletedRoomName = message.roomName;
        const currentRooms = roomsRef.current;
        if (deletedRoomName && currentRooms.includes(deletedRoomName)) {
          setRoomsRef.current(
            currentRooms.filter((r) => r !== deletedRoomName),
          );
          // Also remove from roomPlayers state
          setRoomPlayers((prev) => {
            const updated = { ...prev };
            delete updated[deletedRoomName];
            return updated;
          });
        }
        // Clear sessionStorage if the deleted room matches the stored room
        const storedRoom = sessionStorage.getItem("currentRoom");
        if (storedRoom && storedRoom === deletedRoomName) {
          sessionStorage.removeItem("currentRoom");
        }
      }

      // Also listen for available rooms updates
      if (message.type === "availableRooms" && setRoomsRef.current) {
        const serverRooms = message.rooms || [];
        const currentRooms = roomsRef.current;
        const existingRooms = currentRooms.filter(
          (r) => r === "Create room" || serverRooms.includes(r),
        );
        const newRooms = serverRooms.filter(
          (name: string) => !currentRooms.includes(name),
        );
        const mergedRooms = [...existingRooms, ...newRooms];

        if (
          JSON.stringify(mergedRooms.sort()) !==
          JSON.stringify(currentRooms.sort())
        ) {
          setRoomsRef.current(mergedRooms);
        }
      }
    });
    unsubscribers.push(roomEventsUnsubscribe);

    // Listen for room updates for player avatars
    rooms.forEach((room) => {
      const unsubscribe = subscribeToMessages((message) => {
        if (message.type === "roomUpdate" && message.room === room) {
          setRoomPlayers((prev) => ({
            ...prev,
            [room]: message.players || [],
          }));
          // Update status flags from roomUpdate broadcast
          setRoomStatus((prev) => ({
            ...prev,
            [room]: {
              isFull: message.isFull,
              isInProgress: message.isInProgress,
              isGameOver: message.isGameOver,
              disconnectedPlayerNames: message.disconnectedPlayerNames,
            },
          }));
        }
      });
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [rooms]);

  const handleClick = async (
    name: string,
    room: string,
    avatarPath: string,
  ) => {
    // Prevent double-click: ignore if already joining a room
    if (joiningRoom) return;

    const avatarName = avatarPath.substring(avatarPath.lastIndexOf("/") + 1);
    if (room === "Create room") {
      navigate("/game/create-room");
    } else {
      setJoiningRoom(room);

      const token = localStorage.getItem("authToken") || undefined;

      // Switch room and wait for reconnection
      await switchRoom({ roomId: room, token });

      // Subscribe to room updates AFTER switching rooms (so we're on the new socket)
      const unsubscribe = subscribeToMessages((message) => {
        // Handle join rejection from server
        if (message.type === "joinRejected") {
          unsubscribe();
          setJoiningRoom(null);
          console.warn(`[Lobby] Join rejected: ${message.reason}`);
          return;
        }

        if (message.type === "roomUpdate" && message.room === room) {
          // Player successfully added to room
          unsubscribe();

          // Pass ALL room data via navigation state so reconnecting players
          // get the full room state (round, card, theme, scores, etc.)
          navigate(`/game/${room}`, {
            state: {
              gameRoom: {
                count: message.count || 0,
                room: message.room || "",
                type: "roomUpdate",
                cardIndex: message.cardIndex,
                isGameOver: message.isGameOver,
                maxRounds: message.maxRounds,
                roomData: {
                  count: message.count || 0,
                  players: message.players || [],
                  name: message.room || "",
                  deck: message.deck,
                  newsCard: message.newsCard,
                },
              },
              // Pass extra fields that GamePage needs for reconnection
              currentRound: message.currentRound,
              themeStyle: message.themeStyle,
              newsCard: message.newsCard,
              cardIndex: message.cardIndex,
            },
          });
        }
      });

      // Wait for socket to be fully open before sending playerEnters
      const socket = getWebSocketInstance();
      if (socket) {
        // If socket is already open, send immediately
        if (socket.readyState === PartySocket.OPEN) {
          sendPlayerEnters(
            socket,
            { id: playerId || undefined, name, avatar: avatarName, room },
            room,
          );
        } else {
          // Otherwise wait for the 'open' event
          const openHandler = () => {
            sendPlayerEnters(
              socket,
              { id: playerId || undefined, name, avatar: avatarName, room },
              room,
            );
            socket.removeEventListener("open", openHandler);
          };
          socket.addEventListener("open", openHandler);
        }
      }

      // Fallback: clean up joining state after 5 seconds if no confirmation received
      setTimeout(() => {
        unsubscribe();
        setJoiningRoom(null);
        // Do NOT blindly navigate — only clean up state so user can retry
      }, 5000);
    }
  };

  useEffect(() => {
    // Reset all game state when entering lobby to prevent stale data from previous rooms
    resetGameState?.();

    const sendLobbyMessage = async () => {
      const avatarName = avatar
        ? avatar.substring(avatar.lastIndexOf("/") + 1)
        : "";
      await initializeWebSocket("lobby");

      // Wait for socket to be ready before sending message
      await new Promise((resolve) => setTimeout(resolve, 100));

      sendEnteredLobby(undefined, "lobby", avatarName, playerName || "");

      // Check if the player was in a room before (page refresh / disconnect)
      // and attempt auto-rejoin if the room still exists
      const storedRoom = sessionStorage.getItem("currentRoom");
      if (storedRoom && playerName) {
        try {
          const response = await fetch(
            `${PARTYKIT_URL}/parties/main/${storedRoom}`,
          );
          if (response.ok) {
            const data = await response.json();
            const disconnectedNames: string[] =
              data.disconnectedPlayerNames || [];
            // Only auto-rejoin if the server still has this player as disconnected
            if (disconnectedNames.includes(playerName)) {
              // Clear the stored room first to prevent loops
              sessionStorage.removeItem("currentRoom");
              // Auto-navigate back to the room
              handleClick(playerName, storedRoom, avatarName);
              return;
            }
          }
        } catch (error) {
          console.error(
            "[Lobby] Failed to check stored room for reconnection:",
            error,
          );
        }
        // Room no longer exists or player not in disconnected list — clear stale entry
        sessionStorage.removeItem("currentRoom");
      }
    };
    sendLobbyMessage();
  }, [avatar, playerName, resetGameState]);

  return (
    <div className="lobby" role="region" aria-labelledby="lobby-title">
      <h1 id="lobby-title" className="lobby-title">
        Join Game
      </h1>
      <div
        className="lobby__rooms"
        role="list"
        aria-label="Available game rooms"
      >
        <ButtonStyle type="glass" theme="all">
          <RoomTab
            room={"Create room"}
            onClick={() =>
              handleClick(playerName || "", "Create room", avatar || "")
            }
            key={"create-room"}
            avatar={avatar || ""}
          />
        </ButtonStyle>
        {rooms &&
          rooms.length > 0 &&
          rooms.map((room: string) => {
            const status = roomStatus[room];
            const canReconnect =
              !!status?.isInProgress &&
              !!playerName &&
              (status.disconnectedPlayerNames || []).includes(playerName);
            return (
              <RoomTab
                room={room}
                onClick={() =>
                  handleClick(playerName || "", room, avatar || "")
                }
                key={room}
                avatar={avatar || ""}
                roomPlayers={roomPlayers[room] || []}
                isFull={status?.isFull}
                isInProgress={status?.isInProgress}
                isGameOver={status?.isGameOver}
                joiningRoom={joiningRoom === room}
                canReconnect={canReconnect}
              />
            );
          })}
      </div>
    </div>
  );
};

export default Lobby;

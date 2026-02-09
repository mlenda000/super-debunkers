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

import RoomTab from "@/components/atoms/roomTab/RoomTab";

interface LobbyProps {
  rooms: string[];
  setRooms?: (rooms: string[]) => void;
}

const Lobby = ({ rooms, setRooms }: LobbyProps) => {
  const navigate = useNavigate();
  const [roomPlayers, setRoomPlayers] = useState<{ [key: string]: Player[] }>(
    {},
  );

  // Get player data from context (preferred) and localStorage (fallback)
  const {
    playerId: contextPlayerId,
    playerName: contextPlayerName,
    avatar: contextAvatar,
  } = useGlobalContext();
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
          // Merge server rooms with existing rooms (keeping "Create room")
          const serverRoomNames = data.rooms.map(
            (r: { name: string }) => r.name,
          );
          const existingRooms = currentRooms.filter(
            (r) => r === "Create room" || serverRoomNames.includes(r),
          );
          const newRooms = serverRoomNames.filter(
            (name: string) => !currentRooms.includes(name),
          );
          const mergedRooms = [...existingRooms, ...newRooms];

          // Update room players from server data
          const playersMap: { [key: string]: Player[] } = {};
          data.rooms.forEach((room: { name: string; players: Player[] }) => {
            playersMap[room.name] = room.players || [];
          });
          setRoomPlayers((prev) => ({ ...prev, ...playersMap }));

          // Only update if there are actual changes
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

    // Poll every 5 seconds for new rooms
    const pollInterval = setInterval(fetchAvailableRooms, 5000);

    return () => clearInterval(pollInterval);
  }, [fetchAvailableRooms]);

  // Function to fetch room players via HTTP
  const fetchRoomPlayers = useCallback(async (room: string) => {
    // Skip "Create room" as it's not an actual room
    if (room === "Create room") return;

    try {
      const response = await fetch(`${PARTYKIT_URL}/parties/main/${room}`);
      if (response.ok) {
        const data = await response.json();
        setRoomPlayers((prev) => ({
          ...prev,
          [room]: data.players || [],
        }));
      }
    } catch (error) {
      console.error(`[Lobby] Failed to fetch players for room ${room}:`, error);
    }
  }, []);

  // Fetch all room players on mount and periodically
  useEffect(() => {
    // Initial fetch for all rooms
    rooms.forEach((room) => {
      fetchRoomPlayers(room);
    });

    // Poll every 3 seconds for updates
    const pollInterval = setInterval(() => {
      rooms.forEach((room) => {
        fetchRoomPlayers(room);
      });
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
    const avatarName = avatarPath.substring(avatarPath.lastIndexOf("/") + 1);
    if (room === "Create room") {
      navigate("/game/create-room");
    } else {
      const token = localStorage.getItem("authToken") || undefined;

      // Switch room and wait for reconnection
      await switchRoom({ roomId: room, token });

      // Subscribe to room updates AFTER switching rooms (so we're on the new socket)
      const unsubscribe = subscribeToMessages((message) => {
        if (message.type === "roomUpdate" && message.room === room) {
          // Player successfully added to room
          unsubscribe();

          // Pass room data via navigation state
          navigate(`/game/${room}`, {
            state: {
              gameRoom: {
                count: message.count || 0,
                room: message.room || "",
                type: "roomUpdate",
                roomData: {
                  count: message.count || 0,
                  players: message.players || [],
                  name: message.room || "",
                  deck: message.deck,
                },
              },
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

      // Fallback: navigate after 2 seconds if no confirmation received
      setTimeout(() => {
        unsubscribe();
        navigate(`/game/${room}`);
      }, 2000);
    }
  };

  useEffect(() => {
    const sendLobbyMessage = async () => {
      const avatarName = avatar
        ? avatar.substring(avatar.lastIndexOf("/") + 1)
        : "";
      await initializeWebSocket("lobby");

      // Wait for socket to be ready before sending message
      await new Promise((resolve) => setTimeout(resolve, 100));

      sendEnteredLobby(undefined, "lobby", avatarName, playerName || "");
    };
    sendLobbyMessage();
  }, [avatar, playerName]);

  return (
    <>
      <>
        <div className="lobby" role="region" aria-labelledby="lobby-title">
          <h1 id="lobby-title" className="lobby-title">
            Join Game
          </h1>
          <div
            className="lobby__rooms"
            role="list"
            aria-label="Available game rooms"
          >
            {rooms &&
              rooms.map((room: string) => (
                <RoomTab
                  room={room}
                  onClick={() =>
                    handleClick(playerName || "", room, avatar || "")
                  }
                  key={room}
                  avatar={avatar || ""}
                  roomPlayers={roomPlayers[room] || []}
                />
              ))}
          </div>
        </div>
      </>
    </>
  );
};

export default Lobby;

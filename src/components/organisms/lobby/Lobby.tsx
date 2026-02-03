import { useEffect, useState, useCallback } from "react";
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

const Lobby = ({ rooms }: { rooms: string[] }) => {
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

  // Subscribe to room updates for all rooms to see player avatars (for immediate updates when switching rooms)
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

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
        <div className="lobby">
          <h1 className="lobby-title">Join Game</h1>
          <div className="lobby__rooms">
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

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PartySocket from "partysocket";
import {
  initializeWebSocket,
  subscribeToMessages,
  switchRoom,
  getWebSocketInstance,
} from "@/services/webSocketService";
import { sendEnteredLobby, sendPlayerEnters } from "@/utils/gameMessageUtils";

import RoomTab from "@/components/atoms/roomTab/RoomTab";

const Lobby = ({ rooms }: { rooms: string[] }) => {
  const navigate = useNavigate();

  // Get player data from localStorage
  const avatar = localStorage.getItem("avatarImage");
  const playerName = localStorage.getItem("playerName");

  const handleClick = async (
    name: string,
    room: string,
    avatarPath: string
  ) => {
    const avatarName = avatarPath.substring(avatarPath.lastIndexOf("/") + 1);
    if (room === "Create room") {
      navigate("/game/create-room");
    } else {
      console.log("[Lobby] Switching to room:", room);
      const token = localStorage.getItem("authToken") || undefined;

      // Switch room and wait for reconnection
      console.log("[Lobby] Calling switchRoom");
      await switchRoom({ roomId: room, token });
      console.log("[Lobby] switchRoom completed");

      // Wait a bit for socket to reconnect
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Subscribe to room updates AFTER switching rooms (so we're on the new socket)
      const unsubscribe = subscribeToMessages((message) => {
        console.log("[Lobby] Received message:", message.type, message);
        if (message.type === "roomUpdate" && message.room === room) {
          // Player successfully added to room
          console.log("[Lobby] Room update received, navigating to game");
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
          console.log("[Lobby] Socket ready: OPEN, sending playerEnters");
          sendPlayerEnters(socket, { name, avatar: avatarName, room }, room);
        } else {
          // Otherwise wait for the 'open' event
          console.log("[Lobby] Socket connecting, waiting for open event...");
          const openHandler = () => {
            console.log("[Lobby] Socket opened, sending playerEnters");
            sendPlayerEnters(socket, { name, avatar: avatarName, room }, room);
            socket.removeEventListener("open", openHandler);
          };
          socket.addEventListener("open", openHandler);
        }
      }

      // Fallback: navigate after 2 seconds if no confirmation received
      setTimeout(() => {
        console.log(`[Lobby] Timeout reached, navigating to game anyway`);
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
                />
              ))}
          </div>
        </div>
      </>
    </>
  );
};

export default Lobby;

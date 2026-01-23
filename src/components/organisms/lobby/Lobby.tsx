import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      const token = localStorage.getItem("authToken") || undefined;
      await switchRoom({ party: "game", roomId: room, token });
      // Subscribe to room updates and wait for confirmation
      const unsubscribe = subscribeToMessages((message) => {
        if (message.type === "roomUpdate" && message.room === room) {
          // Player successfully added to room
          unsubscribe();
          navigate(`/game/${room}`);
        }
      });

      const socket = getWebSocketInstance();
      sendPlayerEnters(socket, { name, avatar: avatarName, room }, room);

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
      const socket = getWebSocketInstance();
      sendEnteredLobby(socket, "lobby", avatarName, playerName || "");
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

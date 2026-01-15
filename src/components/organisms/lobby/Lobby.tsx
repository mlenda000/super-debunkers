import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendPlayerEnters,
  sendEnteredLobby,
  initializeWebSocket,
} from "@/services/webSocketService";

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
      await initializeWebSocket(room);
      sendPlayerEnters(room, { name, avatar: avatarName, room });
      navigate(`/game/${room}`);
    }
  };

  useEffect(() => {
    const sendLobbyMessage = async () => {
      const avatarName = avatar
        ? avatar.substring(avatar.lastIndexOf("/") + 1)
        : "";
      await initializeWebSocket("lobby");
      sendEnteredLobby("lobby", avatarName, playerName || "");
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

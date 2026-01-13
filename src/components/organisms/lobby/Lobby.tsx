import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendPlayerEnters,
  sendEnteredLobby,
} from "@/services/webSocketService";

import RoomTab from "@/components/atoms/roomTab/RoomTab";

const Lobby = ({ rooms }: { rooms: string[] }) => {
  const navigate = useNavigate();

  // Get player data from localStorage
  const avatar = localStorage.getItem("avatarImage");
  const playerName = localStorage.getItem("playerName");

  const handleClick = (name: string, room: string, avatarPath: string) => {
    const avatarName = avatarPath.substring(avatarPath.lastIndexOf("/") + 1);
    if (room === "Create room") {
      navigate("/game/create-room");
    } else {
      sendPlayerEnters(room, { name, avatar: avatarName, room });
      navigate(`/game/${room}`);
    }
  };

  useEffect(() => {
    const filteredRooms = rooms.find((room: string) => room !== "Create room");
    const avatarName = avatar
      ? avatar.substring(avatar.lastIndexOf("/") + 1)
      : "";
    sendEnteredLobby(filteredRooms, avatarName, playerName || "");
  }, [rooms, avatar, playerName]);

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

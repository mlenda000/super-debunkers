import React from "react";
import type { RoomTabProps } from "@/types/types";

interface Player {
  id: string;
  name: string;
  avatar: string;
  status?: boolean;
}

interface GameRoomData {
  room?: string;
  count?: number;
  roomData?: Player[];
}

const RoomTab = ({ room, onClick, avatar }: RoomTabProps) => {
  const gameRoom = { room, count: 0, roomData: [] } as GameRoomData;
  const gameRound = 0;
  const playerName = localStorage.getItem("playerName") || "";

  const handleInteraction = () => {
    onClick(playerName || "", room, avatar);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleInteraction();
    }
  };

  return (
    <button
      className="room-tab"
      onClick={handleInteraction}
      onKeyDown={handleKeyDown}
      style={{ zIndex: 2 }}
      disabled={(gameRoom?.count ?? 0) >= 5 || gameRound > 1}
      aria-label={`Join room ${room}`}
      aria-disabled={(gameRoom?.count ?? 0) >= 5 || gameRound > 1}
      tabIndex={0}
      role="button"
    >
      <h2 className="room-tab__title">{room}</h2>
      {/* {gameRoom?.roomData &&
        gameRoom.roomData.length > 0 &&
        room === gameRoom?.room && (
          <div className="player-avatars">
            {gameRoom.roomData.map((player: Player, index: number) => {
              return (
                <img
                  src={`/images/avatars/${player.avatar}`}
                  alt="players"
                  key={player.id || index}
                  style={{
                    width: "55px",
                    height: "55px",
                    zIndex: 1,
                    border: "1px solid #FFF",
                    borderRadius: "50%",
                    marginLeft: index > 0 ? "-10px" : "0",
                  }}
                />
              );
            })}
          </div>
        )} */}
    </button>
  );
};

export default RoomTab;

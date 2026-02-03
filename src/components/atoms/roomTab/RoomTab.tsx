import React from "react";
import type { RoomTabProps } from "@/types/types";
import type { Player } from "@/types/gameTypes";
import AvatarImage from "@/components/atoms/avatarImage/AvatarImage";

const RoomTab = ({
  room,
  onClick,
  avatar,
  roomPlayers,
}: RoomTabProps & { roomPlayers?: Player[] }) => {
  const playerCount = roomPlayers?.length || 0;
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
      disabled={(playerCount ?? 0) >= 5 || gameRound > 1}
      aria-label={`Join room ${room}`}
      aria-disabled={(playerCount ?? 0) >= 5 || gameRound > 1}
      tabIndex={0}
      role="button"
    >
      <h2 className="room-tab__title">{room}</h2>
      {roomPlayers && roomPlayers.length > 0 && (
        <div
          className="player-avatars"
          style={{ display: "flex", gap: "4px", padding: "8px 0" }}
        >
          {roomPlayers.map((player: Player, index: number) => {
            return (
              <AvatarImage
                key={player.id || index}
                src={`/images/avatars/${player.avatar}`}
                display="mini"
                playerReady={player.status || false}
              />
            );
          })}
        </div>
      )}
    </button>
  );
};

export default RoomTab;

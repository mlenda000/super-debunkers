import type { RoomTabProps } from "@/types/types";
import type { Player } from "@/types/gameTypes";
import AvatarImage from "@/components/atoms/avatarImage/AvatarImage";

const RoomTab = ({
  room,
  onClick,
  avatar,
  roomPlayers,
  isFull,
  isInProgress,
  isGameOver,
  joiningRoom,
  canReconnect,
}: RoomTabProps & { roomPlayers?: Player[] }) => {
  const playerCount = roomPlayers?.length || 0;
  const playerName = localStorage.getItem("playerName") || "";

  // Allow reconnection: if the player was previously in the room, override isInProgress
  const effectiveInProgress = isInProgress && !canReconnect;

  const isDisabled =
    !!isFull || !!effectiveInProgress || !!isGameOver || !!joiningRoom;

  const statusLabel = isGameOver
    ? "Game Over"
    : canReconnect
      ? "Rejoin"
      : isInProgress
        ? "In Progress"
        : isFull
          ? "Full"
          : null;

  const handleInteraction = () => {
    if (isDisabled) return;
    onClick(playerName || "", room, avatar);
  };

  return (
    <button
      className={`room-tab${isDisabled ? " room-tab--disabled" : ""}`}
      onClick={handleInteraction}
      style={{ zIndex: 2 }}
      disabled={isDisabled}
      aria-label={`${statusLabel ? `${statusLabel} — ` : ""}Join room ${room}${playerCount > 0 ? `, ${playerCount} player${playerCount !== 1 ? "s" : ""} in room` : ", empty room"}${joiningRoom ? " — joining…" : ""}`}
      aria-disabled={isDisabled}
    >
      <h2 className="room-tab__title">{room}</h2>
      {statusLabel && (
        <span
          className={`room-tab__status${canReconnect ? " room-tab__status--rejoin" : ""}`}
        >
          {statusLabel}
        </span>
      )}
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

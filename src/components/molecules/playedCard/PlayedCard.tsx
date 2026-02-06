import type { PlayedCardProps } from "@/types/types";

const PlayedCard: React.FC<PlayedCardProps> = ({ name, image, id, onUndo }) => {
  const handleUndoClick = () => {
    onUndo(id);
  };

  return (
    <div
      className="card-container"
      id="playersHand"
      role="img"
      aria-label={`Played card: ${name}`}
    >
      <button
        className="close-button"
        onClick={handleUndoClick}
        onTouchEnd={handleUndoClick}
        aria-label={`Remove ${name} card from hand`}
        aria-describedby={`card-${id}`}
        type="button"
      >
        <img src="/images/buttons/close.webp" alt="" aria-hidden="true" />
      </button>
      <img
        id={`card-${id}`}
        src={name === "The Truth" ? "/images/tactics/true.webp" : image}
        alt={name}
        className="card-image"
      />
    </div>
  );
};

export default PlayedCard;

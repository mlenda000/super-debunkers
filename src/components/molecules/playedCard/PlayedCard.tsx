import type { PlayedCardProps } from "@/types/types";

const PlayedCard: React.FC<PlayedCardProps> = ({ name, image, id, onUndo }) => {
  return (
    <div className="card-container" id="playersHand">
      <button className="close-button" onClick={() => onUndo(id)}>
        <img src="/images/buttons/close.webp" alt="Undo" />
      </button>
      <img
        src={name === "The Truth" ? "/images/tactics/true.webp" : image}
        alt={name}
        className="card-image"
      />
    </div>
  );
};

export default PlayedCard;

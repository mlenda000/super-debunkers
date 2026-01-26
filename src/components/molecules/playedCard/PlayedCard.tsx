import { useState } from "react";
import type { PlayedCardProps } from "@/types/types";

const PlayedCard: React.FC<PlayedCardProps> = ({ name, image, id, onUndo }) => {
  //ratio 2.5 : 3.5
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      className="played-card"
      id="playersHand"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered && (
        <button className="played-card__undo-icon" onClick={() => onUndo(id)}>
          <img src={`/icons/undo-arrow-icon.svg`} alt="Undo" />
        </button>
      )}
      <div className="played-card__content">
        <div className="played-card__image-container">
          <img
            src={name === "The Truth" ? "/images/tactics/true.webp" : image}
            alt={name}
            className="played-card__image"
            style={{ maxHeight: "250px", aspectRatio: "2.5 / 3.5" }}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayedCard;

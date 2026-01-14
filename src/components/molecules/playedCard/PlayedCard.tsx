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
      <div className="played-card__content">
        <div
          className="played-card__image-container"
          style={{ position: "relative" }}
        >
          <img
            src={
              name === "The Truth" || id === 1
                ? "/images/new-cards/true.png"
                : "/images/new-cards/" + image
            }
            alt={name}
            className="played-card__image"
          />
          {isHovered && (
            <div
              className="played-card__overlay"
              onClick={() => onUndo(id)}
              style={{
                position: "absolute",
                bottom: "75px",
                left: "20px",
                zIndex: 1,
              }}
            >
              <div className="played-card__undo-icon">
                <img src={`/icons/undo-arrow-icon.svg`} alt="Undo" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayedCard;

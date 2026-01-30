import { useState } from "react";
import type { PlayedCardProps } from "@/types/types";

const PlayedCard: React.FC<PlayedCardProps> = ({ name, image, id, onUndo }) => {
  //ratio 2.5 : 3.5
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsHovered(true);
  };
  const handleMouseLeave = () => {
    if (!isTouchDevice) setIsHovered(false);
  };
  const handleClick = () => {
    setIsHovered((prev) => !prev);
  };
  const handleTouchStart = () => {
    setIsTouchDevice(true);
  };

  return (
    <div
      className="played-card"
      id="playersHand"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
    >
      {isHovered && (
        <>
          <div className="played-card__overlay" />
          <button className="played-card__undo-icon" onClick={() => onUndo(id)}>
            <img src={`/icons/undo-arrow-icon.svg`} alt="Undo" />
          </button>
        </>
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

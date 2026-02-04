import { useRef } from "react";
import TacticCardBack from "@/components/molecules/tacticCardBack/TacticCardBack";
import TacticCardFront from "@/components/molecules/tacticCardFront/TacticCardFront";
import type { TacticCardProps } from "@/types/gameTypes";

interface TacticCardWithHoverProps extends TacticCardProps {
  hoveredCardId: string | null;
  setHoveredCardId: (id: string | null) => void;
  onMoveToTable?: (cardId: string) => void;
}

const TacticCard: React.FC<TacticCardWithHoverProps> = ({
  category,
  image,
  example,
  alt,
  imageBack,
  description,
  className,
  id,
  hoveredCardId,
  setHoveredCardId,
  onMoveToTable,
}) => {
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  const handleMouseEnter = () => {
    setHoveredCardId(id);
  };
  const handleMouseLeave = () => {
    setHoveredCardId(null);
  };
  const handleFocus = () => setHoveredCardId(id);
  const handleBlur = () => setHoveredCardId(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && onMoveToTable) {
      e.preventDefault();
      onMoveToTable(id);
    }
  };

  const handleTouchStart = () => {
    touchStartTimeRef.current = Date.now();
  };

  const handleTouchEnd = () => {
    const touchDuration = Date.now() - touchStartTimeRef.current;
    // Only count as tap if touch was quick (< 500ms)
    if (touchDuration < 500) {
      tapCountRef.current += 1;

      // Clear previous timeout
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }

      if (tapCountRef.current === 1) {
        // Single tap - show the back of the card
        setHoveredCardId(id);
        tapTimeoutRef.current = setTimeout(() => {
          tapCountRef.current = 0;
        }, 300);
      } else if (tapCountRef.current === 2) {
        // Double tap - move card to table
        tapCountRef.current = 0;
        if (onMoveToTable) {
          onMoveToTable(id);
        }
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only handle click on desktop (non-touch devices)
    // Touch devices will use the touch handlers
    if (!("ontouchstart" in window)) {
      e.preventDefault();
      if (onMoveToTable) {
        onMoveToTable(id);
      }
    }
  };

  return (
    <div
      key={category}
      className="tactic-card-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="button"
      aria-label={`Tactic card: ${category}. Press Enter or Space to move to table. Tap once to preview, double-tap to select.`}
    >
      {hoveredCardId === id ? (
        <TacticCardBack
          imageBack={imageBack}
          description={description || ""}
          example={example}
          category={category}
        />
      ) : (
        <TacticCardFront
          category={category}
          alt={alt}
          image={image}
          className={className}
        />
      )}
    </div>
  );
};

export default TacticCard;

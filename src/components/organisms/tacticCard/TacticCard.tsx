import { useRef, useEffect, useCallback } from "react";
import TacticCardBack from "@/components/molecules/tacticCardBack/TacticCardBack";
import TacticCardFront from "@/components/molecules/tacticCardFront/TacticCardFront";
import type { TacticCardProps } from "@/types/gameTypes";

interface TacticCardWithHoverProps extends TacticCardProps {
  hoveredCardId: string | null;
  setHoveredCardId: (id: string | null) => void;
  onMoveToTable?: (cardId: string) => void;
  onInfoClick?: (card: TacticCardProps) => void;
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
  title,
  hoveredCardId,
  setHoveredCardId,
  onMoveToTable,
  onInfoClick,
}) => {
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const infoClickedRef = useRef(false);

  const handleInfoClick = useCallback(() => {
    onInfoClick?.({
      id,
      category,
      image,
      imageBack,
      title,
      description,
      example,
      alt,
    });
  }, [
    onInfoClick,
    id,
    category,
    image,
    imageBack,
    title,
    description,
    example,
    alt,
  ]);

  // Attach native event listeners to bypass dnd-kit's pointer interception
  useEffect(() => {
    const btn = infoButtonRef.current;
    if (!btn) return;

    const stopAll = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    const handleNativeClick = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
      handleInfoClick();
    };

    btn.addEventListener("pointerdown", stopAll, true);
    btn.addEventListener("mousedown", stopAll, true);
    btn.addEventListener("click", handleNativeClick, true);
    btn.addEventListener("touchstart", stopAll, {
      passive: false,
      capture: true,
    });
    btn.addEventListener("touchend", stopAll, true);

    return () => {
      btn.removeEventListener("pointerdown", stopAll, true);
      btn.removeEventListener("mousedown", stopAll, true);
      btn.removeEventListener("click", handleNativeClick, true);
      btn.removeEventListener("touchstart", stopAll, true);
      btn.removeEventListener("touchend", stopAll, true);
    };
  }, [handleInfoClick]);

  const isInfoButton = (target: EventTarget | null) => {
    return infoButtonRef.current?.contains(target as Node);
  };

  const handleMouseEnter = () => {
    setHoveredCardId(id);
  };
  const handleMouseLeave = () => {
    setHoveredCardId(null);
  };
  const handleFocus = (e: React.FocusEvent) => {
    if (isInfoButton(e.target)) return;
    setHoveredCardId(id);
  };
  const handleBlur = (e: React.FocusEvent) => {
    if (isInfoButton(e.target)) return;
    setHoveredCardId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isInfoButton(e.target)) return;
    if ((e.key === "Enter" || e.key === " ") && onMoveToTable) {
      e.preventDefault();
      onMoveToTable(id);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isInfoButton(e.target)) return;
    touchStartTimeRef.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isInfoButton(e.target)) return;
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
    if (isInfoButton(e.target)) return;
    if (infoClickedRef.current) {
      infoClickedRef.current = false;
      return;
    }
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
    <div className="tactic-card-wrapper">
      <button
        ref={infoButtonRef}
        className="tactic-card-item__info-button"
        type="button"
        aria-label={`Info about ${category} card`}
      >
        <img src="/images/buttons/info.webp" alt="" aria-hidden="true" />
      </button>
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
    </div>
  );
};

export default TacticCard;

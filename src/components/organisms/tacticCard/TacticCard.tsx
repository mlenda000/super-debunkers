import TacticCardBack from "@/components/molecules/tacticCardBack/TacticCardBack";
import TacticCardFront from "@/components/molecules/tacticCardFront/TacticCardFront";
import type { TacticCardProps } from "@/types/types";
import "./styles/tactic-card.css";

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
  const handleMouseEnter = (e: React.MouseEvent) => {
    setHoveredCardId(id);
  };
  const handleMouseLeave = (e: React.MouseEvent) => {
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

  return (
    <div
      key={category}
      className="tactic-card-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Tactic card: ${category[0]}. Press Enter or Space to move to table`}
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

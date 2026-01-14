import { useState } from "react";
import TacticCardBack from "@/components/molecules/tacticCardBack/TacticCardBack";
import TacticCardFront from "@/components/molecules/tacticCardFront/TacticCardFront";
import type { TacticCardProps } from "@/types/types";

const TacticCard: React.FC<TacticCardProps> = ({
  category,
  image,
  example,
  alt,
  imageBack,
  description,
  className,
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div
      key={category}
      className="tactic-card"
      onClick={() => setHoveredCard(hoveredCard === category ? null : category)}
      onMouseEnter={() => setHoveredCard(category)}
      onMouseLeave={() => setHoveredCard(null)}
      onFocus={() => setHoveredCard(category)}
      onBlur={() => setHoveredCard(null)}
      tabIndex={0}
    >
      {hoveredCard === category ? (
        <TacticCardBack
          imageBack={imageBack}
          description={description || ""}
          example={example}
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

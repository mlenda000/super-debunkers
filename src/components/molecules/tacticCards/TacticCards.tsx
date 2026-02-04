import { useState } from "react";
import tacticCards from "@/data/tacticsCards.json";
import TacticCardBack from "@/components/molecules/tacticCardBack/TacticCardBack";
import TacticCardFront from "../tacticCardFront/TacticCardFront";

const TacticCards = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, tactic: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setHoveredCard(hoveredCard === tactic ? null : tactic);
    }
  };

  return (
    <div
      className="tactic-cards-wrapper"
      role="list"
      aria-label="Misinformation tactics"
    >
      {Object.values(tacticCards)
        .slice(0, 10)
        .map((card) => (
          <div
            key={card.tactic}
            className="tactic-card"
            onClick={() =>
              setHoveredCard(hoveredCard === card.tactic ? null : card.tactic)
            }
            onMouseEnter={() => setHoveredCard(card.tactic)}
            onMouseLeave={() => setHoveredCard(null)}
            onFocus={() => setHoveredCard(card.tactic)}
            onBlur={() => setHoveredCard(null)}
            onKeyDown={(e) => handleKeyDown(e, card.tactic)}
            tabIndex={0}
            role="listitem"
            aria-label={`${card.tactic} tactic card. ${hoveredCard === card.tactic ? "Showing description." : "Focus or hover to see description."}`}
          >
            {hoveredCard === card.tactic ? (
              <TacticCardBack
                imageBack={card.imageBack}
                description={card.description}
                category={card.tactic}
              />
            ) : (
              <TacticCardFront
                image={card.image}
                alt={card.imageAlt}
                category={card.tactic}
              />
            )}
          </div>
        ))}
    </div>
  );
};

export default TacticCards;

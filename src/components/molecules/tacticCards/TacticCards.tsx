import { useState } from "react";
import tacticCards from "@/data/tacticsCards.json";
import TacticCardBack from "@/components/molecules/tacticCardBack/TacticCardBack";
import TacticCardFront from "../tacticCardFront/TacticCardFront";

const TacticCards = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="tactic-cards-wrapper">
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
            tabIndex={0}
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

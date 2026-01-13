import { useState } from "react";
import tacticCards from "@/data/tacticsCards.json";
import TacticCardBack from "@/components/molecules/tacticCardBack/TacticCardBack";
import "./styles/tactic-cards.css";

const TacticCards = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="tactic-cards-wrapper">
      {Object.values(tacticCards).map((card) => (
        <div
          key={card.category}
          className="tactic-card"
          onClick={() =>
            setHoveredCard(hoveredCard === card.category ? null : card.category)
          }
          onMouseEnter={() => setHoveredCard(card.category)}
          onMouseLeave={() => setHoveredCard(null)}
          onFocus={() => setHoveredCard(card.category)}
          onBlur={() => setHoveredCard(null)}
          tabIndex={0}
        >
          {hoveredCard === card.category ? (
            <TacticCardBack
              imageBack={card.imageBack}
              description={card.description}
              example={card.example}
            />
          ) : (
            <img
              src={card.image}
              alt={card.imageAlt}
              className="tactic-card-image"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default TacticCards;

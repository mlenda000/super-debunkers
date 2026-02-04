import { useState } from "react";
import type { PlayersHandProps } from "@/types/gameTypes";
import TacticCard from "../tacticCard/TacticCard";
import SortableCard from "@/components/atoms/sortableCard/SortableCard";

const PlayersHand: React.FC<PlayersHandProps> = ({
  items,
  onMoveCardToTable,
}) => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  return (
    <div
      className="players-area"
      role="region"
      aria-label="Player's hand of cards"
    >
      {/* Screen reader instructions for drag and drop */}
      <p id="dnd-instructions" className="visually-hidden">
        Use Enter or Space to select a card and move it to the table. On touch
        devices, tap once to preview the card, double-tap to select it.
      </p>
      <div
        className="players-hand"
        role="list"
        aria-label="Available tactic cards"
      >
        {items.map((card) => (
          <SortableCard key={card?.id} id={card?.id}>
            <TacticCard
              key={card?.category}
              title={card?.title}
              description={card?.description}
              image={card?.image}
              imageBack={card?.imageBack}
              id={card?.id}
              category={card?.category}
              example={card?.example}
              alt={card?.alt}
              hoveredCardId={hoveredCardId}
              setHoveredCardId={setHoveredCardId}
              onMoveToTable={onMoveCardToTable}
            />
          </SortableCard>
        ))}
      </div>
    </div>
  );
};

export default PlayersHand;

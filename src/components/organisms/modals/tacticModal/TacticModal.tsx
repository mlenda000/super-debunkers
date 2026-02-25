import { createPortal } from "react-dom";
import TacticCardFront from "@/components/molecules/tacticCardFront/TacticCardFront";
import type { TacticCardProps } from "@/types/gameTypes";

interface TacticModalProps {
  card: TacticCardProps;
  onClose: () => void;
  onSelectCard: (cardId: string) => void;
}

const TacticModal: React.FC<TacticModalProps> = ({
  card,
  onClose,
  onSelectCard,
}) => {
  const modal = (
    <div
      className="tactic-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tactic-modal-title"
      onClick={onClose}
    >
      <div
        className="tactic-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tactic-modal__content">
          <div className="tactic-modal__card">
            <TacticCardFront
              category={card.category}
              image={card.image}
              alt={card.alt}
            />
          </div>
          <div className="tactic-modal__card-info">
            <h1 id="tactic-modal-title">{card.category}</h1>
            <p>
              <b>What happens: </b>
              {card.title}
            </p>
            {card.description && (
              <p>
                <b>Description: </b>
                {card.description}
              </p>
            )}
            <p>
              <b>Example: </b>
              {card.example}
            </p>
          </div>
        </div>
        <div className="tactic-modal__actions">
          <button
            onClick={() => onSelectCard(card.id)}
            className="tactic-modal__select"
          >
            Select Card
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default TacticModal;

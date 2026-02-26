import { useEffect } from "react";
import { useGameContext } from "@/hooks/useGameContext";
import { useModalFade } from "@/hooks/useModalFade";

interface RoundModalProps {
  onClose: () => void;
}

const RoundModal = ({ onClose }: RoundModalProps) => {
  const { gameRound, finalRound, gameRoom } = useGameContext();
  const { isClosing, startClose } = useModalFade(onClose);

  // Compute final round from server-provided maxRounds as primary check,
  // with the explicit finalRound state as fallback
  const isFinalRound = finalRound || gameRound === (gameRoom?.maxRounds || 5);

  // Auto-dismiss after ~1.7s display + 0.3s fade-out = ~2s total
  useEffect(() => {
    const timer = setTimeout(() => startClose(), 1700);
    return () => clearTimeout(timer);
  }, [startClose]);

  return (
    <div
      className={`round-modal__overlay${isClosing ? " round-modal__overlay--closing" : ""}`}
      style={{ zIndex: 100 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="round-modal-title"
      aria-live="polite"
    >
      <div className="round-modal__content ">
        {isFinalRound ? (
          <h1 id="round-modal-title" className="round-modal__title">
            Final round!
          </h1>
        ) : (
          <h1 id="round-modal-title" className="round-modal__title">
            Round {gameRound}
          </h1>
        )}
      </div>
    </div>
  );
};
export default RoundModal;

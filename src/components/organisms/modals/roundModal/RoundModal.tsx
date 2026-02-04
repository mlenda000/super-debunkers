import { useGameContext } from "@/hooks/useGameContext";

const RoundModal = () => {
  const { gameRound, finalRound } = useGameContext();

  return (
    <div
      className="round-modal__overlay"
      style={{ zIndex: 100 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="round-modal-title"
      aria-live="polite"
    >
      <div className="round-modal__content ">
        {finalRound ? (
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

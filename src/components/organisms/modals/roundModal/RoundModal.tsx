import { useGameContext } from "@/hooks/useGameContext";

const RoundModal = () => {
  const { gameRound, finalRound } = useGameContext();

  return (
    <div className="round-modal__overlay" style={{ zIndex: 100 }}>
      <div className="round-modal__content ">
        {finalRound ? (
          <h1 className="round-modal__title">Final round!</h1>
        ) : (
          <h1 className="round-modal__title">Round {gameRound}</h1>
        )}
      </div>
    </div>
  );
};
export default RoundModal;

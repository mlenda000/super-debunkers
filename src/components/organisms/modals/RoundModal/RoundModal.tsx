import React from "react";
import { useSelector } from "react-redux";

const RoundModal = () => {
  const gameRound = useSelector((state) => state.game.gameRound);
  const finalRound = useSelector((state) => state.game.finalRound);

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

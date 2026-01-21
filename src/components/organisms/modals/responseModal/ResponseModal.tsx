import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setShowScoreCard,
  setShowResponseModal,
} from "../../../store/gameSlice";

const ResponseModal = () => {
  const dispatch = useDispatch();
  const responseMsg = useSelector((state) => state.game.responseMsg);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setShowScoreCard(true));
      dispatch(setShowResponseModal(false));
    }, 3000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <div className="round-modal__overlay" style={{ zIndex: 100 }}>
      <div className="response-modal__content ">
        <h1 className="response-modal__title">
          {responseMsg?.hasStreak
            ? "WIN STREAK!"
            : responseMsg?.wasCorrect
            ? "DEBUNKED!"
            : "OOPS!"}
        </h1>
        <h3 className="response-modal__subtitle">
          {responseMsg?.hasStreak
            ? `YOU DEBUNKED ${responseMsg?.streak} IN A ROW`
            : responseMsg?.wasCorrect
            ? "YOU NAILED IT"
            : "YOU'LL GET THEM NEXT TIME"}
        </h3>
      </div>
    </div>
  );
};
export default ResponseModal;

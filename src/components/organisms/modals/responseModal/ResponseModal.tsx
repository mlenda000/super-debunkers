import { useGameContext } from "@/hooks/useGameContext";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { useEffect } from "react";

interface ResponseModalProps {
  setShowScoreCard: (value: boolean) => void;
  setShowResponseModal: (value: boolean) => void;
}

interface ResponseMessage {
  wasCorrect?: boolean;
  streak?: number;
  hasStreak?: boolean;
}

const ResponseModal = ({
  setShowScoreCard,
  setShowResponseModal,
}: ResponseModalProps) => {
  const { gameRoom } = useGameContext();
  const { playerName } = useGlobalContext();

  // Find the current player's result from the players array
  const currentPlayerName =
    playerName || localStorage.getItem("playerName") || "";
  const currentPlayer = gameRoom?.roomData?.players?.find(
    (p) => p.name === currentPlayerName
  );

  const responseMsg: ResponseMessage = {
    wasCorrect: currentPlayer?.wasCorrect ?? false,
    streak: currentPlayer?.streak ?? 0,
    hasStreak: currentPlayer?.hasStreak ?? false,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScoreCard(true);
      setShowResponseModal(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [setShowScoreCard, setShowResponseModal]);

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

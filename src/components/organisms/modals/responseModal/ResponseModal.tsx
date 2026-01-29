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
  const { gameRoom, players, lastScoreUpdatePlayers } = useGameContext();
  const { playerName } = useGlobalContext();

  // Find the current player's result from the players array
  const currentPlayerName =
    playerName || localStorage.getItem("playerName") || "";
  const sourcePlayers =
    lastScoreUpdatePlayers && lastScoreUpdatePlayers.length > 0
      ? lastScoreUpdatePlayers
      : gameRoom?.roomData?.players && gameRoom.roomData.players.length > 0
        ? gameRoom.roomData.players
        : players;

  const currentPlayer = sourcePlayers?.find(
    (p) => p.name === currentPlayerName,
  );

  console.log("[ResponseModal] Debug:", {
    currentPlayerName,
    currentPlayer,
    hasWasCorrect: typeof currentPlayer?.wasCorrect !== "undefined",
    sourcePlayers,
  });

  const responseMsg: ResponseMessage = {
    wasCorrect: currentPlayer?.wasCorrect ?? false,
    streak: currentPlayer?.streak ?? 0,
    hasStreak: currentPlayer?.hasStreak ?? false,
  };

  // Wait until scoring data is available before advancing to score modal
  const hasScoring = typeof currentPlayer?.wasCorrect !== "undefined";

  useEffect(() => {
    // If we have scoring data, show it for 3 seconds then advance
    if (hasScoring) {
      const timer = setTimeout(() => {
        setShowScoreCard(true);
        setShowResponseModal(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    // Fallback: If no scoring data arrives within 5 seconds, advance anyway
    const fallbackTimer = setTimeout(() => {
      console.warn(
        "[ResponseModal] No scoring data received, advancing to score modal",
      );
      setShowScoreCard(true);
      setShowResponseModal(false);
    }, 5000);

    return () => clearTimeout(fallbackTimer);
  }, [hasScoring, setShowScoreCard, setShowResponseModal]);

  return (
    <div className="round-modal__overlay" style={{ zIndex: 100 }}>
      <div className="response-modal__content ">
        <h1 className="response-modal__title">
          {hasScoring
            ? responseMsg?.hasStreak
              ? "WIN STREAK!"
              : responseMsg?.wasCorrect
                ? "DEBUNKED!"
                : "OOPS!"
            : "Processing results…"}
        </h1>
        <h3 className="response-modal__subtitle">
          {hasScoring
            ? responseMsg?.hasStreak
              ? `YOU DEBUNKED ${responseMsg?.streak} IN A ROW`
              : responseMsg?.wasCorrect
                ? "YOU NAILED IT"
                : "YOU'LL GET THEM NEXT TIME"
            : "PLEASE WAIT WHILE WE UPDATE YOUR SCORE"}
        </h3>
      </div>
    </div>
  );
};
export default ResponseModal;

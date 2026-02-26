import { useGameContext } from "@/hooks/useGameContext";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { useEffect, useCallback } from "react";
import { useModalFade } from "@/hooks/useModalFade";
import type { ResponseModalProps, ResponseMessage } from "@/types/types";

const ResponseModal = ({
  setShowScoreCard,
  setShowResponseModal,
}: ResponseModalProps) => {
  const { gameRoom, players, lastScoreUpdatePlayers } = useGameContext();
  const { playerName, playerId } = useGlobalContext();

  // Find the current player's result from the players array using ID (unique)
  const currentPlayerName =
    playerName || localStorage.getItem("playerName") || "";
  const currentPlayerId = playerId || localStorage.getItem("playerId") || "";
  const sourcePlayers =
    lastScoreUpdatePlayers && lastScoreUpdatePlayers.length > 0
      ? lastScoreUpdatePlayers
      : gameRoom?.roomData?.players && gameRoom.roomData.players.length > 0
        ? gameRoom.roomData.players
        : players;

  // Match by ID (unique), fall back to name if no ID available
  const currentPlayer = sourcePlayers?.find(
    (p) =>
      (currentPlayerId && p.id === currentPlayerId) ||
      (!currentPlayerId && p.name === currentPlayerName),
  );

  // Determine which source we're using for debugging
  const sourceType =
    lastScoreUpdatePlayers && lastScoreUpdatePlayers.length > 0
      ? "lastScoreUpdatePlayers"
      : gameRoom?.roomData?.players && gameRoom.roomData.players.length > 0
        ? "gameRoom.roomData.players"
        : "players";

  const responseMsg: ResponseMessage = {
    wasCorrect: currentPlayer?.wasCorrect ?? false,
    correctCount: currentPlayer?.correctCount ?? 0,
    totalPlayed: currentPlayer?.totalPlayed ?? 0,
    streak: currentPlayer?.streak ?? 0,
    hasStreak: currentPlayer?.hasStreak ?? false,
  };

  // Partial correct: played more than 1 card and got some (but not all) correct
  const isPartialCorrect =
    responseMsg.totalPlayed! > 1 &&
    responseMsg.correctCount! > 0 &&
    responseMsg.correctCount! < responseMsg.totalPlayed!;

  // Wait until scoring data is available before advancing to score modal
  const hasScoring = typeof currentPlayer?.wasCorrect !== "undefined";

  const handleDismiss = useCallback(() => {
    setShowScoreCard(true);
    setShowResponseModal(false);
  }, [setShowScoreCard, setShowResponseModal]);

  const { isClosing, startClose } = useModalFade(handleDismiss);

  useEffect(() => {
    const advanceTimer = setTimeout(
      () => startClose(),
      hasScoring ? 3000 : 10000,
    );

    return () => clearTimeout(advanceTimer);
  }, [hasScoring, currentPlayer, startClose]);

  return (
    <div
      className={`round-modal__overlay${isClosing ? " round-modal__overlay--closing" : ""}`}
      style={{ zIndex: 100 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="response-modal-title"
      aria-describedby="response-modal-subtitle"
    >
      <div className="response-modal__content ">
        <h1 id="response-modal-title" className="response-modal__title">
          {hasScoring
            ? responseMsg?.hasStreak
              ? "WIN STREAK!"
              : isPartialCorrect
                ? "GREAT EFFORT!"
                : responseMsg?.wasCorrect
                  ? "DEBUNKED!"
                  : "OOPS!"
            : "Processing results…"}
        </h1>
        <h3 id="response-modal-subtitle" className="response-modal__subtitle">
          {hasScoring
            ? responseMsg?.hasStreak
              ? `YOU DEBUNKED ${responseMsg?.streak} IN A ROW`
              : isPartialCorrect
                ? `YOU GOT ${responseMsg.correctCount} OUT OF ${responseMsg.totalPlayed} — KEEP GOING!`
                : responseMsg?.wasCorrect
                  ? "YOU NAILED IT"
                  : "YOU'LL GET THEM NEXT TIME"
            : "PLEASE WAIT WHILE WE UPDATE YOUR SCORE"}
        </h3>
        {!hasScoring && (
          <p
            style={{ fontSize: "12px", color: "#666", marginTop: "20px" }}
            aria-live="polite"
          >
            (Waiting for scoring data... Player: {currentPlayerName}, Has
            players: {sourcePlayers?.length || 0})
          </p>
        )}
      </div>
    </div>
  );
};
export default ResponseModal;

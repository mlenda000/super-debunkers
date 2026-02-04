import { useEffect, useCallback } from "react";
import { useGameContext } from "@/hooks/useGameContext";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import type { Player } from "@/types/gameTypes";
import type { ScoreModalProps } from "@/types/types";

const ScoreModal = ({
  setIsEndGame,
  setShowRoundModal,
  setShowScoreCard,
}: ScoreModalProps) => {
  const { gameRoom, setGameRound, gameRound, players, lastScoreUpdatePlayers } =
    useGameContext();
  const { setThemeStyle } = useGlobalContext();

  const handleDeal = useCallback(() => {
    if (gameRoom?.roomData?.players) {
      const currentRound = gameRound ?? 0;
      const nextRound = currentRound + 1;
      setGameRound?.(nextRound);

      // Keep the current villain's theme (don't reset to "all")
      // The theme will change when the next influencer is dealt
      // setThemeStyle("all");

      // Only show endgame modal if we've completed all 5 rounds
      if (nextRound > 5) {
        setIsEndGame(true);
      } else {
        // Show the round modal for the next round (2 seconds)
        setShowRoundModal?.(true);
      }

      // Hide the score modal
      setShowScoreCard?.(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gameRoom,
    gameRound,
    setGameRound,
    setThemeStyle,
    setIsEndGame,
    setShowRoundModal,
    setShowScoreCard,
  ]);

  // Auto-advance to next round after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDeal();
    }, 3000);

    return () => clearTimeout(timer);
  }, [handleDeal]);

  const sourcePlayers: Player[] =
    lastScoreUpdatePlayers && lastScoreUpdatePlayers.length > 0
      ? (lastScoreUpdatePlayers as Player[])
      : gameRoom?.roomData?.players && gameRoom.roomData.players.length > 0
        ? (gameRoom.roomData.players as Player[])
        : (players as Player[]);

  return (
    <div className="round-modal__overlay" style={{ zIndex: 100 }}>
      <div className="score-modal__content">
        <div className="score-modal__scores">
          <h1 className="score-modal__header">Scoreboard</h1>
          <h2 className="score-modal__title">
            <div>Rank</div>
            <div>Followers</div>
          </h2>
          {sourcePlayers
            .sort((a: Player, b: Player) => (b?.score ?? 0) - (a?.score ?? 0))
            .map((player: Player, index: number) => (
              <div className="score-modal__players" key={player?.name ?? index}>
                <div className="score-modal__player-left">
                  <div style={{ marginRight: "12px" }}>{index + 1}.</div>
                  <img
                    src={`/images/avatars/${player?.avatar}`}
                    alt={player?.name ?? "Player"}
                  />
                  <div>{player?.name}</div>
                </div>
                <div>{player?.score ?? 0}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreModal;

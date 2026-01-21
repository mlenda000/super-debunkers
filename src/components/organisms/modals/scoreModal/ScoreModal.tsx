import { useEffect, useCallback } from "react";
import { useGameContext } from "@/hooks/useGameContext";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import type { Player } from "@/types/gameTypes";

interface ScoreModalProps {
  setIsEndGame: (value: boolean) => void;
}

const ScoreModal = ({ setIsEndGame }: ScoreModalProps) => {
  const { gameRoom, setGameRound, gameRound } = useGameContext();
  const { setThemeStyle } = useGlobalContext();

  const handleDeal = useCallback(() => {
    if (gameRoom?.roomData?.players) {
      const currentRound = gameRound ?? 0;
      setGameRound?.(currentRound + 1);
      setThemeStyle("all");

      if (gameRoom.roomData.players.length > 0) {
        setIsEndGame(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameRoom, gameRound, setGameRound, setThemeStyle, setIsEndGame]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDeal();
    }, 3000);

    return () => clearTimeout(timer);
  }, [handleDeal]);

  const players = (gameRoom?.roomData?.players || []) as Player[];

  return (
    <div className="round-modal__overlay" style={{ zIndex: 100 }}>
      <div className="score-modal__content">
        <div className="score-modal__scores">
          <img
            src="/images/scoreboard.png"
            alt="Scoreboard"
            width="32%"
            height="auto"
          />
          <h1 className="score-modal__title">
            <div>Rank</div>
            <div>Followers</div>
          </h1>
          {players
            .sort((a: Player, b: Player) => (b?.score ?? 0) - (a?.score ?? 0))
            .map((player: Player, index: number) => (
              <div className="score-modal__players" key={player?.name ?? index}>
                <div className="score-modal__player-left">
                  <div style={{ marginRight: "12px" }}>{index + 1}.</div>
                  <img
                    src={`/images/avatars/${player?.avatar}`}
                    alt={player?.name ?? "Player"}
                    width="50px"
                    height="50px"
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

import { useGameContext } from "@/hooks/useGameContext";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { useNavigate } from "react-router-dom";
import type { Player } from "@/types/gameTypes";
import type { EndGameModalProps } from "@/types/types";
import "./styles/end-game-modal.css";

const EndGameModal = ({ setIsEndGame }: EndGameModalProps) => {
  const navigate = useNavigate();
  const { gameRoom, lastScoreUpdatePlayers, players } = useGameContext();
  const { setThemeStyle } = useGlobalContext();

  // Use the final scored snapshot, fallback to gameRoom, then context players
  const finalPlayers: Player[] =
    lastScoreUpdatePlayers && lastScoreUpdatePlayers.length > 0
      ? (lastScoreUpdatePlayers as Player[])
      : gameRoom?.roomData?.players && gameRoom.roomData.players.length > 0
        ? (gameRoom.roomData.players as Player[])
        : (players as Player[]);

  const topPlayer = finalPlayers.reduce<Player | null>(
    (top: Player | null, player: Player) =>
      (player?.score ?? 0) > (top?.score ?? 0) ? player : top,
    null,
  );

  const handleClick = () => {
    setThemeStyle("all");
    navigate("/");
    setIsEndGame(false);
  };

  return (
    <div
      className="round-modal__overlay"
      style={{ zIndex: 100 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="endgame-modal-title"
    >
      <div className="endgame-modal__content">
        <div className="endgame-modal__winner">
          <img
            src={`/images/avatars/winning/${topPlayer?.avatar}`}
            alt={`Winner: ${topPlayer?.name}`}
            className="endgame-modal__winner-avatar"
          />
          <h1 id="endgame-modal-title" className="endgame-modal__winner-text">
            {topPlayer?.name} Wins!!!
          </h1>
        </div>
        <div className="endgame-modal__scores">
          <img
            src="/images/buttons/scoreboard.webp"
            alt="Scoreboard"
            className="endgame-modal__scoreboard-img"
          />
          <h2 className="endgame-modal__title">
            <div>Rank</div>
            <div>Followers</div>
          </h2>
          {finalPlayers
            .sort((a: Player, b: Player) => (b?.score || 0) - (a?.score || 0))
            .map((player: Player, index: number) => (
              <div className="endgame-modal__player" key={player?.name}>
                <div className="endgame-modal__player-left">
                  <div className="endgame-modal__player-rank">{index + 1}.</div>
                  <img
                    src={`/images/avatars/winning/${player?.avatar}`}
                    alt={player?.name}
                    className="endgame-modal__player-avatar"
                  />
                  <div className="endgame-modal__player-name">
                    {player?.name}
                  </div>
                </div>
                <div className="endgame-modal__player-score">
                  {player?.score}
                </div>
              </div>
            ))}
        </div>
        <div className="endgame-modal__button">
          <button
            className="endgame-modal__home-btn-wrapper endgame-modal__home-btn-wrapper--regular"
            onClick={handleClick}
            aria-label="Return to home page"
          >
            <img
              src="/images/buttons/home-button.webp"
              alt=""
              className="endgame-modal__home-btn"
              aria-hidden="true"
            />
          </button>
          <button
            className="endgame-modal__home-btn-wrapper endgame-modal__home-btn-wrapper--small"
            onClick={handleClick}
            aria-label="Return to home page"
          >
            <img
              src="/images/buttons/home-button-small.webp"
              alt=""
              className="endgame-modal__home-btn"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  );
};
export default EndGameModal;

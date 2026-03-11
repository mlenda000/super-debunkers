import { useGameContext } from "@/hooks/useGameContext";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { useNavigate } from "react-router-dom";
import type { Player } from "@/types/gameTypes";
import type { EndGameModalProps } from "@/types/types";
import { sendEndGame, sendPlayerLeaves } from "@/utils/gameMessageUtils";
import { getWebSocketInstance } from "@/services/webSocketService";
import { useModalFade } from "@/hooks/useModalFade";
import "./styles/end-game-modal.css";

const EndGameModal = ({ setIsEndGame }: EndGameModalProps) => {
  const navigate = useNavigate();
  const { gameRoom, lastScoreUpdatePlayers, players } = useGameContext();
  const { setThemeStyle } = useGlobalContext();

  const isTeacherRoom = gameRoom?.teacherCreated === true;

  // Use the final scored snapshot, fallback to gameRoom, then context players
  const finalPlayers: Player[] =
    lastScoreUpdatePlayers && lastScoreUpdatePlayers.length > 0
      ? (lastScoreUpdatePlayers as Player[])
      : gameRoom?.roomData?.players && gameRoom.roomData.players.length > 0
        ? (gameRoom.roomData.players as Player[])
        : (players as Player[]);

  const highScore = finalPlayers.reduce(
    (max, player) => Math.max(max, player?.score ?? 0),
    0,
  );

  const topPlayers = finalPlayers.filter(
    (player) => (player?.score ?? 0) === highScore,
  );

  const isTied = topPlayers.length > 1;

  const handleDismiss = () => {
    const socket = getWebSocketInstance();
    const roomName = gameRoom?.room || gameRoom?.roomData?.name;

    // Notify server that this player is leaving and game has ended
    if (roomName) {
      sendEndGame(socket, roomName);
      sendPlayerLeaves(socket, roomName);
    }

    setThemeStyle("all");
    navigate("/");
    setIsEndGame(false);
  };

  const { isClosing, startClose } = useModalFade(handleDismiss);

  return (
    <div
      className={`round-modal__overlay round-modal__overlay--no-bg${isClosing ? " round-modal__overlay--closing" : ""}`}
      style={{ zIndex: 100 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="endgame-modal-title"
    >
      <div className="endgame-modal__content">
        <div className="endgame-modal__winner">
          {isTied ? (
            <>
              <div className="endgame-modal__winner-avatars">
                {topPlayers.map((player) => (
                  <img
                    key={player?.name}
                    src={`/images/avatars/winning/${player?.avatar}`}
                    alt={`Winner: ${player?.name}`}
                    className="endgame-modal__winner-avatar"
                  />
                ))}
              </div>
              <h1
                id="endgame-modal-title"
                className="endgame-modal__winner-text"
              >
                {topPlayers.map((p) => p?.name).join(" & ")}
              </h1>
              <p className="endgame-modal__winner-subtitle">
                Tied! Great work!
              </p>
            </>
          ) : (
            <>
              <img
                src={`/images/avatars/winning/${topPlayers[0]?.avatar}`}
                alt={`Winner: ${topPlayers[0]?.name}`}
                className="endgame-modal__winner-avatar"
              />
              <h1
                id="endgame-modal-title"
                className="endgame-modal__winner-text"
              >
                {topPlayers[0]?.name} Wins!!!
              </h1>
            </>
          )}
        </div>
        <div className="endgame-modal__scores">
          <img
            src="/images/buttons/scoreboard.webp"
            alt="Scoreboard"
            className="endgame-modal__scoreboard-img"
          />
          <h2 className="endgame-modal__title" aria-hidden="true">
            <div>Rank</div>
            <div>Followers</div>
          </h2>
          <div role="list" aria-label="Final player rankings">
            {finalPlayers
              .sort((a: Player, b: Player) => (b?.score || 0) - (a?.score || 0))
              .map((player: Player, index: number) => (
                <div
                  className="endgame-modal__player"
                  key={player?.name}
                  role="listitem"
                  aria-label={`Rank ${index + 1}: ${player?.name} with ${player?.score} followers`}
                >
                  <div className="endgame-modal__player-left">
                    <div className="endgame-modal__player-rank">
                      {index + 1}.
                    </div>
                    <img
                      src={`/images/avatars/winning/${player?.avatar}`}
                      alt=""
                      className="endgame-modal__player-avatar"
                      aria-hidden="true"
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
        </div>
        <div className="endgame-modal__button">
          {isTeacherRoom ? (
            <p className="endgame-modal__teacher-notice">
              Notify your teacher the game is complete
            </p>
          ) : (
            <button
              className="endgame-modal__home-btn"
              onClick={startClose}
              aria-label="Return to home page"
            >
              <img
                src="/images/buttons/home.webp"
                alt=""
                className="endgame-modal__home-btn"
                aria-hidden="true"
              />
              <p className="endgame-modal__home-btn-text">Home</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default EndGameModal;

import { useGameContext } from "@/hooks/useGameContext";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { useNavigate } from "react-router-dom";
import type { Player } from "@/types/gameTypes";

interface EndGameModalProps {
  setIsEndGame: (value: boolean) => void;
}

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
    null
  );

  const handleClick = () => {
    setThemeStyle("all");
    navigate("/");
    setIsEndGame(false);
  };

  return (
    <div className="round-modal__overlay" style={{ zIndex: 100 }}>
      <div className="score-modal__content ">
        <div className="score-modal__scores">
          <img
            src={`/images/avatars/winning/${topPlayer?.avatar}`}
            alt={topPlayer?.name}
            width={"150px"}
            height={"auto"}
          />
          <h1>{topPlayer?.name} Wins!!!</h1>
          <img
            src="/images/buttons/scoreboard.webp"
            alt="Scoreboard"
            width={"32%"}
          />
          <h1 className="score-modal__title">
            <div>Rank</div>
            <div>Followers</div>
          </h1>
          {finalPlayers
            .sort((a: Player, b: Player) => (b?.score || 0) - (a?.score || 0)) // Sort players by score in descending order
            .map((player: Player, index: number) => (
              <div className="score-modal__players" key={player?.name}>
                <div className="score-modal__player-left">
                  <div style={{ marginRight: "12px" }}>{index + 1} .</div>
                  <img
                    src={`/images/avatars/winning/${player?.avatar}`}
                    alt={player?.name}
                    width={"50px"}
                    height={"50px"}
                  />
                  <div>{player?.name}</div>
                </div>
                <div>{player?.score}</div>
              </div>
            ))}
        </div>
      </div>
      <div className="round-modal__button">
        <img
          src={"/images/buttons/home-button.webp"}
          alt="Ready for next round"
          width={"50%"}
          height={"auto"}
          style={{ cursor: "pointer" }}
          onClick={handleClick}
        />
      </div>
    </div>
  );
};
export default EndGameModal;

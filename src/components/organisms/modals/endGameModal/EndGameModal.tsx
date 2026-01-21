import { useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setEndGame } from "../../../store/gameSlice";
import { ThemeContext } from "../../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const EndGameModal = ({ setIsEndGame }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const gameRoom = useSelector((state) => state.game.gameRoom);
  const { setThemeStyle, setCurrentTheme } = useContext(ThemeContext);

  const topPlayer = gameRoom?.roomData?.reduce(
    (top, player) => (player?.score > (top?.score || 0) ? player : top),
    null
  );

  const handleClick = () => {
    dispatch(setEndGame(false));
    setThemeStyle("all");
    setCurrentTheme("all");
    navigate("/");
    setIsEndGame(false);
  };

  return (
    <div className="round-modal__overlay" style={{ zIndex: 100 }}>
      <div className="score-modal__content ">
        <div className="score-modal__scores">
          <img
            src={
              process.env.PUBLIC_URL +
              `/images/winningAvatars/${topPlayer?.avatar}`
            }
            alt={topPlayer?.name}
            width={"150px"}
            height={"auto"}
          />
          <h1>{topPlayer?.name} Wins!!!</h1>
          <img
            src={process.env.PUBLIC_URL + "/images/scoreboard.png"}
            alt="Scoreboard"
            width={"32%"}
          />
          <h1 className="score-modal__title">
            <div>Rank</div>
            <div>Followers</div>
          </h1>
          {gameRoom?.roomData
            ?.sort((a, b) => b.score - a.score) // Sort players by score in descending order
            .map((player, index) => (
              <div className="score-modal__players" key={player?.name}>
                <div className="score-modal__player-left">
                  <div style={{ marginRight: "12px" }}>{index + 1} .</div>
                  <img
                    src={
                      process.env.PUBLIC_URL +
                      `/images/Avatars/${player?.avatar}`
                    }
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
          src={process.env.PUBLIC_URL + "/images/home-button.png"}
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

import { useContext, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSendMessage } from "../../../hooks/useSendMessage";
import {
  setGameRound,
  setCurrentInfluencer,
  setRoundStart,
  setShowGameTimer,
  setShowScoreCard,
  setShowResponseModal,
} from "../../../store/gameSlice";
import { ThemeContext } from "../../../context/ThemeContext";

const ScoreModal = ({ setIsEndGame }) => {
  const dispatch = useDispatch();
  const sendMessage = useSendMessage();
  const gameRound = useSelector((state) => state.game.gameRound);
  const currentInfluencer = useSelector(
    (state) => state.game.currentInfluencer
  );
  const influencerCards = useSelector((state) => state.game.influencerCards);
  const showResponseModal = useSelector(
    (state) => state.game.showResponseModal
  );
  const gameRoom = useSelector((state) => state.game.gameRoom);
  const endGame = useSelector((state) => state.game.endGame);
  const { setThemeStyle } = useContext(ThemeContext);

  const handleDeal = useCallback(() => {
    const gameCards = Array.isArray(influencerCards)
      ? [...influencerCards]
      : [];

    if (gameCards.length > gameRound) {
      dispatch(setCurrentInfluencer(gameCards[gameRound]));
      dispatch(setGameRound(gameRound + 1));
      const messageRdyInfluencer = {
        type: "influencer",
        villain: currentInfluencer?.villain,
        tactic: currentInfluencer?.tacticUsed,
      };

      sendMessage(messageRdyInfluencer);
      setThemeStyle(currentInfluencer?.villain);
      dispatch(setShowScoreCard(false));
      dispatch(setShowGameTimer(false));
      if (!endGame) {
        dispatch(setRoundStart(true));
      } else {
        setIsEndGame(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentInfluencer?.tacticUsed,
    currentInfluencer?.villain,
    gameRound,
    influencerCards,
    sendMessage,
    dispatch,
    setIsEndGame,
    setThemeStyle,
    endGame,
  ]);

  useEffect(() => {
    setTimeout(() => {
      handleDeal();
    }, 3000);
  }, [handleDeal]);

  return (
    <div className="round-modal__overlay" style={{ zIndex: 100 }}>
      <div className="score-modal__content ">
        <div className="score-modal__scores">
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
              <div className="score-modal__players" key={player.name}>
                <div className="score-modal__player-left">
                  <div style={{ marginRight: "12px" }}>{index + 1} .</div>
                  <img
                    src={
                      process.env.PUBLIC_URL +
                      `/images/Avatars/${player.avatar}`
                    }
                    alt={player.name}
                    width={"50px"}
                    height={"50px"}
                  />
                  <div>{player.name}</div>
                </div>
                <div>{player?.score}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
export default ScoreModal;

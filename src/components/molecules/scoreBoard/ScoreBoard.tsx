import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AvatarImage from "@/components/atoms/avatarImage/AvatarImage";
import { useGlobalContext } from "@/hooks/useGlobalContext";

const Scoreboard = ({
  roundHasEnded,
  setRoundHasEnded,
  isInfoModalOpen,
  setIsInfoModalOpen,
  gameRoom,
  gameRound,
}) => {
  const { setThemeStyle } = useGlobalContext();
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {}, [JSON.stringify(gameRoom?.roomData)]);
  const goHome = () => {
    setThemeStyle("all");
    navigate("/");
  };

  return (
    <div className="scoreboard">
      <img
        src={`/images/buttons/home-button.webp`}
        alt="home"
        onClick={goHome}
        style={{ cursor: "pointer", zIndex: 2 }}
        className="scoreboard__home-button"
      />
      <img
        src={`/images/buttons/home-button-small.webp`}
        alt="home"
        onClick={goHome}
        style={{ cursor: "pointer", zIndex: 2 }}
        className="scoreboard__home-button-small"
      />

      <div className="scoreboard__avatar">
        {gameRoom?.roomData?.length > 0 &&
          gameRoom?.roomData?.map((avatar, ready) => {
            return (
              <React.Fragment key={avatar?.id}>
                {avatar?.status ? (
                  <img
                    src={`/icons/player-ready.png`}
                    alt="Player ready"
                    width="60px"
                    style={{ zIndex: 2 }}
                  />
                ) : (
                  <AvatarImage
                    src={avatar?.avatar}
                    display="mini"
                    playerReady={ready}
                  />
                )}
                <span
                  className="scoreboard__names"
                  style={{ marginLeft: "8px", zIndex: 2 }}
                >
                  {avatar?.name}
                </span>
              </React.Fragment>
            );
          })}
      </div>
      <div style={{ zIndex: 2 }} className="scoreboard-right__container ">
        <div className="scoreboard-timer">
          <h1>
            <span className="scoreboard__score-numeric" style={{ zIndex: 2 }}>
              Round {gameRound}
            </span>
          </h1>
        </div>
        <button
          className="scoreboard-info__image"
          onClick={() => setIsInfoModalOpen(!isInfoModalOpen)}
        >
          <img
            src={`/images/buttons/info-button.webp`}
            alt="Scoreboard"
            width={"100%"}
            style={{ zIndex: 2 }}
          />
        </button>
      </div>
    </div>
  );
};
export default Scoreboard;

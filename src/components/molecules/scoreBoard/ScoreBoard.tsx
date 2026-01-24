import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AvatarImage from "@/components/atoms/avatarImage/AvatarImage";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { useGameContext } from "@/hooks/useGameContext";
import type { GameRoom, Player } from "@/types/gameTypes";
import { returnToLobby } from "@/services/webSocketService";

interface ScoreboardProps {
  roundHasEnded?: boolean;
  setRoundHasEnded?: (val: boolean) => void;
  isInfoModalOpen?: boolean;
  setIsInfoModalOpen?: (val: boolean) => void;
  gameRoom?: GameRoom;
  gameRound?: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  //   roundHasEnded,
  //   setRoundHasEnded,
  isInfoModalOpen = false,
  setIsInfoModalOpen = () => {},
  gameRoom: propGameRoom,
  gameRound: propGameRound,
}) => {
  const { setThemeStyle } = useGlobalContext();
  const { gameRoom: ctxGameRoom, gameRound: ctxGameRound } = useGameContext();
  const navigate = useNavigate();
  const [isSoundPlaying, setIsSoundPlaying] = useState(true);

  // Prefer context values, fallback to props
  const gameRoom = ctxGameRoom || propGameRoom;
  const gameRound = ctxGameRound || propGameRound;

  const goHome = () => {
    setThemeStyle("all");
    navigate("/");
  };

  const handleReturnToLobby = async () => {
    try {
      setThemeStyle("all");
      await returnToLobby();
      navigate("/game/lobby");
    } catch (error) {
      console.error("[Scoreboard] Failed to return to lobby:", error);
      navigate("/game/lobby");
    }
  };

  return (
    <div className="scoreboard">
      <button
        className="scoreboard__home-button"
        onClick={handleReturnToLobby}
        title="Return to Lobby"
      >
        <img
          src={`/images/buttons/home.png`}
          alt="Return to lobby"
          style={{ cursor: "pointer", zIndex: 2 }}
          className="scoreboard__home-image"
        />
        <p className="scoreboard__home-button-small">Lobby</p>
      </button>

      <div className="scoreboard__avatar">
        {gameRoom?.roomData?.players.length > 0 &&
          gameRoom?.roomData?.players.map((player: Player) => {
            return (
              <React.Fragment key={player?.id}>
                {player?.isReady ? (
                  <img
                    src={`/icons/player-ready.png`}
                    alt="Player ready"
                    width="60px"
                    style={{ zIndex: 2 }}
                  />
                ) : (
                  <AvatarImage
                    src={player?.avatar || ""}
                    display="mini"
                    playerReady={player?.isReady || false}
                  />
                )}
                <span
                  className="scoreboard__names"
                  style={{ marginLeft: "8px", zIndex: 2 }}
                >
                  {player?.name}
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
          onClick={() =>
            setIsInfoModalOpen && setIsInfoModalOpen(!isInfoModalOpen)
          }
        >
          <img
            src={`/images/buttons/info-button.webp`}
            alt="Scoreboard"
            width={"100%"}
            style={{ zIndex: 2 }}
          />
        </button>
        <button className="scoreboard-audio__button">
          <img
            src={
              isSoundPlaying
                ? "/images/buttons/audio.png"
                : "/images/buttons/mute.png"
            }
            alt="Sound Toggle"
            width={"100%"}
            style={{ zIndex: 2 }}
            onClick={() => setIsSoundPlaying(!isSoundPlaying)}
            className="scoreboard-audio__image"
          />
        </button>
      </div>
    </div>
  );
};
export default Scoreboard;

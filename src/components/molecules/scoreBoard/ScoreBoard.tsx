import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AvatarImage from "@/components/atoms/avatarImage/AvatarImage";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { useGameContext } from "@/hooks/useGameContext";
import type { GameRoom, Player } from "@/types/gameTypes";
import type { ScoreboardProps } from "@/types/types";
import {
  returnToLobby,
  getWebSocketInstance,
} from "@/services/webSocketService";
import { sendPlayerLeaves } from "@/utils/gameMessageUtils";

const Scoreboard: React.FC<ScoreboardProps> = ({
  //   roundHasEnded,
  //   setRoundHasEnded,
  isInfoModalOpen = false,
  setIsInfoModalOpen = () => {},
  gameRoom: propGameRoom,
  gameRound: propGameRound,
}) => {
  const { setThemeStyle } = useGlobalContext();
  const {
    gameRoom: ctxGameRoom,
    gameRound: ctxGameRound,
    resetGameState,
  } = useGameContext();
  const navigate = useNavigate();
  const [isSoundPlaying, setIsSoundPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { room: roomId } = useParams<{ room: string }>();

  // Prefer context values, fallback to props
  const gameRoom = ctxGameRoom || propGameRoom;
  const gameRound = ctxGameRound || propGameRound;

  const handleReturnToLobby = async () => {
    try {
      setThemeStyle("all");

      // Send playerLeaves message BEFORE switching rooms to notify other players
      const socket = getWebSocketInstance();
      if (socket && roomId) {
        sendPlayerLeaves(socket, roomId);
      }

      // Reset all game state so next game starts fresh
      resetGameState?.();

      // Small delay to ensure message is sent before switching
      await new Promise((resolve) => setTimeout(resolve, 100));

      await returnToLobby();
      // Use replace: true to remove game page from history
      // This way back button won't return to the game
      navigate("/game/lobby", { replace: true });
    } catch (error) {
      console.error("[Scoreboard] Failed to return to lobby:", error);
      navigate("/game/lobby", { replace: true });
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {}, [JSON.stringify(gameRoom?.roomData)]);

  // Auto-play music when component mounts
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {
        // Auto-play blocked by browser, user needs to interact first
        setIsSoundPlaying(false);
      });
    }
  }, []);

  // Control play/pause based on isSoundPlaying state
  useEffect(() => {
    if (audioRef.current) {
      if (isSoundPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isSoundPlaying]);

  return (
    <div className="scoreboard" role="region" aria-label="Game scoreboard">
      <audio ref={audioRef} src="/audio/music.mp3" loop aria-hidden="true" />
      <button
        className="scoreboard__home-button"
        onClick={() => handleReturnToLobby()}
        aria-label="Return to lobby"
      >
        <img
          src={`/images/buttons/home.webp`}
          alt=""
          style={{ cursor: "pointer", zIndex: 2 }}
          className="scoreboard__home-image"
          aria-hidden="true"
        />
        <p className="scoreboard__home-button-small" aria-hidden="true">
          Lobby
        </p>
      </button>

      <div
        className="scoreboard__avatar"
        role="list"
        aria-label="Players in game"
      >
        {gameRoom?.roomData?.players.length > 0 &&
          gameRoom?.roomData?.players.map((player: Player) => {
            return (
              <React.Fragment key={player?.id}>
                {player?.isReady ? (
                  <img
                    src={`/icons/player-ready.webp`}
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
        <div className="scoreboard-timer" aria-live="polite">
          <h1>
            <span className="scoreboard__score-numeric" style={{ zIndex: 2 }}>
              Round {gameRound}
            </span>
          </h1>
        </div>
        <button
          className="scoreboard-info__image"
          onClick={(e) => {
            e.stopPropagation();
            if (setIsInfoModalOpen) {
              setIsInfoModalOpen(!isInfoModalOpen);
            }
          }}
          aria-label="Open how to play instructions"
          aria-expanded={isInfoModalOpen}
        >
          <img
            src={`/images/buttons/info-button.webp`}
            alt=""
            width={"100%"}
            style={{ zIndex: 2 }}
            aria-hidden="true"
          />
        </button>
        <button
          className="scoreboard-audio__button"
          onClick={() => setIsSoundPlaying(!isSoundPlaying)}
          aria-label={
            isSoundPlaying ? "Mute background music" : "Unmute background music"
          }
          aria-pressed={isSoundPlaying}
        >
          <img
            src={
              isSoundPlaying
                ? "/images/buttons/audio.webp"
                : "/images/buttons/mute.webp"
            }
            alt=""
            width={"100%"}
            style={{ zIndex: 2 }}
            className="scoreboard-audio__image"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
};

export default Scoreboard;

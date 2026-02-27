import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AvatarImage from "@/components/atoms/avatarImage/AvatarImage";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { useGameContext } from "@/hooks/useGameContext";
import type { Player } from "@/types/gameTypes";
import type { ScoreboardProps } from "@/types/types";
import {
  returnToLobby,
  getWebSocketInstance,
} from "@/services/webSocketService";
import { sendPlayerLeaves } from "@/utils/gameMessageUtils";
import RotatingScore from "@/components/atoms/rotatingScore/RotatingScore";
import SoundControl from "@/components/atoms/soundControl/SoundControl";

const Scoreboard: React.FC<ScoreboardProps> = ({
  isInfoModalOpen = false,
  setIsInfoModalOpen = () => {},
  gameRoom: propGameRoom,
  gameRound: propGameRound,
}) => {
  const { setThemeStyle, sfxVolume, setSfxVolume, sfxMuted, setSfxMuted } = useGlobalContext();
  const {
    gameRoom: ctxGameRoom,
    gameRound: ctxGameRound,
    resetGameState,
  } = useGameContext();
  const navigate = useNavigate();
  const [isSoundPlaying, setIsSoundPlaying] = useState(true);
  const [isVolumeControlOpen, setIsVolumeControlOpen] = useState(false);
  const [volume, setVolume] = useState(20);
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
      audioRef.current.volume = volume / 100;
      audioRef.current.play().catch(() => {
        // Auto-play blocked by browser, user needs to interact first
        setIsSoundPlaying(false);
      });
    }
  }, [volume]);

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

  // Handle volume changes from VolumeControl
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100; // Convert 0-100 to 0-1
    }

    // Update play state based on volume
    if (newVolume === 0) {
      setIsSoundPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else if (!isSoundPlaying && newVolume > 0) {
      setIsSoundPlaying(true);
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Handle SFX volume changes from SoundControl
  const handleSfxVolumeChange = (newVolume: number) => {
    setSfxVolume(newVolume);
    if (newVolume === 0) {
      setSfxMuted(true);
    } else if (sfxMuted) {
      setSfxMuted(false);
    }
  };

  return (
    <div className="scoreboard" role="region" aria-label="Game scoreboard">
      <audio ref={audioRef} src="/audio/music.mp3" loop aria-hidden="true" />
      <button
        className="scoreboard__home-button"
        onClick={() => handleReturnToLobby()}
        aria-label="Return to lobby"
        tabIndex={0}
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
              <div
                key={player?.id}
                role="listitem"
                aria-label={`${player?.name || "Player"}: ${player?.score ?? 0} followers`}
              >
                {player?.isReady ? (
                  <img
                    src={`/icons/player-ready.webp`}
                    alt={`${player?.name || "Player"} is ready`}
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
                <RotatingScore player={player} />
              </div>
            );
          })}
      </div>
      <div style={{ zIndex: 2 }} className="scoreboard-right__container ">
        <span className="scoreboard__score-numeric" style={{ zIndex: 2 }}>
          Round {gameRound}
        </span>

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
          tabIndex={0}
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
          onClick={() => setIsVolumeControlOpen(!isVolumeControlOpen)}
          aria-label={
            isSoundPlaying ? "Mute background music" : "Unmute background music"
          }
          aria-pressed={isSoundPlaying}
          tabIndex={0}
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
      <SoundControl
        isOpen={isVolumeControlOpen}
        onClose={() => setIsVolumeControlOpen(false)}
        onMusicVolumeChange={handleVolumeChange}
        initialMusicVolume={volume}
        isMusicPlaying={isSoundPlaying}
        setIsMusicPlaying={setIsSoundPlaying}
        onSfxVolumeChange={handleSfxVolumeChange}
        initialSfxVolume={sfxVolume}
        isSfxMuted={sfxMuted}
        setIsSfxMuted={setSfxMuted}
      />
    </div>
  );
};

export default Scoreboard;

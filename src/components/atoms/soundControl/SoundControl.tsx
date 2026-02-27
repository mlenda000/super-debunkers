import { useState, useRef, useEffect, useCallback } from "react";
import "./styles/sound-control.css";

interface SoundControlProps {
  isOpen: boolean;
  onClose: () => void;
  // Music
  onMusicVolumeChange?: (volume: number) => void;
  initialMusicVolume?: number;
  isMusicPlaying: boolean;
  setIsMusicPlaying: (playing: boolean) => void;
  // SFX
  onSfxVolumeChange?: (volume: number) => void;
  initialSfxVolume?: number;
  isSfxMuted: boolean;
  setIsSfxMuted: (muted: boolean) => void;
  // Layout
  position?: { top: number; right: number };
}

const SoundControl = ({
  isOpen,
  onClose,
  onMusicVolumeChange,
  initialMusicVolume = 20,
  isMusicPlaying,
  setIsMusicPlaying,
  onSfxVolumeChange,
  initialSfxVolume = 20,
  isSfxMuted,
  setIsSfxMuted,
  position,
}: SoundControlProps) => {
  const [musicVolume, setMusicVolume] = useState(initialMusicVolume);
  const [sfxVolume, setSfxVolume] = useState(initialSfxVolume);
  const controlRef = useRef<HTMLDivElement>(null);
  const musicMuteRef = useRef<HTMLButtonElement>(null);

  // Focus the first mute button when the control opens
  useEffect(() => {
    if (isOpen && musicMuteRef.current) {
      musicMuteRef.current.focus();
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        controlRef.current &&
        event.target &&
        !controlRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // --- Music helpers ---
  const updateMusicVolume = useCallback(
    (newVolume: number) => {
      const clamped = Math.max(0, Math.min(100, newVolume));
      setMusicVolume(clamped);
      onMusicVolumeChange?.(clamped);

      if (clamped === 0) {
        setIsMusicPlaying(false);
      } else if (!isMusicPlaying) {
        setIsMusicPlaying(true);
      }
    },
    [onMusicVolumeChange, isMusicPlaying, setIsMusicPlaying],
  );

  const handleMusicMuteToggle = () => {
    if (isMusicPlaying) {
      setMusicVolume(0);
      setIsMusicPlaying(false);
      onMusicVolumeChange?.(0);
    } else {
      const restored = initialMusicVolume || 20;
      setMusicVolume(restored);
      setIsMusicPlaying(true);
      onMusicVolumeChange?.(restored);
    }
  };

  // --- SFX helpers ---
  const updateSfxVolume = useCallback(
    (newVolume: number) => {
      const clamped = Math.max(0, Math.min(100, newVolume));
      setSfxVolume(clamped);
      onSfxVolumeChange?.(clamped);

      if (clamped === 0) {
        setIsSfxMuted(true);
      } else if (isSfxMuted) {
        setIsSfxMuted(false);
      }
    },
    [onSfxVolumeChange, isSfxMuted, setIsSfxMuted],
  );

  const handleSfxMuteToggle = () => {
    if (!isSfxMuted) {
      setSfxVolume(0);
      setIsSfxMuted(true);
      onSfxVolumeChange?.(0);
    } else {
      const restored = initialSfxVolume || 20;
      setSfxVolume(restored);
      setIsSfxMuted(false);
      onSfxVolumeChange?.(restored);
    }
  };

  // Generic keyboard handler for sliders
  const makeSliderKeyDown =
    (update: (v: number) => void, current: number) =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const step = e.shiftKey ? 10 : 5;
      if (
        ["ArrowUp", "ArrowRight", "+", "="].includes(e.key)
      ) {
        e.preventDefault();
        update(current + step);
      } else if (
        ["ArrowDown", "ArrowLeft", "-", "_"].includes(e.key)
      ) {
        e.preventDefault();
        update(current - step);
      }
    };

  if (!isOpen) return null;

  return (
    <div
      className="volume-slider-popup"
      ref={controlRef}
      style={position}
      role="group"
      aria-label="Volume controls"
    >
      {/* Music row */}
      <div className="volume-slider-row">
        <span className="volume-label">Music</span>
        <button
          ref={musicMuteRef}
          onClick={handleMusicMuteToggle}
          className="volume-button"
          aria-label={isMusicPlaying ? "Mute music" : "Unmute music"}
          aria-pressed={isMusicPlaying}
          tabIndex={0}
        >
          <img
            src={
              isMusicPlaying
                ? "/images/buttons/audio.webp"
                : "/images/buttons/mute.webp"
            }
            alt=""
            className="volume-icon"
            aria-hidden="true"
          />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={musicVolume}
          onChange={(e) => updateMusicVolume(parseInt(e.target.value))}
          onKeyDown={makeSliderKeyDown(updateMusicVolume, musicVolume)}
          className="volume-slider"
          aria-label={`Music volume: ${musicVolume}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={musicVolume}
          aria-valuetext={`${musicVolume} percent`}
          tabIndex={0}
        />
      </div>

      {/* SFX row */}
      <div className="volume-slider-row">
        <span className="volume-label">SFX</span>
        <button
          onClick={handleSfxMuteToggle}
          className="volume-button"
          aria-label={isSfxMuted ? "Unmute sound effects" : "Mute sound effects"}
          aria-pressed={!isSfxMuted}
          tabIndex={0}
        >
          <img
            src={
              isSfxMuted
                ? "/images/buttons/mute.webp"
                : "/images/buttons/audio.webp"
            }
            alt=""
            className="volume-icon"
            aria-hidden="true"
          />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={sfxVolume}
          onChange={(e) => updateSfxVolume(parseInt(e.target.value))}
          onKeyDown={makeSliderKeyDown(updateSfxVolume, sfxVolume)}
          className="volume-slider"
          aria-label={`Sound effects volume: ${sfxVolume}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sfxVolume}
          aria-valuetext={`${sfxVolume} percent`}
          tabIndex={0}
        />
      </div>
    </div>
  );
};

export default SoundControl;

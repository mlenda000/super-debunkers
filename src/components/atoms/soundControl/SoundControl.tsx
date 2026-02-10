import { useState, useRef, useEffect, useCallback } from "react";
import "./styles/sound-control.css";

interface SoundControlProps {
  isOpen: boolean;
  onClose: () => void;
  onVolumeChange?: (volume: number) => void;
  initialVolume?: number;
  position?: { top: number; right: number };
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

const SoundControl = ({
  isOpen,
  onClose,
  onVolumeChange,
  initialVolume = 20,
  position,
  isMuted,
  setIsMuted,
}: SoundControlProps) => {
  const [volume, setVolume] = useState(initialVolume);
  const controlRef = useRef<HTMLDivElement>(null);
  const muteButtonRef = useRef<HTMLButtonElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  // Focus the mute button when the control opens
  useEffect(() => {
    if (isOpen && muteButtonRef.current) {
      muteButtonRef.current.focus();
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
      // Small delay to prevent immediate close on mobile due to event propagation
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

  const updateVolume = useCallback(
    (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(100, newVolume));
      setVolume(clampedVolume);
      if (onVolumeChange) {
        onVolumeChange(clampedVolume);
      }

      // Update mute state based on volume
      if (clampedVolume === 0) {
        setIsMuted(false);
      } else if (!isMuted) {
        setIsMuted(true);
      }
    },
    [onVolumeChange, isMuted, setIsMuted],
  );

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    updateVolume(newVolume);
  };

  // Handle keyboard controls for volume - works on the entire component
  const handleComponentKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 5; // Larger step with shift key

      switch (e.key) {
        case "ArrowUp":
        case "ArrowRight":
        case "+":
        case "=":
          e.preventDefault();
          updateVolume(volume + step);
          break;
        case "ArrowDown":
        case "ArrowLeft":
        case "-":
        case "_":
          e.preventDefault();
          updateVolume(volume - step);
          break;
      }
    },
    [volume, updateVolume],
  );

  // Handle keyboard controls for volume slider
  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const step = e.shiftKey ? 10 : 5; // Larger step with shift key

    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight":
      case "+":
      case "=":
        e.preventDefault();
        updateVolume(volume + step);
        break;
      case "ArrowDown":
      case "ArrowLeft":
      case "-":
      case "_":
        e.preventDefault();
        updateVolume(volume - step);
        break;
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      // Currently playing, so mute it
      setVolume(0);
      setIsMuted(false);
      if (onVolumeChange) {
        onVolumeChange(0);
      }
    } else {
      // Currently muted, so unmute it
      const newVolume = initialVolume || 20;
      setVolume(newVolume);
      setIsMuted(true);
      if (onVolumeChange) {
        onVolumeChange(newVolume);
      }
    }
  };

  // Handle keyboard activation of mute button (also supports volume keys)
  const handleMuteKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleMuteToggle();
    }
    // Volume keys are handled by the parent onKeyDown
  };

  if (!isOpen) return null;

  return (
    <div
      className="volume-slider-popup"
      ref={controlRef}
      style={position}
      role="group"
      aria-label="Volume controls"
      onKeyDown={handleComponentKeyDown}
    >
      <button
        ref={muteButtonRef}
        onClick={handleMuteToggle}
        onKeyDown={handleMuteKeyDown}
        className="volume-button"
        aria-label={isMuted ? "Mute audio" : "Unmute audio"}
        aria-pressed={!isMuted}
        tabIndex={0}
      >
        <img
          src={
            !isMuted
              ? "/images/buttons/mute.webp"
              : "/images/buttons/audio.webp"
          }
          alt=""
          className="volume-icon"
          aria-hidden="true"
        />
      </button>
      <input
        ref={sliderRef}
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={handleVolumeChange}
        onKeyDown={handleSliderKeyDown}
        className="volume-slider"
        aria-label={`Volume: ${volume}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={volume}
        aria-valuetext={`${volume} percent`}
        tabIndex={0}
      />
    </div>
  );
};

export default SoundControl;

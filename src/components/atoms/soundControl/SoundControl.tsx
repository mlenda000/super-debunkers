import { useState, useRef, useEffect } from "react";
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

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        controlRef.current &&
        event.target &&
        !controlRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }

    // Update mute state based on volume
    if (newVolume === 0) {
      setIsMuted(false);
    } else if (!isMuted) {
      setIsMuted(true);
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

  if (!isOpen) return null;

  return (
    <div className="volume-slider-popup" ref={controlRef} style={position}>
      <button onClick={handleMuteToggle} className="volume-button">
        <img
          src={
            !isMuted
              ? "/images/buttons/mute.webp"
              : "/images/buttons/audio.webp"
          }
          alt={isMuted ? "Unmute" : "Mute"}
          className="volume-icon"
        />
      </button>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={handleVolumeChange}
        className="volume-slider"
        aria-label="Volume slider"
      />
    </div>
  );
};

export default SoundControl;

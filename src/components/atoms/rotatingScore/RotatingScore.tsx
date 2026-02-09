import { useState, useEffect, useRef } from "react";
import type { Player } from "@/types/gameTypes";

const RotatingScore = ({ player }: { player: Player }) => {
  const [showName, setShowName] = useState(true);
  const [fadeClass, setFadeClass] = useState("fade-in");
  const [displayScore, setDisplayScore] = useState(player?.score ?? 0);
  const prevScoreRef = useRef(player?.score ?? 0);

  // Update display score when player score changes
  useEffect(() => {
    const currentScore = player?.score ?? 0;
    if (currentScore !== prevScoreRef.current) {
      // Score changed - update display and briefly show score
      setDisplayScore(currentScore);
      prevScoreRef.current = currentScore;
      // Show the score immediately when it changes
      setShowName(false);
      setFadeClass("scoring-fade-in");
    }
  }, [player?.score]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger fade out
      setFadeClass("scoring-fade-out");

      // After fade out completes, switch content and fade in
      setTimeout(() => {
        setShowName((prev) => !prev);
        setFadeClass("scoring-fade-in");
      }, 300); // Match this to CSS transition duration
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="scoring-container"
      style={{ marginLeft: "8px", zIndex: 2 }}
    >
      <span
        className={`scoreboard__names scoring-content ${fadeClass} ${showName ? "active" : ""}`}
      >
        {player?.name}
      </span>
      <span
        className={`scoreboard__names scoring-content ${fadeClass} ${!showName ? "active" : ""}`}
      >
        {displayScore}
      </span>
    </span>
  );
};

export default RotatingScore;

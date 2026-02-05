import { useState, useEffect } from "react";
import type { Player } from "@/types/gameTypes";

const RotatingScore = ({ player }: { player: Player }) => {
  const [showName, setShowName] = useState(true);
  const [fadeClass, setFadeClass] = useState("fade-in");

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
        {player?.score}
      </span>
    </span>
  );
};

export default RotatingScore;

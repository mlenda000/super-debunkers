import { useState, useEffect, useRef } from "react";
import { useGameContext } from "@/hooks/useGameContext";
import type { ResultModalProps } from "@/types/types";
import Tool from "@/components/molecules/tool/Tool"; // Assuming Tool is a component you want to show in the modal

const ResultModal = ({
  setRoundEnd,
  setShowResponseModal,
}: ResultModalProps) => {
  const { activeNewsCard, lastScoreUpdatePlayers } = useGameContext();
  const [showComponents, setShowComponents] = useState(false);
  const hasAdvancedRef = useRef(false);

  useEffect(() => {
    // Show components after 4.3 seconds
    const componentTimer = setTimeout(() => {
      setShowComponents(true);
    }, 4300);

    return () => {
      clearTimeout(componentTimer);
    };
  }, []);

  // Check if we have valid scoring data (not just players, but actual wasCorrect field)
  const hasValidScoringData =
    lastScoreUpdatePlayers &&
    lastScoreUpdatePlayers.length > 0 &&
    lastScoreUpdatePlayers.some((p) => typeof p.wasCorrect !== "undefined");

  useEffect(() => {
    // Prevent advancing multiple times
    if (hasAdvancedRef.current) return;

    // Wait for scoring data to arrive AND give user time to see the result
    // 9 seconds to show the influencer and tactics used, then advance when data is ready
    const minDisplayTime = 9000;

    const advanceTimer = setTimeout(() => {
      if (hasValidScoringData && !hasAdvancedRef.current) {
        hasAdvancedRef.current = true;
        setRoundEnd(false);
        setShowResponseModal(true);
      }
    }, minDisplayTime);

    // Max wait of 15 seconds regardless of data
    const maxWaitTimer = setTimeout(() => {
      if (!hasAdvancedRef.current) {
        hasAdvancedRef.current = true;
        setRoundEnd(false);
        setShowResponseModal(true);
      }
    }, 15000);

    return () => {
      clearTimeout(advanceTimer);
      clearTimeout(maxWaitTimer);
    };
  }, [hasValidScoringData, setRoundEnd, setShowResponseModal]);

  return (
    <div
      className="result-modal__overlay"
      style={{ zIndex: 100 }}
      role="dialog"
      aria-modal="true"
      aria-label="Round results showing detected misinformation tactics"
    >
      <div className="result-modal__content ">
        <Tool showResults={showComponents} currentInfluencer={activeNewsCard} />
      </div>
    </div>
  );
};
export default ResultModal;

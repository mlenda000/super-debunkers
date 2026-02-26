import { useState, useEffect, useRef, useCallback } from "react";
import { useGameContext } from "@/hooks/useGameContext";
import { useModalFade } from "@/hooks/useModalFade";
import type { ResultModalProps } from "@/types/types";
import Tool from "@/components/molecules/tool/Tool";

const ResultModal = ({
  setRoundEnd,
  setShowResponseModal,
}: ResultModalProps) => {
  const { previousNewsCard, activeNewsCard, lastScoreUpdatePlayers } =
    useGameContext();
  // Show the card from the round that just ended, not the upcoming one
  const displayCard = previousNewsCard ?? activeNewsCard;
  const [showComponents, setShowComponents] = useState(false);
  const hasAdvancedRef = useRef(false);

  const handleDismiss = useCallback(() => {
    hasAdvancedRef.current = true;
    setRoundEnd(false);
    setShowResponseModal(true);
  }, [setRoundEnd, setShowResponseModal]);

  const { isClosing, startClose } = useModalFade(handleDismiss);

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
        startClose();
      }
    }, minDisplayTime);

    // Max wait of 15 seconds regardless of data
    const maxWaitTimer = setTimeout(() => {
      if (!hasAdvancedRef.current) {
        startClose();
      }
    }, 15000);

    return () => {
      clearTimeout(advanceTimer);
      clearTimeout(maxWaitTimer);
    };
  }, [hasValidScoringData, startClose]);

  return (
    <div
      className={`result-modal__overlay${isClosing ? " result-modal__overlay--closing" : ""}`}
      style={{ zIndex: 100 }}
      role="dialog"
      aria-modal="true"
      aria-label="Round results showing detected misinformation tactics"
    >
      <div className="result-modal__content ">
        <Tool showResults={showComponents} currentInfluencer={displayCard} />
      </div>
    </div>
  );
};
export default ResultModal;

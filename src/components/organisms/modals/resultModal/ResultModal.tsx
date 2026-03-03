import { useState, useEffect } from "react";
import { useGameContext } from "@/hooks/useGameContext";
import Tool from "@/components/molecules/tool/Tool"; // Assuming Tool is a component you want to show in the modal

interface ResultModalProps {
  setRoundEnd: (value: boolean) => void;
  setShowResponseModal: (value: boolean) => void;
}

const ResultModal = ({
  setRoundEnd,
  setShowResponseModal,
}: ResultModalProps) => {
  const { activeNewsCard, lastScoreUpdatePlayers } = useGameContext();
  const [showComponents, setShowComponents] = useState(false);

  useEffect(() => {
    // Show components after 4.3 seconds
    const componentTimer = setTimeout(() => {
      setShowComponents(true);
    }, 4300);

    return () => {
      clearTimeout(componentTimer);
    };
  }, []);

  useEffect(() => {
    // Wait for scoring data to arrive OR 10 seconds max, whichever comes first
    const advanceTimer = setTimeout(() => {
      setRoundEnd(false);
      setShowResponseModal(true);
    }, 10000);

    // If scoring data arrives early, advance immediately
    if (lastScoreUpdatePlayers && lastScoreUpdatePlayers.length > 0) {
      setRoundEnd(false);
      setShowResponseModal(true);
      return () => clearTimeout(advanceTimer);
    }

    return () => clearTimeout(advanceTimer);
  }, [lastScoreUpdatePlayers, setRoundEnd, setShowResponseModal]);

  return (
    <div className="result-modal__overlay" style={{ zIndex: 100 }}>
      <div className="result-modal__content ">
        <Tool showResults={showComponents} currentInfluencer={activeNewsCard} />
      </div>
    </div>
  );
};
export default ResultModal;

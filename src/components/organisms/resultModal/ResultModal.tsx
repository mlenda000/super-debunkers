import { useState, useEffect } from "react";

import Tool from "@/components/molecules/tool/Tool"; // Assuming Tool is a component you want to show in the modal

interface ResultModalProps {
  setRoundEnd?: (value: boolean) => void;
  setShowResponseModal?: (value: boolean) => void;
}

const ResultModal = ({
  setRoundEnd,
  setShowResponseModal,
}: ResultModalProps = {}) => {
  const [showComponents, setShowComponents] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRoundEnd?.(false);
      setShowResponseModal?.(true);
    }, 9000);
    const componentTimer = setTimeout(() => {
      setShowComponents(true);
    }, 4300);

    return () => {
      clearTimeout(timer);
      clearTimeout(componentTimer);
    };
  }, [setRoundEnd, setShowResponseModal]);

  return (
    <div className="result-modal__overlay" style={{ zIndex: 100 }}>
      <div className="result-modal__content ">
        <Tool showResults={showComponents} />
      </div>
    </div>
  );
};
export default ResultModal;

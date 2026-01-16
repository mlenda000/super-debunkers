import React, { useState, useEffect } from "react";

import Tool from "@/components/molecules/tool/Tool"; // Assuming Tool is a component you want to show in the modal

const ResultModal = () => {
  const [showComponents, setShowComponents] = useState(false);

  //   useEffect(() => {
  //     const timer = setTimeout(() => {
  //       dispatch(setRoundEnd(false));
  //       dispatch(setShowResponseModal(true));
  //     }, 9000);
  //     const componentTimer = setTimeout(() => {
  //       setShowComponents(true);
  //     }, 4300);

  //     return () => {
  //       clearTimeout(timer);
  //       clearTimeout(componentTimer);
  //     };
  //   }, [dispatch]);

  return (
    <div className="result-modal__overlay" style={{ zIndex: 100 }}>
      <div className="result-modal__content ">
        <Tool showResults={showComponents} />
      </div>
    </div>
  );
};
export default ResultModal;

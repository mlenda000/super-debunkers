import { useEffect, useRef } from "react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
}

const InfoModal = ({ isOpen, onClose }: InfoModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      // Ignore clicks on the info button
      if (target.closest(".scoreboard-info__image")) {
        return;
      }
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div className="info-modal__overlay" />
      <div className="info-modal">
        <div className="info-modal__content" ref={modalRef}>
        <button className="info-modal__close" onClick={() => onClose(false)}>
          <img src="/images/buttons/close.webp" alt="Close" />
        </button>
        <h1 className="info-modal__title">How to play</h1>
        <ol>
          <li>
            You’ll see a <span style={{ fontWeight: 900 }}>news card</span> and
            need to decide if it’s{" "}
            <span style={{ fontWeight: 900 }}>real or fake.</span>
          </li>
          <li>
            If you think it’s <span style={{ fontWeight: 900 }}>fake</span>, try
            to <span style={{ fontWeight: 900 }}>guess which trick</span> is
            being used by picking a{" "}
            <span style={{ fontWeight: 900 }}>card below</span>!
          </li>
          <li>
            If you think the{" "}
            <span style={{ fontWeight: 900 }}>news card is real</span>, pick the{" "}
            <span style={{ fontWeight: 900 }}>“Facts” card</span>.
          </li>
          <li>
            Look for the <span style={{ fontWeight: 900 }}>“eye”</span> symbols
            at the bottom right of each news card — they{" "}
            <span style={{ fontWeight: 900 }}>show how many tricks</span> are
            being used.
          </li>
          <li>
            If you <span style={{ fontWeight: 900 }}>guess wrong</span>, you’ll
            <span style={{ fontWeight: 900 }}>lose followers</span> and if you
            <span style={{ fontWeight: 900 }}>guess right</span>, you’ll{" "}
            <span style={{ fontWeight: 900 }}>gain</span>
            more <span style={{ fontWeight: 900 }}>followers!</span>
          </li>
          <li>
            <span style={{ fontWeight: 900 }}>The player</span> with the{" "}
            <span style={{ fontWeight: 900 }}>most followers</span> at the end{" "}
            <span style={{ fontWeight: 900 }}>wins!</span>
          </li>
        </ol>
        </div>
      </div>
    </>
  );
};

export default InfoModal;

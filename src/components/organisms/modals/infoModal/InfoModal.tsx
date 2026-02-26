import { useEffect, useRef, useCallback } from "react";
import { useModalFade } from "@/hooks/useModalFade";
import type { InfoModalProps } from "@/types/types";

const InfoModal = ({ isOpen, onClose }: InfoModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleDismiss = useCallback(() => onClose(false), [onClose]);
  const { isClosing, startClose } = useModalFade(handleDismiss);

  // Focus the close button when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        startClose();
      }
    },
    [startClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as HTMLElement;
      // Ignore clicks on the info button
      if (target.closest(".scoreboard-info__image")) {
        return;
      }
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        startClose();
      }
    }

    if (isOpen) {
      // Small delay to prevent immediate close on mobile
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
  }, [isOpen, startClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`info-modal__overlay${isClosing ? " info-modal__overlay--closing" : ""}`}
        aria-hidden="true"
      />
      <div
        className={`info-modal${isClosing ? " info-modal--closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
      >
        <div className="info-modal__content" ref={modalRef}>
          <button
            ref={closeButtonRef}
            className="info-modal__close"
            onClick={() => startClose()}
            aria-label="Close how to play instructions"
            tabIndex={0}
          >
            <img src="/images/buttons/close.webp" alt="" aria-hidden="true" />
          </button>
          <h1 id="info-modal-title" className="info-modal__title">
            How to play
          </h1>
          <ol>
            <li>
              You’ll see a <span style={{ fontWeight: 900 }}>news card</span>{" "}
              and need to decide if it’s{" "}
              <span style={{ fontWeight: 900 }}>real or fake.</span>
            </li>
            <li>
              If you think it’s <span style={{ fontWeight: 900 }}>fake</span>,
              try to <span style={{ fontWeight: 900 }}>guess which trick</span>{" "}
              is being used by picking a{" "}
              <span style={{ fontWeight: 900 }}>card below</span>!
            </li>
            <li>
              If you think the{" "}
              <span style={{ fontWeight: 900 }}>news card is real</span>, pick
              the <span style={{ fontWeight: 900 }}>“Facts” card</span>.
            </li>
            <li>
              Look for the <span style={{ fontWeight: 900 }}>“eye”</span>{" "}
              symbols at the bottom right of each news card — they{" "}
              <span style={{ fontWeight: 900 }}>show how many tricks</span> are
              being used.
            </li>
            <li>
              If you <span style={{ fontWeight: 900 }}>guess wrong</span>,
              you’ll{" "}
              <span style={{ fontWeight: 900 }}>
                lose 50 followers for each wrong guess,
              </span>{" "}
              and if you <span style={{ fontWeight: 900 }}>guess right</span>,
              you’ll <span style={{ fontWeight: 900 }}>gain </span>
              100 more <span style={{ fontWeight: 900 }}>followers!</span>
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

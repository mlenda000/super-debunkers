import { useState, useCallback, useRef } from "react";

const FADE_DURATION = 300; // matches modal-fade-out 0.3s

/**
 * Hook that manages a "closing" CSS class so modals can fade out
 * before they actually unmount / hide.
 *
 * Usage:
 *   const { isClosing, startClose } = useModalFade(onDismiss);
 *   // Add `${isClosing ? " round-modal__overlay--closing" : ""}` to overlay className
 *   // Call `startClose()` instead of `onDismiss()` directly
 */
export function useModalFade(onDismiss: () => void) {
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startClose = useCallback(() => {
    if (isClosing) return; // already closing
    setIsClosing(true);
    timerRef.current = setTimeout(() => {
      setIsClosing(false);
      onDismiss();
    }, FADE_DURATION);
  }, [isClosing, onDismiss]);

  // Cleanup if component unmounts mid-fade
  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsClosing(false);
  }, []);

  return { isClosing, startClose, cancel };
}

import { useGameContext } from "@/hooks/useGameContext";
import { useEffect } from "react";

interface ResponseModalProps {
  setShowScoreCard: (value: boolean) => void;
  setShowResponseModal: (value: boolean) => void;
}

interface ResponseMessage {
  wasCorrect?: boolean;
  streak?: number;
  hasStreak?: boolean;
}

const ResponseModal = ({
  setShowScoreCard,
  setShowResponseModal,
}: ResponseModalProps) => {
  const context = useGameContext();
  const responseMsg: ResponseMessage =
    context && typeof context === "object" && "responseMsg" in context
      ? (context as unknown as Record<string, ResponseMessage>).responseMsg
      : { wasCorrect: true, streak: 0, hasStreak: false };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScoreCard(true);
      setShowResponseModal(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [setShowScoreCard, setShowResponseModal]);

  return (
    <div className="round-modal__overlay" style={{ zIndex: 100 }}>
      <div className="response-modal__content ">
        <h1 className="response-modal__title">
          {responseMsg?.hasStreak
            ? "WIN STREAK!"
            : responseMsg?.wasCorrect
              ? "DEBUNKED!"
              : "OOPS!"}
        </h1>
        <h3 className="response-modal__subtitle">
          {responseMsg?.hasStreak
            ? `YOU DEBUNKED ${responseMsg?.streak} IN A ROW`
            : responseMsg?.wasCorrect
              ? "YOU NAILED IT"
              : "YOU'LL GET THEM NEXT TIME"}
        </h3>
      </div>
    </div>
  );
};
export default ResponseModal;

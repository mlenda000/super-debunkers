import PlayedCard from "../playedCard/PlayedCard";

interface PlayAreaProps {
  items: any[];
  finishRound: boolean;
  playerReady: boolean;
  handleReturnCard: (id: string) => void;
  handlePlayerReady: () => void;
  onSelectCard?: () => void;
  isDragging?: boolean;
}

const MAX_SLOTS = 2;

const PlayArea = ({
  items,
  finishRound,
  playerReady,
  handleReturnCard,
  handlePlayerReady,
  onSelectCard,
  isDragging,
}: PlayAreaProps) => {
  const emptySlots = MAX_SLOTS - items.length;

  return (
    <div className="play-area">
      {items.map((card) => (
        <PlayedCard
          name={card?.title}
          category={card?.category}
          image={card?.image}
          alt={card?.alt}
          id={card?.id}
          key={card?.id}
          onUndo={() => handleReturnCard(card?.id)}
        />
      ))}
      {Array.from({ length: Math.max(0, emptySlots) }).map((_, i) => (
        <button
          key={`slot-${i}`}
          type="button"
          className="play-area__slot"
          onClick={onSelectCard}
          disabled={!onSelectCard}
          style={isDragging ? { pointerEvents: "none" } : undefined}
          aria-label={`Empty card slot ${i + 1} of ${MAX_SLOTS}`}
        >
          <span className="play-area__slot-text--desktop">Place Card</span>
          <span className="play-area__slot-text--mobile">Select Card</span>
        </button>
      ))}
      <button
        type="button"
        onClick={handlePlayerReady}
        className="play-area__finish-round"
        aria-label={
          playerReady
            ? "Ready"
            : finishRound
              ? "Mark ready"
              : "Place a card to get ready"
        }
      >
        <img
          src={
            !playerReady && finishRound
              ? `/images/buttons/ready-button.webp`
              : playerReady && finishRound
                ? `/images/buttons/checked-button.webp`
                : `/images/buttons/not-ready-button.webp`
          }
          alt="Ready"
          height={"auto"}
          style={{
            cursor: "pointer",
            maxWidth: "80px",
            width: "clamp(50px, 8vh, 80px)",
          }}
        />
      </button>
    </div>
  );
};

export default PlayArea;

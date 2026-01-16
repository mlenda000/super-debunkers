import { useState, useEffect, useRef, useCallback } from "react";

import { Droppable } from "@/components/atoms/droppable/Droppable";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { sendWebSocketMessage } from "@/services/webSocketService";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import MainTable from "../mainTable/MainTable";
import PlayersHand from "@/components/organisms/playersHand/PlayersHand";
import categoryCards from "@/data/tacticsCards.json";

import { useGameContext } from "@/hooks/useGameContext";

interface GameTableProps {
  setRoundEnd: (val: boolean) => void;
  roundHasEnded: boolean;
  setRoundHasEnded: (val: boolean) => void;
}

const GameTable: React.FC<GameTableProps> = ({
  setRoundEnd,
  //   roundHasEnded,
  setRoundHasEnded,
}) => {
  const { playerName } = useGlobalContext();
  const gameRoom = { roomData: [] } as any;
  const gameRound = 0;
  const currentInfluencer = null;
  const setCurrentInfluencer = () => {};

  const playersHand = Object.values(categoryCards)?.filter(
    (card) => card.image
  );
  const [mainTableItems, setMainTableItems] = useState<any[]>([]);
  const [finishRound, setFinishRound] = useState(false);
  const [submitForScoring, setSubmitForScoring] = useState(false);
  const [playersHandItems, setPlayersHandItems] = useState<any[]>(playersHand);
  const [showingHand, setShowingHand] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playersHandRef = useRef<HTMLDivElement>(null);

  const handleDrop = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over?.id == null) {
      return;
    }
    if (active.id !== over.id) {
      const activeCard = playersHandItems.find((item) => item.id === active.id);
      setPlayersHandItems((items) =>
        items.filter((item) => item.id !== active.id)
      );
      const removeStartingText = mainTableItems.filter((card) => card.id !== 1);
      setMainTableItems([...removeStartingText, activeCard]);
    }
  };

  const context = useGameContext();

  useEffect(() => {
    setFinishRound(mainTableItems.length > 0);
  }, [mainTableItems]);

  const scrollToSection = useCallback((section: "table" | "hand") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    if (section === "hand") {
      container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
      setShowingHand(true);
    } else {
      container.scrollTo({ left: 0, behavior: "smooth" });
      setShowingHand(false);
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToSection(event.key === "ArrowRight" ? "hand" : "table");
      }
    },
    [scrollToSection]
  );

  const allPlayersReady =
    Array.isArray(gameRoom?.roomData) &&
    gameRoom.roomData.length > 0 &&
    gameRoom.roomData.every(
      (player) => player?.status === true && player?.tacticUsed?.length > 0
    );

  useEffect(() => {
    if (allPlayersReady && !submitForScoring) {
      console.log(
        "All players are ready to finish the round and I am in the conditional"
      );
      setRoundHasEnded(true);
      // Moved handleFinishRound logic here
      const player = gameRoom.roomData.find((p: any) => p.name === playerName);
      console.log("Player in handleFinishRound after firing from conditional");
      sendWebSocketMessage({
        type: "endOfRound",
        players: [player],
        round: gameRound,
      });
      setRoundEnd(true);
      setSubmitForScoring(true);
      setRoundHasEnded(false);
    }
  }, [
    allPlayersReady,
    submitForScoring,
    gameRound,
    playerName,
    setRoundEnd,
    setRoundHasEnded,
    gameRoom.roomData,
  ]);

  return (
    <DndContext onDragEnd={handleDrop}>
      <div
        style={{ zIndex: 2 }}
        className="active-game-page"
        onKeyDown={handleKeyDown}
      >
        <div className="scoreboard-section">{/* <Scoreboard/> */}</div>

        {/* Mobile navigation button */}
        <button
          className="scroll-nav-button"
          onClick={() => scrollToSection(showingHand ? "table" : "hand")}
          onTouchEnd={() => scrollToSection(showingHand ? "table" : "hand")}
          aria-label={showingHand ? "View game table" : "View your cards"}
          tabIndex={0}
        >
          {showingHand ? "← Table" : "Cards →"}
        </button>

        <div
          className="game-content-scroll"
          ref={scrollContainerRef}
          role="region"
          aria-label="Game content area - use arrow keys or swipe to navigate"
          tabIndex={0}
        >
          <div className="top-section" aria-label="Game table">
            <Droppable className="main-table-droppable">
              <MainTable
                items={mainTableItems}
                round={gameRound}
                currentInfluencer={currentInfluencer}
                setCurrentInfluencer={(influencer) =>
                  setCurrentInfluencer(influencer)
                }
                finishRound={finishRound}
                setFinishRound={setFinishRound}
                setRoundEnd={setRoundEnd}
                setPlayersHandItems={setPlayersHandItems}
                mainTableItems={mainTableItems}
                setMainTableItems={setMainTableItems}
                originalItems={playersHand}
                setSubmitForScoring={setSubmitForScoring}
              />
            </Droppable>
          </div>
          <div
            className="bottom-section"
            ref={playersHandRef}
            aria-label="Your cards"
          >
            <PlayersHand items={playersHandItems} />
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default GameTable;

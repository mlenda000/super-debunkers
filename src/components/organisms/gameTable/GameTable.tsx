import { useState, useEffect, useRef, useCallback } from "react";
import { useGameContext } from "@/hooks/useGameContext";
import type { Player, NewsCard } from "@/types/gameTypes";
import type { TacticCardProps } from "@/types/types";
import { Droppable } from "@/components/atoms/droppable/Droppable";
import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { sendEndOfRound } from "@/utils/gameMessageUtils";
import { subscribeToMessages } from "@/services/webSocketService";
import MainTable from "../mainTable/MainTable";
import PlayersHand from "@/components/organisms/playersHand/PlayersHand";
import categoryCards from "@/data/tacticsCards.json";
import Scoreboard from "@/components/molecules/scoreBoard/ScoreBoard";

interface GameTableProps {
  setRoundEnd: (val: boolean) => void;
  roundEnd: boolean;
  roundHasEnded: boolean;
  setRoundHasEnded: (val: boolean) => void;
  gameRoom?: any;
}

const GameTable: React.FC<GameTableProps> = ({
  setRoundEnd,
  roundEnd,
  //   roundHasEnded,
  setRoundHasEnded,
}) => {
  const { playerName } = useGlobalContext();
  const { gameRoom, gameRound, activeNewsCard, setActiveNewsCard } =
    useGameContext();
  const currentInfluencer =
    activeNewsCard === undefined ? null : activeNewsCard;
  // Ensure setCurrentInfluencer is always a function
  const setCurrentInfluencer: (influencer: NewsCard | null) => void =
    setActiveNewsCard ?? (() => {});

  // Map playersHand to include missing 'id' and 'alt' properties for TacticCardProps
  const playersHand = Object.values(categoryCards)
    .filter((card) => card.image)
    .map((card, idx) => ({
      ...card,
      id: card.category ?? idx + 1,
      alt: card.imageAlt ?? card.title ?? "Card image",
    }));
  const [mainTableItems, setMainTableItems] = useState<typeof playersHand>([]);
  const [finishRound, setFinishRound] = useState(false);
  const [submitForScoring, setSubmitForScoring] = useState(false);
  const [playersHandItems, setPlayersHandItems] =
    useState<typeof playersHand>(playersHand);
  const [showingHand, setShowingHand] = useState(false);
  const [resetKey, setResetKey] = useState(0); // increments to signal table reset
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playersHandRef = useRef<HTMLDivElement>(null);

  // Configure sensors for mouse and touch
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDrop = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over?.id == null) {
      return;
    }
    if (active.id !== over.id) {
      const activeCard = playersHandItems.find((item) => item.id === active.id);
      if (!activeCard) return;

      setPlayersHandItems((items) =>
        items.filter((item) => item.id !== active.id)
      );
      const removeStartingText = mainTableItems.filter(
        (card) => String(card.id) !== "1"
      );
      setMainTableItems([...removeStartingText, activeCard]);
    }
  };

  const handleMoveCardToTable = useCallback(
    (cardId: string) => {
      const cardToMove = playersHandItems.find((item) => item.id === cardId);
      if (!cardToMove) return;

      // Remove from hand
      setPlayersHandItems((items) =>
        items.filter((item) => item.id !== cardId)
      );

      // Add to table (remove placeholder first)
      const removeStartingText = mainTableItems.filter(
        (card) => String(card.id) !== "1"
      );
      setMainTableItems([...removeStartingText, cardToMove]);
    },
    [playersHandItems, mainTableItems]
  );

  useEffect(() => {
    setFinishRound(mainTableItems.length > 0);
  }, [mainTableItems]);

  // Listen for server score/end-of-round messages to reset UI for all players
  useEffect(() => {
    const unsubscribe = subscribeToMessages((message) => {
      if (
        (message.type === "scoreUpdate" || message.type === "endOfRound") &&
        message.room === (gameRoom?.room || gameRoom?.roomData?.name)
      ) {
        // Show end-of-round modal and schedule reset
        setRoundEnd(true);
        // Prevent re-triggering endOfRound loop
        setSubmitForScoring(true);
        setFinishRound(false);
        setResetKey((prev) => prev + 1);
      }
    });

    return () => unsubscribe();
  }, [gameRoom?.room, gameRoom?.roomData?.name, setRoundEnd]);

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

  // All players in the room are ready and have played at least one tactic
  const allPlayersReady = Array.isArray(gameRoom?.roomData?.players)
    ? gameRoom.roomData.players.length > 0 &&
      gameRoom.roomData.players.every(
        (player) => player?.isReady === true && player?.tacticUsed?.length > 0
      )
    : false;

  useEffect(() => {
    if (allPlayersReady && !submitForScoring) {
      console.log("✅ All players ready - starting endOfRound");
      setRoundHasEnded(true);
      const players = gameRoom.roomData.players;

      const roomName = gameRoom?.room || gameRoom?.roomData?.name || "";
      sendEndOfRound(players as any, gameRound ?? 0, roomName);
      setRoundEnd(true);
      setSubmitForScoring(true);
      setRoundHasEnded(false);
      setResetKey((prev) => prev + 1);
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
    <DndContext onDragEnd={handleDrop} sensors={sensors}>
      <div
        style={{ zIndex: 2 }}
        className="active-game-page"
        onKeyDown={handleKeyDown}
      >
        <div className="scoreboard-section">
          <Scoreboard />{" "}
        </div>

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
          <div
            className="main-table-and-hand-row"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div
              className="top-section"
              aria-label="Game table"
              style={{ width: "100%" }}
            >
              <Droppable className="main-table-droppable">
                <MainTable
                  items={mainTableItems}
                  currentInfluencer={currentInfluencer}
                  setCurrentInfluencer={setCurrentInfluencer}
                  playersHandItems={
                    playersHandItems as unknown as TacticCardProps[]
                  }
                  finishRound={finishRound}
                  setFinishRound={setFinishRound}
                  setRoundEnd={setRoundEnd}
                  roundEnd={roundEnd}
                  setPlayersHandItems={
                    setPlayersHandItems as unknown as (
                      items: TacticCardProps[]
                    ) => void
                  }
                  mainTableItems={
                    mainTableItems as unknown as TacticCardProps[]
                  }
                  setMainTableItems={
                    setMainTableItems as unknown as (
                      items: TacticCardProps[]
                    ) => void
                  }
                  originalItems={playersHand}
                  setSubmitForScoring={setSubmitForScoring}
                  resetKey={resetKey}
                  roundEnd={roundEnd}
                  syncCardIndex={gameRoom?.cardIndex}
                />
              </Droppable>
            </div>
            <div
              className="bottom-section"
              ref={playersHandRef}
              aria-label="Your cards"
              style={{ width: "100%" }}
            >
              <PlayersHand
                items={playersHandItems}
                onMoveCardToTable={handleMoveCardToTable}
              />
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default GameTable;

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useGameContext } from "@/hooks/useGameContext";
import type { NewsCard, TacticCardProps } from "@/types/gameTypes";
import { Droppable } from "@/components/atoms/droppable/Droppable";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sendEndOfRound } from "@/utils/gameMessageUtils";
import { subscribeToMessages } from "@/services/webSocketService";
import MainTable from "../mainTable/MainTable";
import PlayersHand from "@/components/organisms/playersHand/PlayersHand";
import TacticCard from "@/components/organisms/tacticCard/TacticCard";
import categoryCards from "@/data/tacticsCards.json";
import Scoreboard from "@/components/molecules/scoreBoard/ScoreBoard";

import type { GameTableProps } from "@/types/types";

const GameTable: React.FC<GameTableProps> = ({
  setRoundEnd,
  roundEnd,
  //   roundHasEnded,
  setRoundHasEnded,
  isInfoModalOpen,
  setIsInfoModalOpen,
}) => {
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
      category: card.tactic ?? "", // Map tactic to category for compatibility
      id: card.tactic ?? String(idx + 1),
      alt: card.imageAlt ?? card.title ?? "Card image",
    }));
  const [mainTableItems, setMainTableItems] = useState<typeof playersHand>([]);
  const [finishRound, setFinishRound] = useState(false);
  const [submitForScoring, setSubmitForScoring] = useState(false);
  const [playersHandItems, setPlayersHandItems] =
    useState<typeof playersHand>(playersHand);
  const [showingHand, setShowingHand] = useState(false);
  const [resetKey, setResetKey] = useState(0); // increments to signal table reset
  const [isMobile, setIsMobile] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playersHandRef = useRef<HTMLDivElement>(null);

  // Track if endOfRound was already sent for current round to prevent loops
  const endOfRoundSentRef = useRef(false);

  // Configure sensors for mouse and touch
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const sensors = useSensors(mouseSensor, touchSensor);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const newIsMobile = window.innerHeight <= 600;
      const previousIsMobile = isMobile;

      if (previousIsMobile !== newIsMobile) {
        // Resolution changed - reset showingHand to ensure clean state
        setShowingHand(false);
        setIsMobile(newIsMobile);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobile]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over?.id == null) {
      return;
    }
    if (active.id !== over.id) {
      const activeCard = playersHandItems.find((item) => item.id === active.id);
      if (!activeCard) return;

      setPlayersHandItems((items) =>
        items.filter((item) => item.id !== active.id),
      );
      const removeStartingText = mainTableItems.filter(
        (card) => String(card.id) !== "1",
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
        items.filter((item) => item.id !== cardId),
      );

      // Add to table (remove placeholder first)
      const removeStartingText = mainTableItems.filter(
        (card) => String(card.id) !== "1",
      );
      setMainTableItems([...removeStartingText, cardToMove]);
    },
    [playersHandItems, mainTableItems],
  );

  useEffect(() => {
    setFinishRound(mainTableItems.length > 0);
  }, [mainTableItems]);

  // Listen for server score/end-of-round messages to reset UI for all players
  useEffect(() => {
    const unsubscribe = subscribeToMessages((message) => {
      const currentRoom = gameRoom?.room || gameRoom?.roomData?.name;

      if (
        (message.type === "scoreUpdate" || message.type === "endOfRound") &&
        message.room === currentRoom
      ) {
        // Show result modal (which will display the influencer info and scoring details)
        setRoundEnd(true);
        // Prevent re-triggering endOfRound loop
        setSubmitForScoring(true);
        setFinishRound(false);
        setResetKey((prev) => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [gameRoom?.room, gameRoom?.roomData?.name, setRoundEnd]);

  const scrollToSection = useCallback((section: "table" | "hand") => {
    setShowingHand(section === "hand");
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Arrow keys to navigate between views
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollToSection("hand");
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToSection("table");
      }
      // Tab key for standard accessibility navigation
      else if (event.key === "Tab") {
        // Allow natural tab flow through all focusable elements
        return;
      }
    },
    [scrollToSection],
  );

  // All players in the room are ready and have played at least one tactic
  const roomPlayers = gameRoom?.roomData?.players;
  const allPlayersReady = useMemo(() => {
    if (!Array.isArray(roomPlayers) || roomPlayers.length === 0) return false;
    return roomPlayers.every(
      (player) => player?.isReady === true && player?.tacticUsed?.length > 0,
    );
  }, [roomPlayers]);

  // Reset the endOfRound sent flag when players are no longer ready (new round started properly)
  // This ensures we don't reset prematurely based on gameRound changes
  useEffect(() => {
    if (!allPlayersReady && submitForScoring === false) {
      // Safe to reset - players are not ready and we're not in scoring mode
      endOfRoundSentRef.current = false;
    }
  }, [allPlayersReady, submitForScoring]);

  useEffect(() => {
    // Only send endOfRound once per round
    if (allPlayersReady && !submitForScoring && !endOfRoundSentRef.current) {
      endOfRoundSentRef.current = true; // Mark as sent immediately to prevent re-entry
      setRoundHasEnded(true);
      const players = gameRoom?.roomData?.players || [];
      const roomName = gameRoom?.room || gameRoom?.roomData?.name || "";
      sendEndOfRound(players as any, gameRound ?? 0, roomName);
      setRoundEnd(true);
      setSubmitForScoring(true);
      setRoundHasEnded(false);
      // Don't increment resetKey here - let the scoreUpdate message handler do it
      // This prevents double-incrementing which cancels the card dealing timeout
    }
  }, [
    allPlayersReady,
    submitForScoring,
    gameRound,
    gameRoom?.roomData?.players,
    gameRoom?.room,
    gameRoom?.roomData?.name,
    setRoundEnd,
    setRoundHasEnded,
  ]);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <>
        <div className="game-wrapper">
          <div
            className={`container ${showingHand ? "show-hand" : ""}`}
            ref={scrollContainerRef}
            role="region"
            aria-label="Game content area - use arrow keys or swipe to navigate"
            tabIndex={-1}
            onKeyDown={handleKeyDown}
          >
            {/* Grid Row Top - Scoreboard */}
            <div
              className="score"
              {...(isMobile && showingHand ? { inert: true } : {})}
            >
              <Scoreboard
                isInfoModalOpen={isInfoModalOpen}
                setIsInfoModalOpen={setIsInfoModalOpen}
              />
            </div>

            {/* Grid Row Middle - Main Table */}
            <div
              className="maintable"
              aria-label="Game table"
              {...(isMobile && showingHand ? { inert: true } : {})}
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
                      items: TacticCardProps[],
                    ) => void
                  }
                  mainTableItems={
                    mainTableItems as unknown as TacticCardProps[]
                  }
                  setMainTableItems={
                    setMainTableItems as unknown as (
                      items: TacticCardProps[],
                    ) => void
                  }
                  originalItems={playersHand}
                  setSubmitForScoring={setSubmitForScoring}
                  resetKey={resetKey}
                  syncCardIndex={gameRoom?.cardIndex}
                />
              </Droppable>
            </div>

            {/* Grid Row Bottom - Player's Hand */}
            <div
              className="playershand"
              ref={playersHandRef}
              aria-label="Your cards"
              {...(isMobile && !showingHand ? { inert: true } : {})}
            >
              <PlayersHand
                items={playersHandItems}
                onMoveCardToTable={handleMoveCardToTable}
              />
            </div>
          </div>
        </div>

        {/* Mobile navigation button */}
        <button
          className={`toggle-button ${showingHand ? "on-left" : ""}`}
          onClick={() => setShowingHand(!showingHand)}
          aria-label={showingHand ? "View game table" : "View your cards"}
          tabIndex={0}
        >
          {showingHand ? "← Table" : "Cards →"}
        </button>
      </>

      {/* DragOverlay renders the dragged card at root level, above all other content */}
      <DragOverlay>
        {activeId
          ? (() => {
              const card = playersHandItems.find(
                (item) => item.id === activeId,
              );
              return card ? (
                <TacticCard
                  title={card.title}
                  category={card.category}
                  image={card.image}
                  example={card.example}
                  alt={card.alt}
                  imageBack={card.imageBack}
                  description={card.description}
                  id={card.id}
                  hoveredCardId={null}
                  setHoveredCardId={() => {}}
                />
              ) : null;
            })()
          : null}
      </DragOverlay>
    </DndContext>
  );
};

export default GameTable;

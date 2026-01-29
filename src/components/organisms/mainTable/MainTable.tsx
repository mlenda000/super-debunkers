import React, { useEffect } from "react";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { getWebSocketInstance } from "@/services/webSocketService";
import {
  sendInfluencerReady,
  sendPlayerNotReady,
  sendPlayerReady,
} from "@/utils/gameMessageUtils";
import type {
  MainTableProps,
  ThemeStyle,
  TacticCardProps,
} from "@/types/types";
import { useGameContext } from "@/hooks/useGameContext";
import PlayedCard from "@/components/molecules/playedCard/PlayedCard";
import NewsCard from "@/components/molecules/newsCard/NewsCard";

type MainTablePropsWithHand = MainTableProps & {
  playersHandItems: TacticCardProps[];
  setPlayersHandItems: (items: TacticCardProps[]) => void;
  onOpenCardsModal?: (slotIndex: number) => void;
};

const MainTable: React.FC<
  MainTablePropsWithHand & {
    resetKey: number;
    roundEnd: boolean;
    syncCardIndex?: number;
  }
> = ({
  items,
  currentInfluencer,
  setCurrentInfluencer,
  finishRound,
  setFinishRound,
  setRoundEnd,
  roundEnd,
  playersHandItems,
  setPlayersHandItems,
  originalItems,
  mainTableItems,
  setMainTableItems,
  setSubmitForScoring,
  resetKey,
  syncCardIndex,
  onOpenCardsModal,
}) => {
  const { setThemeStyle, playerName } = useGlobalContext();
  const {
    gameRoom,
    gameRound,
    setEndGame,
    setFinalRound,
    setPlayers,
    setGameRoom,
    currentPlayer,
  } = useGameContext();
  const [playerReady, setPlayerReady] = React.useState<boolean>(false);
  // message was unused; reset is driven by resetKey now

  const gameCards = React.useMemo(
    () =>
      Array.isArray(gameRoom.roomData.deck?.data)
        ? [...gameRoom.roomData.deck.data]
        : [],
    [gameRoom.roomData.deck]
  );
  const isDeckShuffled = React.useMemo(
    () => gameRoom.roomData.deck?.isShuffled,
    [gameRoom.roomData.deck]
  );

  // Reset table when resetKey bumps (end-of-round). Keep deps minimal to avoid loops.
  useEffect(() => {
    if (resetKey === 0) return; // skip initial mount
    if (!roundEnd) return; // only run reset when scoring modal shown

    // Snapshot deck and players at the moment reset is requested
    const deckData = Array.isArray(gameRoom?.roomData?.deck?.data)
      ? gameRoom.roomData.deck.data
      : [];
    const resetPlayers = (gameRoom?.roomData?.players || []).map((p) => ({
      ...p,
      isReady: false,
      tacticUsed: [],
    }));

    // Reset hands/table: all cards back to hand, table empty
    setPlayersHandItems(originalItems);
    setPlayerReady(false);
    setMainTableItems([]);
    setSubmitForScoring(false);
    setFinishRound(false);
    setPlayers?.(resetPlayers);
    setGameRoom?.((prev) => ({
      ...prev,
      roomData: {
        ...prev.roomData,
        players: resetPlayers,
      },
    }));

    const timeout = setTimeout(() => {
      const nextCard = deckData[indexRef.current];
      if (nextCard) {
        setCurrentInfluencer(nextCard);
        indexRef.current++;
      }
    }, 11000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const indexRef = React.useRef(0);
  const newPlayerRef = React.useRef(true);

  // Sync card index from server if provided (ensures all players see same card)
  React.useEffect(() => {
    if (syncCardIndex !== undefined && syncCardIndex !== indexRef.current) {
      console.log("[MainTable] Syncing card index to:", syncCardIndex);
      indexRef.current = syncCardIndex;
      if (gameCards.length > 0) {
        const card = gameCards[syncCardIndex];
        if (card) {
          setCurrentInfluencer(card);
        }
      }
    }
  }, [syncCardIndex, gameCards, setCurrentInfluencer]);

  useEffect(() => {
    if (gameCards.length > 0 && isDeckShuffled) {
      if (newPlayerRef.current) {
        // Use synced index if available, otherwise use round
        const cardIndex =
          syncCardIndex !== undefined ? syncCardIndex : (gameRound ?? 1) - 1;
        setCurrentInfluencer(gameCards[cardIndex]);
        indexRef.current = cardIndex + 1;
        newPlayerRef.current = false; // Mark the player as no longer new
      }
    } else {
      console.log(
        "Conditions not met - gameCards.length:",
        gameCards.length,
        "isDeckShuffled:",
        isDeckShuffled
      );
    }
    if (gameRound === 5) {
      setFinalRound?.(true);
      setEndGame?.(true);
    }
  }, [
    setCurrentInfluencer,
    gameCards,
    gameRound,
    setFinalRound,
    setEndGame,
    isDeckShuffled,
    syncCardIndex,
  ]);

  useEffect(() => {
    // Only send message if currentInfluencer is defined
    if (!currentInfluencer) return;

    // Ensure villain is ThemeStyle (cast for type safety after NewsCardType update)
    setThemeStyle((currentInfluencer?.villain as ThemeStyle) || "all");
    const tactic = Array.isArray(currentInfluencer?.tacticUsed)
      ? currentInfluencer?.tacticUsed
      : [currentInfluencer?.tacticUsed];
    sendInfluencerReady(
      currentInfluencer,
      currentInfluencer?.villain as ThemeStyle,
      tactic as string[]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInfluencer]);

  const handlePlayerReady = () => {
    // Prevent duplicate sends if already marked ready or if no cards placed
    if (playerReady || !finishRound) {
      return;
    }
    const name =
      playerName || localStorage.getItem("playerName") || currentPlayer || "";

    // Get the tactics that were placed on the table (excluding the placeholder)
    const tacticIds = mainTableItems
      .filter((card) => String(card.id) !== "1")
      .map((card) => card.category); // Use category (which is now the tactic name like "clickbait")

    const expectedTactics = currentInfluencer?.tacticUsed || [];
    const matches = tacticIds.filter((tactic) =>
      expectedTactics.includes(tactic)
    );
    const mismatches = tacticIds.filter(
      (tactic) => !expectedTactics.includes(tactic)
    );

    console.log(`🃏 [MainTable] Player ${name} is ready with tactics:`, {
      matches,
      mismatches,
    });

    const updatedPlayers = (gameRoom?.roomData?.players || []).map((p) =>
      p?.name === name ? { ...p, isReady: true, tacticUsed: tacticIds } : p
    );

    // Send a single, well-formed playerReady message expected by server
    // Include `players` so the server can merge states safely
    const socket = getWebSocketInstance();
    const roomName = gameRoom?.room || gameRoom?.roomData?.name || "";
    sendPlayerReady(socket, updatedPlayers as any, roomName);

    // Optimistically update local context so Scoreboard reflects ready state
    setPlayers?.(updatedPlayers);
    setGameRoom?.({
      ...gameRoom,
      roomData: {
        ...gameRoom.roomData,
        players: updatedPlayers,
      },
    });

    setPlayerReady(true);
  };

  const handleReturnCard = (cardId: string) => {
    console.log("Card ID to return:", cardId);
    const cardToReturn = mainTableItems.find((item) => item.id === cardId);
    if (cardToReturn) {
      console.log("Card to return:", cardToReturn);
      const updatedItems = mainTableItems.filter((item) => item.id !== cardId);
      setMainTableItems(updatedItems);
      console.log("this is in the handleReturnCard function", items);
      setPlayersHandItems([...playersHandItems, cardToReturn]);
      if (updatedItems?.length === 0) {
        console.log("No cards left on the table");
        setPlayerReady(false);
        setFinishRound(false);
        const socket = getWebSocketInstance();
        sendPlayerNotReady(socket, (gameRoom?.roomData?.players || []) as any);
      }
    }
  };

  return (
    <div className="main-table">
      <div className="main-table__influencer">
        <NewsCard
          name={currentInfluencer?.caption || ""}
          description={currentInfluencer?.bodyCopy || ""}
          example="Influencer Example"
          category={currentInfluencer?.tacticUsed || []}
          villain={currentInfluencer?.villain || "all"}
          image={
            currentInfluencer?.newsImage
              ? `/images/news/${currentInfluencer.newsImage}`
              : `/images/news/scientist.webp`
          }
          tacticUsed={currentInfluencer?.tacticUsed || []}
        />
      </div>
      <div className="main-table__tactics">
        <div
          className="main-table__background"
          style={finishRound ? { display: "none" } : { display: "block" }}
        >
          <p className="main-table__place-cards">Place Cards</p>
        </div>
        <div className="main-table__card-slots">
          {/* Slot 0 */}
          {items[0] ? (
            <PlayedCard
              name={items[0]?.title}
              category={items[0]?.category}
              image={items[0]?.image}
              alt={items[0]?.alt}
              id={items[0]?.id}
              key={items[0]?.id}
              onUndo={() => handleReturnCard(items[0]?.id)}
            />
          ) : (
            <button
              className="main-table__card-slot"
              onClick={() => onOpenCardsModal?.(0)}
              aria-label="Select a card for slot 1"
            >
              <span className="main-table__card-slot-text">Select<br />Card</span>
            </button>
          )}
          {/* Slot 1 */}
          {items[1] ? (
            <PlayedCard
              name={items[1]?.title}
              category={items[1]?.category}
              image={items[1]?.image}
              alt={items[1]?.alt}
              id={items[1]?.id}
              key={items[1]?.id}
              onUndo={() => handleReturnCard(items[1]?.id)}
            />
          ) : (
            <button
              className="main-table__card-slot"
              onClick={() => onOpenCardsModal?.(1)}
              aria-label="Select a card for slot 2"
            >
              <span className="main-table__card-slot-text">Select<br />Card</span>
            </button>
          )}
          {/* Ready button inside slots for mobile landscape */}
          {finishRound && (
            <button
              type="button"
              onClick={handlePlayerReady}
              className="main-table__finish-round main-table__finish-round--mobile"
              aria-label={playerReady ? "Ready" : "Mark ready"}
            >
              <img
                src={
                  playerReady
                    ? `/images/buttons/checked-button.webp`
                    : `/images/buttons/ready-button.webp`
                }
                alt="Ready"
                style={{ cursor: "pointer", height: "30px", width: "auto" }}
              />
            </button>
          )}
        </div>
        {/* Original cards rendering for desktop */}
        <div className="main-table__desktop-cards">
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
        </div>
        {finishRound && (
          <button
            type="button"
            onClick={handlePlayerReady}
            className="main-table__finish-round"
            aria-label={playerReady ? "Ready" : "Mark ready"}
          >
            <img
              src={
                playerReady
                  ? `/images/buttons/checked-button.webp`
                  : `/images/buttons/ready-button.webp`
              }
              alt="Ready"
              width={"180%"}
              height={"auto"}
              style={{ cursor: "pointer", maxWidth: "100px" }}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default MainTable;

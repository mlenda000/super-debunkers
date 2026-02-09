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
} from "@/types/gameTypes";
import { useGameContext } from "@/hooks/useGameContext";
import PlayedCard from "@/components/molecules/playedCard/PlayedCard";
import NewsCard from "@/components/molecules/newsCard/NewsCard";

type MainTablePropsWithHand = MainTableProps & {
  playersHandItems: TacticCardProps[];
  setPlayersHandItems: (items: TacticCardProps[]) => void;
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
  playersHandItems,
  setPlayersHandItems,
  originalItems,
  mainTableItems,
  setMainTableItems,
  setSubmitForScoring,
  resetKey,
  syncCardIndex,
}) => {
  const { setThemeStyle, playerName, playerId } = useGlobalContext();
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
    [gameRoom.roomData.deck],
  );
  const isDeckShuffled = React.useMemo(
    () => gameRoom.roomData.deck?.isShuffled,
    [gameRoom.roomData.deck],
  );

  const indexRef = React.useRef(0);
  const newPlayerRef = React.useRef(true);
  const gameCardsRef = React.useRef(gameCards);
  const lastResetKeyRef = React.useRef(0);

  // Keep gameCardsRef in sync with gameCards
  React.useEffect(() => {
    gameCardsRef.current = gameCards;
  }, [gameCards]);

  // Reset table when resetKey bumps (end-of-round). Keep deps minimal to avoid loops.
  useEffect(() => {
    // Skip initial mount
    if (resetKey === 0) {
      return;
    }

    // Skip if we've already handled this resetKey
    if (resetKey === lastResetKeyRef.current) {
      return;
    }
    lastResetKeyRef.current = resetKey;

    // Reset hands/table: all cards back to hand, table empty
    // NOTE: Don't reset players here - the server sends the updated player state
    // with scores in the scoreUpdate message. Resetting here causes a race condition
    // where we might overwrite the scores before they're displayed.
    setPlayersHandItems(originalItems);
    setPlayerReady(false);
    setMainTableItems([]);
    setSubmitForScoring(false);
    setFinishRound(false);

    // Deal the next card after the score modal closes (3 seconds for modal + buffer)
    const timeout = setTimeout(() => {
      const cards = gameCardsRef.current;
      const nextCard = cards[indexRef.current];
      if (nextCard) {
        setCurrentInfluencer(nextCard);
        indexRef.current++;
      }
    }, 11000);

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Sync card index from server if provided (ensures all players see same card)
  React.useEffect(() => {
    if (syncCardIndex !== undefined && syncCardIndex !== indexRef.current) {
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
    const roomName = gameRoom?.room || gameRoom?.roomData?.name || "";
    sendInfluencerReady(
      currentInfluencer,
      currentInfluencer?.villain as ThemeStyle,
      tactic as string[],
      roomName,
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
    const currentPlayerId = playerId || localStorage.getItem("playerId") || "";

    // Get the tactics that were placed on the table (excluding the placeholder)
    const tacticIds = mainTableItems
      .filter((card) => String(card.id) !== "1")
      .map((card) => card.category); // Use category (which is now the tactic name like "clickbait")

    // Double-check we have tactics to send - prevents empty tacticUsed array
    if (tacticIds.length === 0) {
      console.warn(
        "[MainTable] handlePlayerReady called but no tactics on table",
      );
      return;
    }

    // Match player by ID OR by name (fallback)
    // Changed from exclusive OR to inclusive - either match triggers update
    const updatedPlayers = (gameRoom?.roomData?.players || []).map((p) => {
      const idMatch = currentPlayerId && p?.id === currentPlayerId;
      const nameMatch = p?.name === name;
      const isCurrentPlayer = idMatch || nameMatch;

      return isCurrentPlayer
        ? { ...p, isReady: true, tacticUsed: tacticIds }
        : p;
    });

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
    const cardToReturn = mainTableItems.find((item) => item.id === cardId);
    if (cardToReturn) {
      const updatedItems = mainTableItems.filter((item) => item.id !== cardId);
      setMainTableItems(updatedItems);
      setPlayersHandItems([...playersHandItems, cardToReturn]);
      if (updatedItems?.length === 0) {
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
        {
          <button
            type="button"
            onClick={handlePlayerReady}
            className="main-table__finish-round"
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
              width={"180%"}
              height={"auto"}
              style={{ cursor: "pointer", maxWidth: "100px" }}
            />
          </button>
        }
      </div>
    </div>
  );
};

export default MainTable;

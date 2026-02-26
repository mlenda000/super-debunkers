import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  subscribeToMessages,
  getWebSocketInstance,
} from "@/services/webSocketService";
import { useGameContext } from "@/hooks/useGameContext";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { sendPlayerLeaves } from "@/utils/gameMessageUtils";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import GameTable from "@/components/organisms/gameTable/GameTable";
import ResultModal from "@/components/organisms/modals/resultModal/ResultModal";
import RoundModal from "@/components/organisms/modals/roundModal/RoundModal";
import ResponseModal from "@/components/organisms/modals/responseModal/ResponseModal";
import ScoreModal from "@/components/organisms/modals/scoreModal/ScoreModal";
import EndGameModal from "@/components/organisms/modals/endGameModal/EndGameModal";
import InfoModal from "@/components/organisms/modals/infoModal/InfoModal";
import type { GameDeck } from "@/types/gameTypes";

const GamePage = () => {
  const { room: roomId } = useParams<{ room: string }>();
  const location = useLocation();
  const {
    gameRoom,
    setGameRoom,
    setPlayers,
    setIsDeckShuffled,
    setLastScoreUpdatePlayers,
    setGameRound,
    activeNewsCard,
    setActiveNewsCard,
    setPreviousNewsCard,
    setEndGame,
  } = useGameContext();
  const { setThemeStyle } = useGlobalContext();
  const hasJoinedRef = useRef(false);
  const setupTimeRef = useRef<number>(0);
  const isReconnectRef = useRef(false);
  // Track active card in a ref so the subscription callback can snapshot it
  const activeNewsCardRef = useRef(activeNewsCard);

  const [showRoundModal, setShowRoundModal] = useState<boolean>(true);
  const [roundEnd, setRoundEnd] = useState<boolean>(false);
  const [roundHasEnded, setRoundHasEnded] = useState<boolean>(false);
  const [isEndGame, setIsEndGame] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [showResponseModal, setShowResponseModal] = useState<boolean>(false);
  const [showScoreCard, setShowScoreCard] = useState<boolean>(false);

  // Keep the ref in sync with the latest activeNewsCard
  useEffect(() => {
    activeNewsCardRef.current = activeNewsCard;
  }, [activeNewsCard]);

  // Memoized callback setters to prevent unnecessary re-subscriptions
  const setShowRoundModalWithLog = useCallback((val: boolean) => {
    setShowRoundModal(val);
  }, []);

  const setRoundEndWithLog = useCallback((val: boolean) => {
    setRoundEnd(val);
  }, []);

  const setShowResponseModalWithLog = useCallback((val: boolean) => {
    setShowResponseModal(val);
  }, []);

  const setShowScoreCardWithLog = useCallback((val: boolean) => {
    setShowScoreCard(val);
  }, []);

  // Initialize with navigation state if available
  useEffect(() => {
    const state = location.state as {
      gameRoom?: any;
      currentRound?: number;
      themeStyle?: string;
      newsCard?: any;
      cardIndex?: number;
    };
    if (state?.gameRoom) {
      setGameRoom?.(state.gameRoom);

      if (state.gameRoom.roomData?.players) {
        setPlayers?.(state.gameRoom.roomData.players);
      }

      if (state.gameRoom.roomData?.deck) {
        setIsDeckShuffled?.(state.gameRoom.roomData.deck.isShuffled || false);
      }

      // Restore round number from navigation state (critical for reconnection)
      if (typeof state.currentRound === "number" && state.currentRound > 0) {
        setGameRound?.(state.currentRound);
      }

      // Restore theme from navigation state
      if (state.themeStyle) {
        setThemeStyle?.(state.themeStyle);
      }

      // Restore the active news card so the reconnecting player sees
      // the same card that was in play when they disconnected
      if (state.newsCard) {
        setActiveNewsCard?.(state.newsCard);
      } else if (state.gameRoom.roomData?.newsCard) {
        setActiveNewsCard?.(state.gameRoom.roomData.newsCard);
      }

      // If the round is > 1 or we have a cardIndex, this is a reconnection
      // — skip the "Round X" intro modal since the player is mid-game
      const round = state.currentRound ?? 1;
      const cardIdx = state.cardIndex ?? state.gameRoom?.cardIndex;
      if (round > 1 || (cardIdx !== undefined && cardIdx > 0)) {
        isReconnectRef.current = true;
        setShowRoundModal(false);
      }

      // Mark that player has joined a room
      hasJoinedRef.current = true;
    }

    // Store current room in sessionStorage for reconnection after page refresh/disconnect
    if (roomId) {
      sessionStorage.setItem("currentRoom", roomId);
    }
  }, [location.state, roomId]);

  const roundStartRef = useRef<boolean>(false); // Track if this is the first round

  // Mark first round as started
  useEffect(() => {
    if (!roundStartRef.current) {
      roundStartRef.current = true;
    }
  }, []);

  // Subscribe to room updates
  useEffect(() => {
    // Mark when subscription was set up (to guard against StrictMode cleanup)
    setupTimeRef.current = Date.now();

    const unsubscribe = subscribeToMessages((message) => {
      if (message.type === "roomUpdate" && message.room === roomId) {
        // Snapshot the current active card before the roomUpdate overwrites it,
        // so the result modal can show the card from the round that just ended.
        if (message.newsCard && activeNewsCardRef.current) {
          setPreviousNewsCard?.(activeNewsCardRef.current);
        }

        setGameRoom?.((prev) => ({
          count: message.count || prev?.count || 0,
          room: message.room || prev?.room || "",
          type: "roomUpdate",
          cardIndex: message.cardIndex ?? prev?.cardIndex,
          roomData: {
            count: message.count || prev?.roomData?.count || 0,
            players: message.players || prev?.roomData?.players || [],
            name: message.room || prev?.roomData?.name || "",
            // Preserve existing deck if not provided in message
            deck: message.deck
              ? (message.deck as GameDeck)
              : prev?.roomData?.deck,
            newsCard: message.newsCard || prev?.roomData?.newsCard,
          },
          isGameOver: message.isGameOver ?? prev?.isGameOver,
          maxRounds: message.maxRounds ?? prev?.maxRounds,
        }));

        if (message.players) {
          setPlayers?.(message.players);
        }

        if (message.deck) {
          setIsDeckShuffled?.(message.deck.isShuffled || false);
        }

        // Sync round from server if provided (for joining mid-game)
        if (
          typeof message.currentRound === "number" &&
          message.currentRound > 0
        ) {
          setGameRound?.(message.currentRound);
        }

        // Sync theme/background from server if provided
        if (message.themeStyle) {
          setThemeStyle?.(message.themeStyle);
        }

        // Sync newsCard from server if provided
        if (message.newsCard) {
          // Set the active news card so MainTable displays it
          setActiveNewsCard?.(message.newsCard);
        }
      }

      if (message.type === "playerReady") {
        // Only update if this playerReady is for our room
        if (message.room === roomId && message.roomData) {
          setPlayers?.(message.roomData);

          // Also update the gameRoom context
          setGameRoom?.((prev) => ({
            ...prev,
            roomData: {
              ...prev.roomData,
              players: message.roomData,
            },
          }));
        }
      }

      if (message.type === "scoreUpdate") {
        if (message.room === roomId && message.players) {
          setPlayers?.(message.players);
          setLastScoreUpdatePlayers?.(message.players);

          // Also update gameRoom context with the scored players
          setGameRoom?.((prev) => ({
            ...prev,
            roomData: {
              ...prev.roomData,
              players: message.players,
            },
            isGameOver: message.isGameOver ?? prev.isGameOver,
            maxRounds: message.maxRounds ?? prev.maxRounds,
          }));

          // Set endGame from server signal
          if (message.isGameOver) {
            setEndGame?.(true);
          }
        }
      }

      // Handle reconnection state — server sends this ONLY to a reconnecting
      // player with their full preserved state (score, streak, round, card, etc.)
      if (message.type === "reconnectState" && message.room === roomId) {
        isReconnectRef.current = true;

        // Restore full game room state
        setGameRoom?.((prev) => ({
          count: message.count || prev?.count || 0,
          room: message.room || prev?.room || "",
          type: "roomUpdate",
          cardIndex: message.cardIndex,
          isGameOver: message.isGameOver ?? prev?.isGameOver,
          maxRounds: message.maxRounds ?? prev?.maxRounds,
          roomData: {
            count: message.count || prev?.roomData?.count || 0,
            players: message.players || prev?.roomData?.players || [],
            name: message.room || prev?.roomData?.name || "",
            deck: message.deck
              ? (message.deck as GameDeck)
              : prev?.roomData?.deck,
            newsCard: message.newsCard || prev?.roomData?.newsCard,
          },
        }));

        // Restore players with full scoring data
        if (message.players) {
          setPlayers?.(message.players);
        }

        // Restore deck
        if (message.deck) {
          setIsDeckShuffled?.(message.deck.isShuffled || false);
        }

        // Restore round number
        if (
          typeof message.currentRound === "number" &&
          message.currentRound > 0
        ) {
          setGameRound?.(message.currentRound);
        }

        // Restore theme
        if (message.themeStyle) {
          setThemeStyle?.(message.themeStyle);
        }

        // Restore the exact news card that was in play
        if (message.newsCard) {
          setActiveNewsCard?.(message.newsCard);
        }

        // Skip the round intro modal — player is returning mid-game
        setShowRoundModal(false);

        // Mark as joined
        hasJoinedRef.current = true;
      }
    });

    return () => {
      // Only send playerLeaves if we've been in the room for a real amount of time
      // (protects against React StrictMode cleanup which happens immediately on setup)
      const timeInRoom = Date.now() - setupTimeRef.current;
      if (hasJoinedRef.current && timeInRoom > 500) {
        const socket = getWebSocketInstance();
        if (socket && roomId) {
          sendPlayerLeaves(socket, roomId);
        }
        // Clear stored room since the player is intentionally leaving
        sessionStorage.removeItem("currentRoom");
      }
      unsubscribe();
    };
  }, [roomId]);

  // Ensure we notify server when window/tab closes
  // NOTE: We do NOT clear sessionStorage here so the player can rejoin on refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasJoinedRef.current) {
        const socket = getWebSocketInstance();
        if (socket && roomId) {
          sendPlayerLeaves(socket, roomId);
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [roomId]);

  const showModalBackdrop =
    showRoundModal ||
    roundEnd ||
    showResponseModal ||
    showScoreCard ||
    isEndGame;

  return (
    <div className="game-page">
      <RotateScreen />
      <GameTable
        setRoundEnd={setRoundEndWithLog}
        roundEnd={roundEnd}
        roundHasEnded={roundHasEnded}
        setRoundHasEnded={setRoundHasEnded}
        gameRoom={gameRoom}
        isInfoModalOpen={isInfoModalOpen}
        setIsInfoModalOpen={setIsInfoModalOpen}
      />
      {showModalBackdrop && <div className="modal-backdrop" />}
      {showRoundModal && (
        <RoundModal onClose={() => setShowRoundModal(false)} />
      )}
      {roundEnd && (
        <ResultModal
          setRoundEnd={setRoundEndWithLog}
          setShowResponseModal={setShowResponseModalWithLog}
        />
      )}
      {showResponseModal && (
        <ResponseModal
          setShowScoreCard={setShowScoreCardWithLog}
          setShowResponseModal={setShowResponseModalWithLog}
        />
      )}
      {showScoreCard && (
        <ScoreModal
          setIsEndGame={setIsEndGame}
          setShowRoundModal={setShowRoundModalWithLog}
          setShowScoreCard={setShowScoreCardWithLog}
        />
      )}
      {isEndGame && <EndGameModal setIsEndGame={setIsEndGame} />}
      {isInfoModalOpen && (
        <InfoModal isOpen={isInfoModalOpen} onClose={setIsInfoModalOpen} />
      )}
    </div>
  );
};

export default GamePage;

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
    setActiveNewsCard,
  } = useGameContext();
  const { setThemeStyle } = useGlobalContext();
  const hasJoinedRef = useRef(false);
  const setupTimeRef = useRef<number>(0);

  const [showRoundModal, setShowRoundModal] = useState<boolean>(true);
  const [roundEnd, setRoundEnd] = useState<boolean>(false);
  const [roundHasEnded, setRoundHasEnded] = useState<boolean>(false);
  const [isEndGame, setIsEndGame] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [showResponseModal, setShowResponseModal] = useState<boolean>(false);
  const [showScoreCard, setShowScoreCard] = useState<boolean>(false);

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
    const state = location.state as { gameRoom?: any };
    if (state?.gameRoom) {
      setGameRoom?.(state.gameRoom);

      if (state.gameRoom.roomData?.players) {
        setPlayers?.(state.gameRoom.roomData.players);
      }

      if (state.gameRoom.roomData?.deck) {
        setIsDeckShuffled?.(state.gameRoom.roomData.deck.isShuffled || false);
      }

      // Mark that player has joined a room
      hasJoinedRef.current = true;
    }
  }, [location.state]);

  const roundStartRef = useRef<boolean>(false); // Track if this is the first round

  // Hide initial round modal after 2 seconds
  useEffect(() => {
    if (!roundStartRef.current) {
      roundStartRef.current = true;
      const timer = setTimeout(() => {
        setShowRoundModal(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Hide round modal after 2 seconds when shown between rounds (but only if we're showing it)
  useEffect(() => {
    if (showRoundModal && roundStartRef.current) {
      const timer = setTimeout(() => {
        setShowRoundModal(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showRoundModal]);

  // Subscribe to room updates
  useEffect(() => {
    // Mark when subscription was set up (to guard against StrictMode cleanup)
    setupTimeRef.current = Date.now();

    const unsubscribe = subscribeToMessages((message) => {
      if (message.type === "roomUpdate" && message.room === roomId) {
        setGameRoom?.((prev) => ({
          count: message.count || prev?.count || 0,
          room: message.room || prev?.room || "",
          type: "roomUpdate",
          roomData: {
            count: message.count || prev?.roomData?.count || 0,
            players: message.players || prev?.roomData?.players || [],
            name: message.room || prev?.roomData?.name || "",
            // Preserve existing deck if not provided in message
            deck: message.deck
              ? (message.deck as GameDeck)
              : prev?.roomData?.deck,
          },
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

        // Sync newsCard from server if provided (for mid-game join)
        if (message.newsCard) {
          // Set the active news card so MainTable displays it
          setActiveNewsCard?.(message.newsCard);
          // Store it in gameRoom for access
          setGameRoom?.((prev) => ({
            ...prev,
            roomData: {
              ...prev.roomData,
              newsCard: message.newsCard,
            },
          }));
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
          }));
        }
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
      }
      unsubscribe();
    };
  }, [roomId]);

  // Ensure we notify server when window/tab closes
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
      {showRoundModal && <RoundModal />}
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

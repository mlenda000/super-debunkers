import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  subscribeToMessages,
  getWebSocketInstance,
  switchRoom,
} from "@/services/webSocketService";
import { useGameContext } from "@/hooks/useGameContext";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { sendPlayerLeaves, sendPlayerEnters } from "@/utils/gameMessageUtils";
import { PARTYKIT_URL } from "@/services/env";
import PartySocket from "partysocket";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import GameTable from "@/components/organisms/gameTable/GameTable";
import ResultModal from "@/components/organisms/modals/resultModal/ResultModal";
import RoundModal from "@/components/organisms/modals/roundModal/RoundModal";
import ResponseModal from "@/components/organisms/modals/responseModal/ResponseModal";
import ScoreModal from "@/components/organisms/modals/scoreModal/ScoreModal";
import EndGameModal from "@/components/organisms/modals/endGameModal/EndGameModal";
import InfoModal from "@/components/organisms/modals/infoModal/InfoModal";
import ObserverOverlay from "@/components/organisms/observerOverlay/ObserverOverlay";
import type { GameDeck } from "@/types/gameTypes";

const GamePage = () => {
  const { room: roomId } = useParams<{ room: string }>();
  const location = useLocation();
  const navigate = useNavigate();
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
    resetGameState,
  } = useGameContext();
  const { setThemeStyle, playerId: currentPlayerId } = useGlobalContext();
  const hasJoinedRef = useRef(false);
  const setupTimeRef = useRef<number>(0);
  const isReconnectRef = useRef(false);
  const isObserverRef = useRef(false);
  // Track active card in a ref so the subscription callback can snapshot it
  const activeNewsCardRef = useRef(activeNewsCard);

  const [showRoundModal, setShowRoundModal] = useState<boolean>(true);
  const [roundEnd, setRoundEnd] = useState<boolean>(false);
  const [roundHasEnded, setRoundHasEnded] = useState<boolean>(false);
  const [isEndGame, setIsEndGame] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [showResponseModal, setShowResponseModal] = useState<boolean>(false);
  const [showScoreCard, setShowScoreCard] = useState<boolean>(false);
  const [isObserver, setIsObserver] = useState<boolean>(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [playerCountdowns, setPlayerCountdowns] = useState<
    Record<string, number>
  >({});
  const countdownIntervalsRef = useRef<
    Record<string, ReturnType<typeof setInterval>>
  >({});

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
      observer?: boolean;
    };

    if (state?.observer) {
      isObserverRef.current = true;
      setIsObserver(true);
      // Clear all stale game data from previous sessions so the overlay
      // starts empty and only shows data from the server's roomUpdate.
      resetGameState?.();
    }

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

  // Subscribe to room updates (and handle reconnection on page refresh)
  useEffect(() => {
    // Mark when subscription was set up (to guard against StrictMode cleanup)
    setupTimeRef.current = Date.now();

    let unsubscribe: () => void = () => {};
    let cancelled = false;

    // Message handler — shared between normal and reconnection flows
    const handleMessage = (message: any) => {
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
          volumeLocked: message.volumeLocked ?? prev?.volumeLocked,
          musicMuted: message.musicMuted ?? prev?.musicMuted,
          sfxMuted: message.sfxMuted ?? prev?.sfxMuted,
          musicVolume: message.musicVolume ?? prev?.musicVolume,
          sfxVolume: message.sfxVolume ?? prev?.sfxVolume,
          teacherCreated: message.teacherCreated ?? prev?.teacherCreated,
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

          // If the server cancelled a countdown for this player, clear the UI
          const cancelId = message.cancelledCountdownPlayerId;
          if (cancelId && countdownIntervalsRef.current[cancelId]) {
            clearInterval(countdownIntervalsRef.current[cancelId]);
            delete countdownIntervalsRef.current[cancelId];
            setPlayerCountdowns((prev) => {
              const next = { ...prev };
              delete next[cancelId];
              return next;
            });
          }
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
            volumeLocked: message.volumeLocked ?? prev.volumeLocked,
            musicMuted: message.musicMuted ?? prev.musicMuted,
            sfxMuted: message.sfxMuted ?? prev.sfxMuted,
            musicVolume: message.musicVolume ?? prev.musicVolume,
            sfxVolume: message.sfxVolume ?? prev.sfxVolume,
          }));

          // Set endGame from server signal
          if (message.isGameOver) {
            setEndGame?.(true);
          }
        }
      }

      // Handle ready countdown broadcast from server (player-specific)
      if (
        message.type === "readyCountdown" &&
        message.room === roomId &&
        message.playerId
      ) {
        const targetId = message.playerId as string;
        const totalSeconds = message.seconds ?? 30;

        // Clear any existing interval for this player
        if (countdownIntervalsRef.current[targetId]) {
          clearInterval(countdownIntervalsRef.current[targetId]);
        }

        // Set initial countdown for this player
        setPlayerCountdowns((prev) => ({ ...prev, [targetId]: totalSeconds }));

        let remaining = totalSeconds;
        countdownIntervalsRef.current[targetId] = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            setPlayerCountdowns((prev) => {
              const next = { ...prev };
              delete next[targetId];
              return next;
            });
            clearInterval(countdownIntervalsRef.current[targetId]);
            delete countdownIntervalsRef.current[targetId];
          } else {
            setPlayerCountdowns((prev) => ({ ...prev, [targetId]: remaining }));
          }
        }, 1000);
      }

      // Admin unlocked the room — re-enable the home button for teacher rooms
      if (message.type === "roomUnlocked" && message.room === roomId) {
        setGameRoom?.((prev) =>
          prev ? { ...prev, teacherCreated: false } : prev,
        );
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
          volumeLocked: message.volumeLocked ?? prev?.volumeLocked,
          musicMuted: message.musicMuted ?? prev?.musicMuted,
          sfxMuted: message.sfxMuted ?? prev?.sfxMuted,
          musicVolume: message.musicVolume ?? prev?.musicVolume,
          sfxVolume: message.sfxVolume ?? prev?.sfxVolume,
          teacherCreated: message.teacherCreated ?? prev?.teacherCreated,
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

      // Redirect to lobby if server rejects the join during reconnection
      if (message.type === "joinRejected" && !cancelled) {
        navigate("/game/lobby");
      }
    };

    // Async init — handles reconnection on page refresh
    const init = async () => {
      // Observer mode: connect to room WebSocket and subscribe, but never join as a player
      if (isObserverRef.current && roomId) {
        try {
          const token = localStorage.getItem("authToken") || undefined;
          await switchRoom({ roomId, token });
          if (cancelled) return;
          unsubscribe = subscribeToMessages(handleMessage);
          // Send observeRoom to get current state without joining
          const socket = getWebSocketInstance();
          if (socket) {
            const sendObserve = () => {
              if (cancelled) return;
              socket.send(
                JSON.stringify({ type: "observeRoom", roomName: roomId }),
              );
            };
            if (socket.readyState === PartySocket.OPEN) {
              sendObserve();
            } else {
              socket.addEventListener("open", sendObserve, { once: true });
            }
          }
        } catch (error) {
          console.error("[GamePage] Observer connection failed:", error);
          if (!cancelled) navigate("/admin");
        }
        return;
      }

      const existingSocket = getWebSocketInstance();
      const needsReconnect =
        !existingSocket || existingSocket.readyState !== PartySocket.OPEN;

      if (needsReconnect && roomId) {
        // Page was refreshed or loaded directly — WebSocket not connected
        const storedName = localStorage.getItem("playerName");
        const storedPlayerId = localStorage.getItem("playerId");
        const storedAvatar = localStorage.getItem("avatarImage") || "";

        if (!storedName) {
          // Can't reconnect without a player name
          if (!cancelled) navigate("/game/lobby");
          return;
        }

        try {
          // Verify the room still exists on the server
          const response = await fetch(
            `${PARTYKIT_URL}/parties/main/${roomId}`,
          );
          if (!response.ok || cancelled) {
            if (!cancelled) navigate("/game/lobby");
            return;
          }

          const data = await response.json();
          if (data.isGameOver) {
            if (!cancelled) navigate("/game/lobby");
            return;
          }

          // Connect WebSocket to the game room
          const token = localStorage.getItem("authToken") || undefined;
          await switchRoom({ roomId, token });
          if (cancelled) return;

          // Subscribe to messages AFTER connection is established
          unsubscribe = subscribeToMessages(handleMessage);

          // Send playerEnters to rejoin the room (triggers server-side reconnection)
          const newSocket = getWebSocketInstance();
          if (newSocket) {
            const avatarName = storedAvatar.substring(
              storedAvatar.lastIndexOf("/") + 1,
            );
            const sendJoin = () => {
              if (cancelled) return;
              sendPlayerEnters(
                newSocket,
                {
                  id: storedPlayerId || undefined,
                  name: storedName,
                  avatar: avatarName,
                  room: roomId,
                },
                roomId,
              );
              hasJoinedRef.current = true;
            };

            if (newSocket.readyState === PartySocket.OPEN) {
              sendJoin();
            } else {
              newSocket.addEventListener("open", sendJoin, { once: true });
            }
          }
        } catch (error) {
          console.error("[GamePage] Reconnection failed:", error);
          if (!cancelled) navigate("/game/lobby");
        }
      } else {
        // Normal flow: WebSocket already connected (navigated from lobby)
        unsubscribe = subscribeToMessages(handleMessage);
      }
    };

    init();

    return () => {
      cancelled = true;
      // Only send playerLeaves if we've been in the room for a real amount of time
      // (protects against React StrictMode cleanup which happens immediately on setup)
      const timeInRoom = Date.now() - setupTimeRef.current;
      if (hasJoinedRef.current && !isObserverRef.current && timeInRoom > 500) {
        const socket = getWebSocketInstance();
        if (socket && roomId) {
          sendPlayerLeaves(socket, roomId);
        }
        // Clear stored room since the player is intentionally leaving
        sessionStorage.removeItem("currentRoom");
      }
      unsubscribe();
      // Clear all countdown timers on unmount
      for (const key of Object.keys(countdownIntervalsRef.current)) {
        clearInterval(countdownIntervalsRef.current[key]);
      }
      countdownIntervalsRef.current = {};
    };
  }, [roomId]);

  // Ensure we notify server when window/tab closes
  // NOTE: We do NOT clear sessionStorage here so the player can rejoin on refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasJoinedRef.current && !isObserverRef.current) {
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
    !isObserver &&
    (showRoundModal ||
      roundEnd ||
      showResponseModal ||
      showScoreCard ||
      isEndGame);

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
      {!isObserver && showRoundModal && (
        <RoundModal onClose={() => setShowRoundModal(false)} />
      )}
      {!isObserver && roundEnd && (
        <ResultModal
          setRoundEnd={setRoundEndWithLog}
          setShowResponseModal={setShowResponseModalWithLog}
        />
      )}
      {!isObserver && showResponseModal && (
        <ResponseModal
          setShowScoreCard={setShowScoreCardWithLog}
          setShowResponseModal={setShowResponseModalWithLog}
        />
      )}
      {!isObserver && showScoreCard && (
        <ScoreModal
          setIsEndGame={setIsEndGame}
          setShowRoundModal={setShowRoundModalWithLog}
          setShowScoreCard={setShowScoreCardWithLog}
        />
      )}
      {!isObserver && isEndGame && <EndGameModal setIsEndGame={setIsEndGame} />}
      {!isObserver &&
        currentPlayerId &&
        playerCountdowns[currentPlayerId] != null && (
          <div className="ready-countdown-banner">
            <span className="ready-countdown-banner__text">
              ⏱ You have <strong>{playerCountdowns[currentPlayerId]}s</strong>{" "}
              to click ready or it will happen for you!
            </span>
          </div>
        )}
      {isInfoModalOpen && (
        <InfoModal isOpen={isInfoModalOpen} onClose={setIsInfoModalOpen} />
      )}
      {isObserver && (
        <>
          <div className="observer-scrim" />
          <ObserverOverlay
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
            playerCountdowns={playerCountdowns}
          />
        </>
      )}
    </div>
  );
};

export default GamePage;

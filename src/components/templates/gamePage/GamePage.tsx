import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  subscribeToMessages,
  getWebSocketInstance,
} from "@/services/webSocketService";
import { useGameContext } from "@/hooks/useGameContext";
import { sendPlayerLeaves } from "@/utils/gameMessageUtils";
// import Scoreboard from "@/components/organisms/scoreboard/Scoreboard";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import GameTable from "@/components/organisms/gameTable/GameTable";
import ResultModal from "@/components/organisms/modals/resultModal/ResultModal";
import RoundModal from "@/components/organisms/modals/roundModal/RoundModal";
import ResponseModal from "@/components/organisms/modals/responseModal/ResponseModal";
import ScoreModal from "@/components/organisms/modals/scoreModal/ScoreModal";
import EndGameModal from "@/components/organisms/modals/endGameModal/EndGameModal";
import InfoModal from "@/components/organisms/modals/infoModal/InfoModal";

const GamePage = () => {
  const { room: roomId } = useParams<{ room: string }>();
  const location = useLocation();
  const {
    gameRoom,
    setGameRoom,
    setPlayers,
    setIsDeckShuffled,
    setLastScoreUpdatePlayers,
  } = useGameContext();
  const hasJoinedRef = useRef(false);
  const setupTimeRef = useRef<number>(0);

  const [showRoundModal, setShowRoundModal] = useState<boolean>(true);
  const [roundEnd, setRoundEnd] = useState<boolean>(false);
  const [roundHasEnded, setRoundHasEnded] = useState<boolean>(false);
  const [isEndGame, setIsEndGame] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [showResponseModal, setShowResponseModal] = useState<boolean>(false);
  const [showScoreCard, setShowScoreCard] = useState<boolean>(false);

  // Initialize with navigation state if available
  useEffect(() => {
    const state = location.state as { gameRoom?: any };
    if (state?.gameRoom) {
      console.log(
        "[GamePage] Initializing with navigation state:",
        state.gameRoom
      );
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

  // Hide round modal after 2 seconds when shown between rounds
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
    console.log(
      "[GamePage] Setting up message subscription for roomId:",
      roomId
    );

    // Mark when subscription was set up (to guard against StrictMode cleanup)
    setupTimeRef.current = Date.now();

    const unsubscribe = subscribeToMessages((message) => {
      if (message.type === "roomUpdate" && message.room === roomId) {
        console.log(
          "[GamePage] ✅ Processing roomUpdate - updating context with players:",
          message.players
        );

        setGameRoom?.({
          count: message.count || 0,
          room: message.room || "",
          type: "roomUpdate",
          roomData: {
            count: message.count || 0,
            players: message.players || [],
            name: message.room || "",
            deck: message.deck,
          },
        });

        if (message.players) {
          console.log("[GamePage] Setting players to:", message.players);
          setPlayers?.(message.players);
        }

        if (message.deck) {
          setIsDeckShuffled?.(message.deck.isShuffled || false);
        }

        if (message.newsCard) {
          console.log(
            "[GamePage] Setting newsCard/activeNewsCard to:",
            message.newsCard
          );
          setActiveNewsCard?.(message.newsCard);
        }

        if (message.themeStyle) {
          console.log("[GamePage] Setting theme to:", message.themeStyle);
          // Note: themeStyle is set in MainTable when influencer changes
        }
      } else if (message.type === "roomUpdate") {
        console.log("[GamePage] ❌ Ignoring roomUpdate for different room", {
          messageRoom: message.room,
          currentRoom: roomId,
        });
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
          console.log("[GamePage] Sending playerLeaves for room:", roomId);
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
          console.log(
            "[GamePage] Window closing, sending playerLeaves for room:",
            roomId
          );
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
        setRoundEnd={(value: boolean | ((prevState: boolean) => boolean)) =>
          setRoundEnd(value)
        }
        roundEnd={roundEnd}
        roundHasEnded={roundHasEnded}
        setRoundHasEnded={setRoundHasEnded}
        gameRoom={gameRoom}
      />
      {showRoundModal && <RoundModal />}
      {roundEnd && (
        <ResultModal
          setRoundEnd={setRoundEnd}
          setShowResponseModal={setShowResponseModal}
        />
      )}
      {showResponseModal && (
        <ResponseModal
          setShowScoreCard={setShowScoreCard}
          setShowResponseModal={setShowResponseModal}
        />
      )}
      {showScoreCard && (
        <ScoreModal
          setIsEndGame={setIsEndGame}
          setShowRoundModal={setShowRoundModal}
          setShowScoreCard={setShowScoreCard}
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

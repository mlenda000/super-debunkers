import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import usePartySocket from "partysocket/react";
import { PARTYKIT_HOST } from "../services/env";

// Types
interface Player {
  id: string;
  name: string;
  avatar: string;
  status?: boolean;
  score?: number;
  wasCorrect?: boolean;
  hasStreak?: boolean;
  streak?: number;
  scoreUpdated?: boolean;
}

interface GameRoomData {
  room?: string;
  count?: number;
  roomData?: Player[];
  deck?: any[];
}

interface CardMessage {
  id: string;
  imageUrl: string;
}

interface ResponseMessage {
  wasCorrect?: boolean;
  hasStreak?: boolean;
  streak?: number;
}

interface GameContextType {
  // State
  gameRound: number;
  gameRoom: GameRoomData | string;
  gameState: string;
  categoryCards: any;
  influencerCards: any[];
  players: Player[];
  cardMessage: CardMessage | number | undefined;
  playerId: string;
  rooms: string[];
  messages: any[];
  room: string;
  currentInfluencer: any;
  showGameTimer: boolean;
  showScoringModal: boolean;
  roundEnd: boolean;
  roundStart: boolean;
  showResponseModal: any;
  showScoreCard: boolean;
  webSocketReady: boolean;
  playersInRoom: Player[];
  waitingForPlayers: boolean;
  roundTimer: number;
  message: string;
  responseMsg: ResponseMessage | string;
  isDeckShuffled: boolean;
  finalRound: boolean;
  endGame: boolean;

  // Setters
  setGameRound: (round: number) => void;
  setGameRoom: (room: GameRoomData | string | ((prev: any) => any)) => void;
  setGameState: (state: string) => void;
  setCategoryCards: (cards: any) => void;
  setInfluencerCards: (cards: any[]) => void;
  setPlayers: (players: Player[]) => void;
  setCardMessage: (message: CardMessage | number | undefined) => void;
  setPlayerId: (id: string) => void;
  setRooms: (rooms: string[]) => void;
  setMessages: (messages: any[] | ((prev: any[]) => any[])) => void;
  setRoom: (room: string) => void;
  setCurrentInfluencer: (influencer: any) => void;
  setShowGameTimer: (show: boolean) => void;
  setShowScoringModal: (show: boolean) => void;
  setRoundEnd: (end: boolean) => void;
  setRoundStart: (start: boolean) => void;
  setShowResponseModal: (show: any) => void;
  setShowScoreCard: (show: boolean) => void;
  setWebSocketReady: (ready: boolean) => void;
  setPlayersInRoom: (players: Player[]) => void;
  setWaitingForPlayers: (waiting: boolean) => void;
  setRoundTimer: (timer: number) => void;
  setMessage: (message: string) => void;
  setResponseMsg: (msg: ResponseMessage | string) => void;
  setIsDeckShuffled: (shuffled: boolean) => void;
  setFinalRound: (final: boolean) => void;
  setEndGame: (end: boolean) => void;

  // Methods
  sendMessage: (input: any) => void;
  handleMessage: (message: any) => void;
}

export const GameContext = createContext<GameContextType | undefined>(
  undefined
);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  // Card state
  const [cardMessage, setCardMessage] = useState<
    CardMessage | number | undefined
  >(undefined);

  // UI state
  //   const [showGameTimer, setShowGameTimer] = useState<boolean>(false);

  // Round state
  const [roundEnd, setRoundEnd] = useState<boolean>(false);
  const [roundStart, setRoundStart] = useState<boolean>(false);
  const [roundTimer, setRoundTimer] = useState<number>(30);
  const [finalRound, setFinalRound] = useState<boolean>(false);
  const [endGame, setEndGame] = useState<boolean>(false);

  // WebSocket state
  const [webSocketReady, setWebSocketReady] = useState<boolean>(false);
  const [waitingForPlayers, setWaitingForPlayers] = useState<boolean>(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");
  const [responseMsg, setResponseMsg] = useState<ResponseMessage | string>("");

  // Deck state
  const [isDeckShuffled, setIsDeckShuffled] = useState<boolean>(false);

  // WebSocket connection
  // WebSocket connection
  const ws = usePartySocket({
    host: PARTYKIT_HOST,
    room: room,

    onOpen() {
      setWebSocketReady(true);
      console.log("Connected to the WebSocket server");
    },

    onMessage(event) {
      const message = event.data;

      if (message && typeof message === "string") {
        const parsedMessage = JSON.parse(message);

        // Handle different message types from server
        switch (parsedMessage?.type) {
          case "announcement":
            if (parsedMessage?.text) {
              console.log("Announcement from server:", parsedMessage.text);
            }
            break;

          case "playerId":
            setPlayerId(parsedMessage?.id);
            break;

          case "lobbyUpdate":
            setGameRoom({
              room: parsedMessage?.room,
              count: parsedMessage?.count,
              roomData: parsedMessage?.roomData?.players || [],
            });
            break;

          case "card":
            setCardMessage({
              id: parsedMessage?.data,
              imageUrl: parsedMessage?.id,
            });
            break;

          case "undo": {
            const removeThisManyCards = Number(parsedMessage?.id);
            setCardMessage(removeThisManyCards);
            break;
          }

          case "roomUpdate":
            setGameRoom((prevGameRoom: any) => ({
              ...prevGameRoom,
              count: parsedMessage?.count,
              roomData:
                parsedMessage?.players?.map((newPlayer: Player) => {
                  const existingPlayer = prevGameRoom?.roomData?.find(
                    (player: Player) => player.id === newPlayer.id
                  );
                  return existingPlayer || newPlayer;
                }) ||
                prevGameRoom?.roomData ||
                [],
              deck: parsedMessage?.deck?.data || [],
            }));
            setInfluencerCards(parsedMessage?.deck?.data || []);
            setIsDeckShuffled(true);
            break;

          case "roomUpdate-PlayerLeft":
            setGameRoom((prevGameRoom: any) => ({
              ...prevGameRoom,
              room: parsedMessage?.room,
              count: parsedMessage?.count,
              roomData: parsedMessage?.roomData || [],
            }));
            break;

          case "roundStart":
            setRoundTimer(30);
            setShowGameTimer(true);
            break;

          case "playerReady":
            setGameRoom((prevGameRoom: any) => ({
              ...prevGameRoom,
              roomData:
                prevGameRoom?.roomData?.map((player: Player) => {
                  const updatedPlayer = parsedMessage?.roomData.find(
                    (data: Player) => data.id === parsedMessage?.sender
                  );
                  return player.id === parsedMessage?.sender
                    ? updatedPlayer
                    : player;
                }) || [],
            }));
            break;

          case "allReady":
            setGameRoom((prevGameRoom: any) => ({
              ...prevGameRoom,
              roomData: prevGameRoom?.roomData?.map((player: Player) => ({
                ...player,
                status: true,
              })),
            }));
            break;

          case "scoreUpdate": {
            const updatedPlayers = parsedMessage?.players.map(
              (player: Player) => ({
                ...player,
                scoreUpdated: false,
              })
            );

            setGameRoom((prevGameRoom: any) => ({
              ...prevGameRoom,
              roomData: updatedPlayers,
            }));

            setMessage("endOfRound");

            const currentPlayer = parsedMessage?.players?.find(
              (player: Player) => player.id === playerId
            );

            setResponseMsg({
              wasCorrect: currentPlayer?.wasCorrect,
              hasStreak: currentPlayer?.hasStreak,
              streak: currentPlayer?.streak,
            });
            break;
          }

          case "shuffledDeck":
            setInfluencerCards(parsedMessage?.data);
            setIsDeckShuffled(true);
            break;

          case "retrieveDeck":
            setInfluencerCards(parsedMessage?.deck?.data);
            setIsDeckShuffled(true);
            break;

          default:
            console.log("Unhandled message type from server:", parsedMessage);
            break;
        }
      } else {
        console.log("Received message from server:", message);
      }

      setMessages((prevMessages) => [...prevMessages, message]);
    },

    onClose() {
      console.log("Disconnected from the WebSocket server");
    },
  });

  // Send message to WebSocket server
  const sendMessage = (input: any) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(input));
    } else {
      console.error("WebSocket connection is not open. Cannot send message.");
    }
  };

  const handleMessage = (message: any) => {
    // Implement message handling logic here
  };

  // Send starting deck when conditions are met
  useEffect(() => {
    if (influencerCards?.length > 0 && !isDeckShuffled && gameRoom) {
      sendMessage({
        type: "startingDeck",
        data: influencerCards,
        gameRoom: gameRoom,
      });
    }
  }, [influencerCards, gameRoom, isDeckShuffled]);

  const value: GameContextType = {
    // State
    gameRound,
    gameRoom,
    gameState,
    categoryCards,
    influencerCards,
    players,
    cardMessage,
    playerId,
    rooms,
    messages,
    room,
    currentInfluencer,
    showGameTimer,
    showScoringModal,
    roundEnd,
    roundStart,
    showResponseModal,
    showScoreCard,
    webSocketReady,
    playersInRoom,
    waitingForPlayers,
    roundTimer,
    message,
    responseMsg,
    isDeckShuffled,
    finalRound,
    endGame,

    // Setters
    setGameRound,
    setGameRoom,
    setGameState,
    setCategoryCards,
    setInfluencerCards,
    setPlayers,
    setCardMessage,
    setPlayerId,
    setRooms,
    setMessages,
    setRoom,
    setCurrentInfluencer,
    setShowGameTimer,
    setShowScoringModal,
    setRoundEnd,
    setRoundStart,
    setShowResponseModal,
    setShowScoreCard,
    setWebSocketReady,
    setPlayersInRoom,
    setWaitingForPlayers,
    setRoundTimer,
    setMessage,
    setResponseMsg,
    setIsDeckShuffled,
    setFinalRound,
    setEndGame,

    // Methods
    sendMessage,
    handleMessage,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

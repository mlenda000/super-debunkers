import type { NewsCardProps } from "./types";

// Player type
export interface Player {
  id: string;
  name?: string;
  avatar?: string;
  score?: number;
  isReady?: boolean;
  // Add more fields as needed
}

// Message type
export interface Message {
  text: string;
  type: string;
}

export interface GameDeck {
  type: "shuffledDeck" | undefined;
  data: GameDeck;
  isShuffled: boolean;
}

// RoundResult type
export interface RoundResult {
  playerId: string;
  score: number;
  // Add more fields as needed
}

// ModalContent type
export type ModalContent = string | null | Record<string, unknown>;

// CustomState type
export type CustomState = {
  villain?: string;
  allReady?: boolean;
  // Add more fields as needed
} | null;

export interface RoomData {
  count: number;
  players: Player[];
  name: string;
  deck?: GameDeck;
}

export interface GameRoom {
  count: number;
  room: string;
  type: string;
  roomData: RoomData;
}

export type GameContextType = {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  currentPlayer: string;
  setCurrentPlayer: (id: string) => void;
  gameRoom: GameRoom;
  setGameRoom: (room: GameRoom) => void;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  customState: CustomState;
  setCustomState: (customState: CustomState) => void;
  tacticCards?: import("./types").TacticCardProps[];
  setTacticCards?: (
    cards: import("./types").TacticCardProps[] | undefined
  ) => void;
  newsCards?: NewsCardProps[];
  setNewsCards?: (cards: NewsCardProps[]) => void;
  activeNewsCard?: NewsCardProps | null;
  setActiveNewsCard?: (card: NewsCardProps | null) => void;
  gameRound?: number;
  setGameRound?: (round: number) => void;
  endGame?: boolean;
  setEndGame?: (end: boolean) => void;
  isDeckShuffled?: boolean;
  setIsDeckShuffled?: (shuffled: boolean) => void;
  finalRound?: boolean;
  setFinalRound?: (final: boolean) => void;
};

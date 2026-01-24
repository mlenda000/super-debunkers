import type { TacticCardProps, ThemeStyle } from "./types";

export interface NewsCard {
  id: string;
  caption: string;
  bodyCopy: string;
  collection: string;
  harm: string[];
  howToSpotIt: string[];
  motive: string;
  newsImage: string;
  newsLogoImage: string;
  qrCodeImage: string;
  tacticUsed?: string[];
  tacticUsedImage: string;
  takeaway: string;
  video: string;
  villain: ThemeStyle;
}

export interface NewsCardProps {
  name: string;
  description: string;
  example: string;
  category: string[];
  villain: ThemeStyle;
  image: string;
  tacticUsed?: string[];
  display?: "default" | "modal";
}
// Player type
export interface Player {
  id: string;
  name?: string;
  avatar?: string;
  score?: number;
  isReady?: boolean;
  tacticUsed?: string[];
  // Scoring-related fields sent by server
  wasCorrect?: boolean;
  streak?: number;
  hasStreak?: boolean;
  scoreUpdated?: boolean;
  streakUpdated?: boolean;
  status?: boolean;
  room?: string;
}

export interface PlayersHandProps {
  items: TacticCardProps[];
  onMoveCardToTable?: (cardId: string) => void;
}

// Message type
export interface Message {
  text: string;
  type: string;
}

export interface GameDeck {
  type: "shuffledDeck" | undefined;
  data: NewsCard[];
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
  lastScoreUpdatePlayers?: Player[];
  setLastScoreUpdatePlayers?: (players: Player[] | undefined) => void;
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
  newsCards?: NewsCard[];
  setNewsCards?: (cards: NewsCard[]) => void;
  activeNewsCard?: NewsCard | null;
  setActiveNewsCard?: (card: NewsCard | null) => void;
  gameRound?: number;
  setGameRound?: (round: number) => void;
  endGame?: boolean;
  setEndGame?: (end: boolean) => void;
  isDeckShuffled?: boolean;
  setIsDeckShuffled?: (shuffled: boolean) => void;
  finalRound?: boolean;
  setFinalRound?: (final: boolean) => void;
};

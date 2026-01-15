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

// Settings type
export interface Settings {
  deck?: NewsCardProps[];
  isShuffled?: boolean;
  // Add more fields as needed
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

export type GameContextType = {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  currentPlayer: string;
  setCurrentPlayer: (id: string) => void;
  gameRoom: string;
  setGameRoom: (room: string) => void;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  customState: CustomState;
  setCustomState: (customState: CustomState) => void;
};

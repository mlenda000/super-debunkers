// serverTypes.ts
export interface User {
  id: string;
  name?: string;
}

export interface Player {
  id: string;
  name: string;
  room: string;
  score: number;
  isReady: boolean;
  wasScored?: boolean;
}

export interface Room {
  name: string;
  count: number;
  players: Player[];
  deck?: ShuffledDeck;
}

export interface InfluencerCard {
  id: string;
  villain?: any;
  [key: string]: any;
}

export interface ShuffledDeck {
  type: string;
  data: any[];
  isShuffled: boolean;
}

export type MessageType =
  // Client -> Server messages
  | "getPlayerId"
  | "enteredLobby"
  | "playerEnters"
  | "influencer"
  | "playerReady"
  | "playerLeaves"
  | "playerNotReady"
  | "allReady"
  | "startingDeck"
  | "endOfRound"
  // Server -> Client messages
  | "playerId"
  | "lobbyUpdate"
  | "announcement"
  | "roomUpdate"
  | "villain"
  | "shuffledDeck"
  | "scoreUpdate"
  | "error"
  // Legacy types (if needed)
  | "USER_JOINED"
  | "USER_LEFT"
  | "ROOM_LIST_UPDATE"
  | "JOIN_ROOM"
  | "LEAVE_ROOM"
  | "ROOM_JOINED"
  | "GAME_STATE_UPDATE";

export interface WebSocketMessage {
  type: MessageType;
  payload?: any;
  userId?: string;
  roomId?: string;
  timestamp?: number;
  // Server-specific fields
  id?: string;
  room?: string;
  count?: number;
  roomData?: any;
  text?: string;
  players?: Player[];
  deck?: ShuffledDeck;
  player?: Player;
  villain?: any;
  sender?: string;
  data?: any;
  isShuffled?: boolean;
  message?: string;
}

export type MessageHandler = (message: WebSocketMessage) => void;

// Theme style for UI
export type ThemeStyle = "all" | "oligs" | "bots" | "celebs" | "biosts";

// Tactic Card component props
export interface TacticCardProps {
  category: string;
  image: string;
  imageBack: string;
  title: string;
  description?: string;
  example: string;
  alt: string;
  className?: string;
  id: string;
  onUndo?: (id: string) => void;
}

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
  inTool?: boolean;
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
  newsCard?: NewsCard;
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
  tacticCards?: TacticCardProps[];
  setTacticCards?: (cards: TacticCardProps[] | undefined) => void;
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
  resetGameState?: () => void;
};

// Game component prop types
export interface MainTableProps {
  items: TacticCardProps[];
  currentInfluencer: NewsCard | null;
  setCurrentInfluencer: (influencer: NewsCard | null) => void;
  finishRound: boolean;
  setFinishRound: (val: boolean) => void;
  setRoundEnd: (val: boolean) => void;
  setPlayersHandItems: (items: TacticCardProps[]) => void;
  originalItems: TacticCardProps[];
  mainTableItems: TacticCardProps[];
  setMainTableItems: (items: TacticCardProps[]) => void;
  setSubmitForScoring: (val: boolean) => void;
}

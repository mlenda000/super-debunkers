import type { ReactNode } from "react";
import type { NewsCard, ThemeStyle } from "./gameTypes";

// Played Card component props
export interface PlayedCardProps {
  name: string;
  image: string;
  alt?: string;
  id: string | number;
  category?: string;
  onUndo: (id: string | number) => void;
}

// Global Context Types

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface GlobalContextType {
  // Auth state
  auth: AuthState;
  login: (user: User, token: string) => void;
  logout: () => void;

  // Theme style state
  themeStyle: ThemeStyle;
  setThemeStyle: (style: ThemeStyle) => void;

  // Player info state
  playerId: string;
  setPlayerId: (id: string) => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
}

export interface GlobalProviderProps {
  children: ReactNode;
}

// Carousel Types
export interface SlideData {
  id: string;
  header?: string;
  image?: string;
  imageType?: "single" | "multiple";
  imageAlt?: string;
  description?: string;
}

export interface CarouselProps {
  slides: SlideData[];
}

export interface CarouselSlideProps {
  header?: string;
  image?: string;
  imageType?: "single" | "multiple";
  imageAlt?: string;
  description?: string;
  children?: ReactNode;
}

// Avatar Image Types
export interface AvatarImageProps {
  src: string;
  alt?: string;
  avatar?: string;
  setAvatar?: (avatar: string) => void;
  display?: string;
  playerSelection?: boolean;
  playerReady?: boolean;
}

// Input Types
export interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  themeStyle?: ThemeStyle;
  style?: React.CSSProperties;
}

// Button Types
export interface NextButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children?: string;
}

// Room Tab Types
export interface RoomTabProps {
  room: string;
  avatar: string;
  onClick: (playerName: string, room: string, avatar: string) => void;
}

export interface TacticCardFrontProps {
  category: string;
  image: string;
  alt: string;
  className?: string;
  onUndo?: (id: string) => void;
}

export interface NewsCardType {
  caption: string;
  bodyCopy: string;
  villain: ThemeStyle;
  tacticUsed: string[];
  newsImage?: string;
}

// Component-specific Prop Types

// Header Component
export interface HeaderProps {
  showPlayButton?: boolean;
}

// Tool Component
export interface ToolProps {
  showResults: boolean;
  currentInfluencer?: {
    caption?: string;
    bodyCopy?: string;
    tacticUsed?: string[];
    villain?: ThemeStyle;
    newsImage?: string;
  } | null;
}

// SortableCard Component
export interface SortableCardProps {
  id: string;
  children: ReactNode;
}

// TacticCardBack Component
export interface TacticCardBackProps {
  imageBack: string;
  description: string;
  example?: string;
  category?: string;
  className?: string;
}

// Extended Carousel Component
export interface ExtendedCarouselProps extends CarouselProps {
  onSlideChange?: (isEnd: boolean) => void;
}

// Scoreboard Component
export interface ScoreboardProps {
  roundHasEnded?: boolean;
  setRoundHasEnded?: (val: boolean) => void;
  isInfoModalOpen?: boolean;
  setIsInfoModalOpen?: (val: boolean) => void;
  gameRoom?: any;
  gameRound?: number;
}

// Modal Components

// GameTableProps
export interface GameTableProps {
  setRoundEnd: (val: boolean) => void;
  roundEnd: boolean;
  roundHasEnded: boolean;
  setRoundHasEnded: (val: boolean) => void;
  gameRoom?: any;
  isInfoModalOpen: boolean;
  setIsInfoModalOpen: (val: boolean) => void;
}

// ScoreModalProps
export interface ScoreModalProps {
  setIsEndGame: (value: boolean) => void;
  setShowRoundModal?: (value: boolean) => void;
  setShowScoreCard?: (value: boolean) => void;
}

// InfoModalProps
export interface InfoModalProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
}

// EndGameModalProps
export interface EndGameModalProps {
  setIsEndGame: (value: boolean) => void;
}

// ResultModalProps
export interface ResultModalProps {
  setRoundEnd: (value: boolean) => void;
  setShowResponseModal: (value: boolean) => void;
}

// ResponseModalProps
export interface ResponseModalProps {
  setShowScoreCard: (value: boolean) => void;
  setShowResponseModal: (value: boolean) => void;
}

// ResponseMessage Type (used in ResponseModal)
export interface ResponseMessage {
  wasCorrect?: boolean;
  streak?: number;
  hasStreak?: boolean;
}

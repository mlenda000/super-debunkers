import type { ReactNode } from "react";

// Global Context Types
export type ThemeStyle = "all" | "oligs" | "bots" | "celebs" | "biosts";

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

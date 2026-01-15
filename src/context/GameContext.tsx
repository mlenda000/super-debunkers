import { createContext } from "react";
import type { GameContextType } from "@/types/gameTypes";

export const GameContext = createContext<GameContextType | undefined>(
  undefined
);

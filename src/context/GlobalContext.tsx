import { createContext } from "react";
import type { GlobalContextType } from "@/types/types";

export const GlobalContext = createContext<GlobalContextType | undefined>(
  undefined
);

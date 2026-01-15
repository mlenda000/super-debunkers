import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { GameContext } from "@/context/GameContext";
import { useGameContext } from "@/hooks/useGameContext";
import { registerGameContextSetters } from "@/services/webSocketService";
import type { Player, Message, Settings, CustomState } from "@/types/gameTypes";

export const GameProvider = ({ children }: { children: ReactNode }) => {
  // --- State declarations ---
  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [customState, setCustomState] = useState<CustomState>(null);
  const [gameRoom, setGameRoom] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<Settings>({});

  // --- Memoized values ---
  const memoCurrentPlayer = useMemo(() => currentPlayer, [currentPlayer]);
  const memoCustomState = useMemo(() => customState, [customState]);
  const memoGameRoom = useMemo(() => gameRoom, [gameRoom]);
  const memoMessages = useMemo(() => messages, [messages]);
  const memoPlayers = useMemo(() => players, [players]);
  const memoSettings = useMemo(() => settings, [settings]);

  const context = useGameContext();

  //pushes the setters to the webSocketService for use in message handling
  useEffect(() => {
    registerGameContextSetters(context);
  }, [context]);

  return (
    <GameContext.Provider
      value={{
        players: memoPlayers,
        setPlayers,
        currentPlayer: memoCurrentPlayer,
        setCurrentPlayer,
        gameRoom: memoGameRoom,
        setGameRoom,
        messages: memoMessages,
        setMessages,
        settings: memoSettings,
        setSettings,
        customState: memoCustomState,
        setCustomState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

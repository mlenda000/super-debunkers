import { useState, useEffect } from "react";
import { GlobalContext } from "./GlobalContext";
import type {
  GlobalProviderProps,
  AuthState,
  GlobalContextType,
  User,
} from "@/types/types";
import type { ThemeStyle } from "@/types/gameTypes";
import {
  initializeWebSocket,
  subscribeToMessages,
} from "@/services/webSocketService";
import { sendGetPlayerId } from "@/utils/gameMessageUtils";

const PLAYER_ID_EXPIRY_HOURS = 24;

const isPlayerIdValid = (): boolean => {
  const storedPlayerId = localStorage.getItem("playerId");
  const storedTimestamp = localStorage.getItem("playerIdTimestamp");

  if (!storedPlayerId || !storedTimestamp) {
    return false;
  }

  const timestamp = parseInt(storedTimestamp, 10);
  const now = Date.now();
  const hoursDiff = (now - timestamp) / (1000 * 60 * 60);

  return hoursDiff < PLAYER_ID_EXPIRY_HOURS;
};

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const [themeStyle, setThemeStyle] = useState<ThemeStyle>("all");

  // Initialize playerId from localStorage if valid, otherwise empty (will be fetched from server)
  const [playerId, setPlayerId] = useState<string>(() => {
    if (isPlayerIdValid()) {
      return localStorage.getItem("playerId") || "";
    }
    return "";
  });

  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem("playerName") || "";
  });

  const [avatar, setAvatar] = useState<string>(() => {
    return localStorage.getItem("avatarImage") || "";
  });

  // Fetch playerId from server if not valid in localStorage
  useEffect(() => {
    if (isPlayerIdValid()) {
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const fetchPlayerId = async () => {
      try {
        await initializeWebSocket("lobby");

        unsubscribe = subscribeToMessages((message) => {
          if (
            message.type === "playerId" &&
            message.id &&
            typeof message.id === "string"
          ) {
            const newPlayerId = message.id;
            localStorage.setItem("playerId", newPlayerId);
            localStorage.setItem("playerIdTimestamp", Date.now().toString());
            setPlayerId(newPlayerId);
          }
        });

        // Request a new playerId from server
        sendGetPlayerId();
      } catch (error) {
        console.error(
          "[GlobalProvider] Failed to initialize WebSocket:",
          error,
        );
      }
    };

    fetchPlayerId();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Listen for playerId updates from server (e.g., when server detects duplicate ID)
  useEffect(() => {
    const unsubscribe = subscribeToMessages((message) => {
      if (
        message.type === "playerId" &&
        message.id &&
        typeof message.id === "string"
      ) {
        const newPlayerId = message.id;
        // Only update if it's different from current
        if (newPlayerId !== playerId) {
          localStorage.setItem("playerId", newPlayerId);
          localStorage.setItem("playerIdTimestamp", Date.now().toString());
          setPlayerId(newPlayerId);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [playerId]);

  const login = (user: User, token: string) => {
    setAuth({
      isAuthenticated: true,
      user,
      token,
    });
    // Optional: Store in localStorage
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  const value: GlobalContextType = {
    auth,
    login,
    logout,
    themeStyle,
    setThemeStyle,
    avatar,
    setAvatar,
    playerName,
    setPlayerName,
    playerId,
    setPlayerId,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

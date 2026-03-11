import { useState, useEffect } from "react";
import { GlobalContext } from "./GlobalContext";
import type {
  GlobalProviderProps,
  AuthState,
  ThemeStyle,
  GlobalContextType,
  User,
} from "@/types/types";
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

  // Audio state
  const [sfxVolume, setSfxVolume] = useState<number>(() => {
    const saved = localStorage.getItem("adminSfxVolume");
    return saved !== null ? Number(saved) : 20;
  });
  const [sfxMuted, setSfxMuted] = useState<boolean>(() => {
    return localStorage.getItem("adminSfxMuted") === "true";
  });
  const [musicMuted, setMusicMuted] = useState<boolean>(() => {
    return localStorage.getItem("adminMusicMuted") === "true";
  });
  const [volumeLocked, setVolumeLocked] = useState<boolean>(() => {
    return localStorage.getItem("adminVolumeLocked") === "true";
  });

  // Teacher-created rooms (volume lock only applies to these)
  const [teacherRooms, setTeacherRooms] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("teacherRooms");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Unique teacher session ID (generated once per browser, persisted in localStorage)
  const [teacherId] = useState<string>(() => {
    const existing = localStorage.getItem("teacherId");
    if (existing) return existing;
    const id = `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem("teacherId", id);
    return id;
  });

  // Shared teacher/admin authentication state
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);

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
    sfxVolume,
    setSfxVolume,
    sfxMuted,
    setSfxMuted,
    musicMuted,
    setMusicMuted,
    volumeLocked,
    setVolumeLocked,
    teacherRooms,
    setTeacherRooms,
    teacherId,
    isTeacherAuthenticated,
    setIsTeacherAuthenticated,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

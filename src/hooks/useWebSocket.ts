import { useEffect, useState, useRef, useCallback } from "react";
import WebSocketService from "@/services/webSocketService";
import type {
  WebSocketMessage,
  MessageType,
  Player,
  Room,
} from "@/types/serverTypes";
import * as WSUtils from "@/utils/gameMessageUtils";

export const useWebSocket = (host: string) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string>("lobby");
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomData, setRoomData] = useState<Room | null>(null);
  const wsServiceRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    const wsService = new WebSocketService(host);
    wsServiceRef.current = wsService;

    wsService
      .connect({ room: "lobby" })
      .then((id) => {
        setUserId(id);
        setIsConnected(true);

        // Request player ID from server
        const socket = wsService.getSocket();
        if (socket) {
          WSUtils.sendGetPlayerId(socket);
        }
      })
      .catch((error) => {
        console.error("Connection failed:", error);
      });

    return () => {
      wsService.disconnect();
    };
  }, [host]);

  const subscribe = useCallback(
    (
      messageType: MessageType,
      handler: (message: WebSocketMessage) => void
    ) => {
      return wsServiceRef.current?.on(messageType, handler);
    },
    []
  );

  const getSocket = useCallback(() => {
    return wsServiceRef.current?.getSocket();
  }, []);

  // Client -> Server actions
  const requestPlayerId = useCallback(() => {
    const socket = getSocket();
    if (socket) WSUtils.sendGetPlayerId(socket);
  }, [getSocket]);

  const enterLobby = useCallback(
    (room: string) => {
      const socket = getSocket();
      if (socket) WSUtils.sendEnteredLobby(socket, room);
    },
    [getSocket]
  );

  const enterRoom = useCallback(
    (player: Partial<Player>, room: string) => {
      const socket = getSocket();
      if (socket) {
        WSUtils.sendPlayerEnters(socket, player, room);
        setCurrentRoom(room);
      }
    },
    [getSocket]
  );

  const sendInfluencer = useCallback(
    (influencerData: any, villain: any) => {
      const socket = getSocket();
      if (socket) WSUtils.sendInfluencer(socket, influencerData, villain);
    },
    [getSocket]
  );

  const setReady = useCallback(
    (players: Player[]) => {
      const socket = getSocket();
      if (socket) WSUtils.sendPlayerReady(socket, players);
    },
    [getSocket]
  );

  const setNotReady = useCallback(
    (players: Player[]) => {
      const socket = getSocket();
      if (socket) WSUtils.sendPlayerNotReady(socket, players);
    },
    [getSocket]
  );

  const checkAllReady = useCallback(() => {
    const socket = getSocket();
    if (socket) WSUtils.sendCheckAllReady(socket);
  }, [getSocket]);

  const sendDeck = useCallback(
    (deckData: any[], room: string) => {
      const socket = getSocket();
      if (socket) WSUtils.sendStartingDeck(socket, deckData, room);
    },
    [getSocket]
  );

  const endRound = useCallback(
    (players: Player[]) => {
      const socket = getSocket();
      if (socket) WSUtils.sendEndOfRound(socket, players);
    },
    [getSocket]
  );

  const switchRoom = useCallback((roomId: string) => {
    wsServiceRef.current?.switchToRoom({ roomId });
    setCurrentRoom(roomId);
  }, []);

  const backToLobby = useCallback(() => {
    wsServiceRef.current?.returnToLobby();
    setCurrentRoom("lobby");
  }, []);

  return {
    userId,
    isConnected,
    currentRoom,
    players,
    roomData,
    setPlayers,
    setRoomData,
    subscribe,
    getSocket,
    // Actions
    requestPlayerId,
    enterLobby,
    enterRoom,
    sendInfluencer,
    setReady,
    setNotReady,
    checkAllReady,
    sendDeck,
    endRound,
    switchRoom,
    backToLobby,
  };
};

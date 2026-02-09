import type { WebSocketMessage, MessageType } from "@/types/serverTypes";
import type { Player } from "@/types/gameTypes";
import PartySocket from "partysocket";
import { getWebSocketInstance } from "@/services/webSocketService";

// Base send message utility
export const sendMessage = (
  socket: PartySocket | null,
  type: MessageType,
  payload: any,
  userId?: string,
  roomId?: string,
): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }

  const message: WebSocketMessage = {
    type,
    ...payload,
    userId,
    roomId,
    timestamp: Date.now(),
  };

  socket.send(JSON.stringify(message));
};

// Client -> Server message senders

export const sendGetPlayerId = (socket?: PartySocket | null): void => {
  const sock = socket || getWebSocketInstance();
  if (!sock || sock.readyState !== PartySocket.OPEN) {
    console.warn("Socket not ready - getPlayerId will retry on connection");
    return;
  }
  sock.send(JSON.stringify({ type: "getPlayerId" }));
};

export const sendEnteredLobby = (
  socket: PartySocket | null | undefined,
  room: string,
  avatar?: string,
  name?: string,
): void => {
  const sock = socket || getWebSocketInstance();
  if (!sock || sock.readyState !== PartySocket.OPEN) {
    console.warn("Socket not ready - enteredLobby will retry on connection");
    return;
  }
  sock.send(JSON.stringify({ type: "enteredLobby", room, avatar, name }));
};

export const sendCreateRoom = (
  socket: PartySocket | null | undefined,
  roomName: string,
): void => {
  const sock = socket || getWebSocketInstance();
  if (!sock || sock.readyState !== PartySocket.OPEN) {
    console.warn("Socket not ready - createRoom will retry on connection");
    return;
  }
  sock.send(JSON.stringify({ type: "createRoom", roomName }));
};

export const sendGetAvailableRooms = (socket?: PartySocket | null): void => {
  const sock = socket || getWebSocketInstance();
  if (!sock || sock.readyState !== PartySocket.OPEN) {
    console.warn(
      "Socket not ready - getAvailableRooms will retry on connection",
    );
    return;
  }
  sock.send(JSON.stringify({ type: "getAvailableRooms" }));
};

export const sendEndGame = (
  socket: PartySocket | null | undefined,
  room: string,
): void => {
  const sock = socket || getWebSocketInstance();
  if (!sock || sock.readyState !== PartySocket.OPEN) {
    console.warn("Socket not ready - endGame will retry on connection");
    return;
  }
  sock.send(JSON.stringify({ type: "endGame", room }));
};

export const sendPlayerEnters = (
  socket: PartySocket | null,
  player: Partial<Player> & { avatar?: string },
  room: string,
): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }
  socket.send(
    JSON.stringify({
      type: "playerEnters",
      player,
      room,
    }),
  );
};

export const sendInfluencer = (
  socket: PartySocket | null,
  influencerData: any,
  villain: any,
): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }
  socket.send(
    JSON.stringify({
      type: "influencer",
      villain,
      ...influencerData,
    }),
  );
};

export const sendInfluencerReady = (
  newsCard: any,
  villain?: string,
  tactic?: string[],
  room?: string,
): void => {
  const socket = getWebSocketInstance();

  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.warn("Socket not ready - influencerReady will retry on connection");
    return;
  }
  socket.send(
    JSON.stringify({
      type: "influencer",
      newsCard,
      villain: villain || newsCard?.villain,
      tactic: tactic || newsCard?.tacticUsed,
      room,
    }),
  );
};

export const sendPlayerReady = (
  socket: PartySocket | null,
  players: Player[],
  room?: string,
): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }
  socket.send(
    JSON.stringify({
      type: "playerReady",
      players,
      room,
    }),
  );
};

export const sendPlayerNotReady = (
  socket: PartySocket | null,
  players: Player[],
): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }
  socket.send(
    JSON.stringify({
      type: "playerNotReady",
      players,
    }),
  );
};

export const sendPlayerLeaves = (
  socket: PartySocket | null,
  room?: string,
): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }
  socket.send(
    JSON.stringify({
      type: "playerLeaves",
      room,
    }),
  );
};

export const sendCheckAllReady = (socket: PartySocket | null): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }
  socket.send(JSON.stringify({ type: "allReady" }));
};

export const sendStartingDeck = (
  socket: PartySocket | null,
  deckData: any[],
  room: string,
): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }
  socket.send(
    JSON.stringify({
      type: "startingDeck",
      data: deckData,
      room,
    }),
  );
};

export const sendEndOfRound = (
  players: Player[],
  round?: number,
  room?: string,
  socket?: PartySocket | null,
): void => {
  const sock = socket || getWebSocketInstance();
  if (!sock || sock.readyState !== PartySocket.OPEN) {
    return;
  }

  // Only send necessary player data for scoring (NOT scores - server will calculate)
  const playersForScoring = players.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    tacticUsed: p.tacticUsed,
  }));

  sock.send(
    JSON.stringify({
      type: "endOfRound",
      players: playersForScoring,
      round,
      room,
    }),
  );
};

// Legacy message senders (if still needed)
export const sendJoinRoom = (
  socket: PartySocket | null,
  roomId: string,
  userId: string,
): void => {
  sendMessage(socket, "JOIN_ROOM", { roomId }, userId);
};

export const sendLeaveRoom = (
  socket: PartySocket | null,
  roomId: string,
  userId: string,
): void => {
  sendMessage(socket, "LEAVE_ROOM", { roomId }, userId, roomId);
};

export const sendRequestRoomList = (
  socket: PartySocket | null,
  userId: string,
): void => {
  sendMessage(socket, "ROOM_LIST_UPDATE", {}, userId);
};

export const sendGameAction = (
  socket: PartySocket | null,
  action: any,
  userId: string,
  roomId: string,
): void => {
  sendMessage(socket, "GAME_STATE_UPDATE", action, userId, roomId);
};

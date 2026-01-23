import type {
  WebSocketMessage,
  MessageType,
  Player,
} from "@/types/serverTypes";
import PartySocket from "partysocket";

// Base send message utility
export const sendMessage = (
  socket: PartySocket | null,
  type: MessageType,
  payload: any,
  userId?: string,
  roomId?: string
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

export const sendGetPlayerId = (socket: PartySocket | null): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }
  socket.send(JSON.stringify({ type: "getPlayerId" }));
};

export const sendEnteredLobby = (
  socket: PartySocket | null,
  room: string,
  avatar?: string,
  name?: string
): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }
  socket.send(JSON.stringify({ type: "enteredLobby", room, avatar, name }));
};

export const sendPlayerEnters = (
  socket: PartySocket | null,
  player: Partial<Player> & { avatar?: string },
  room: string
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
    })
  );
};

export const sendInfluencer = (
  socket: PartySocket | null,
  influencerData: any,
  villain: any
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
    })
  );
};

export const sendPlayerReady = (
  socket: PartySocket | null,
  players: Player[]
): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }
  socket.send(
    JSON.stringify({
      type: "playerReady",
      players,
    })
  );
};

export const sendPlayerNotReady = (
  socket: PartySocket | null,
  players: Player[]
): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }
  socket.send(
    JSON.stringify({
      type: "playerNotReady",
      players,
    })
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
  room: string
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
    })
  );
};

export const sendEndOfRound = (
  socket: PartySocket | null,
  players: Player[]
): void => {
  if (!socket || socket.readyState !== PartySocket.OPEN) {
    console.error("Socket not ready");
    return;
  }
  socket.send(
    JSON.stringify({
      type: "endOfRound",
      players,
    })
  );
};

// Legacy message senders (if still needed)
export const sendJoinRoom = (
  socket: PartySocket | null,
  roomId: string,
  userId: string
): void => {
  sendMessage(socket, "JOIN_ROOM", { roomId }, userId);
};

export const sendLeaveRoom = (
  socket: PartySocket | null,
  roomId: string,
  userId: string
): void => {
  sendMessage(socket, "LEAVE_ROOM", { roomId }, userId, roomId);
};

export const sendRequestRoomList = (
  socket: PartySocket | null,
  userId: string
): void => {
  sendMessage(socket, "ROOM_LIST_UPDATE", {}, userId);
};

export const sendGameAction = (
  socket: PartySocket | null,
  action: any,
  userId: string,
  roomId: string
): void => {
  sendMessage(socket, "GAME_STATE_UPDATE", action, userId, roomId);
};

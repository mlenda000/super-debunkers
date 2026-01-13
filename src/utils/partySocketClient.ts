import PartySocket from "partysocket";
import { store } from "../store";
import {
  setPlayerName,
  setAvatarImage,
  setPlayerId,
  setPlayerReady,
} from "../store/slices/playerSlice";
import {
  setRoomId,
  addPlayer,
  updatePlayer,
  removePlayer,
  setPlayers,
  setGameStarted,
  setIsHost,
} from "../store/slices/gameSlice";
import type { OtherPlayer } from "../store/slices/gameSlice";

export interface PlayerJoinMessage {
  type: "player:join";
  playerId: string;
  playerName: string;
  avatarImage: string;
  isReady: boolean;
}

export interface PlayerUpdateMessage {
  type: "player:update";
  playerId: string;
  playerName?: string;
  avatarImage?: string;
  isReady?: boolean;
}

export interface PlayerLeaveMessage {
  type: "player:leave";
  playerId: string;
}

export interface GameStartMessage {
  type: "game:start";
  players: OtherPlayer[];
}

export interface RoomStateMessage {
  type: "room:state";
  roomId: string;
  players: OtherPlayer[];
  isHost: boolean;
  gameStarted: boolean;
}

export type GameMessage =
  | PlayerJoinMessage
  | PlayerUpdateMessage
  | PlayerLeaveMessage
  | GameStartMessage
  | RoomStateMessage;

let socket: PartySocket | null = null;

export const connectToPartySocket = (
  host: string,
  room: string,
  options?: { onOpen?: () => void; onError?: (error: Event) => void }
) => {
  if (socket) {
    socket.close();
  }

  socket = new PartySocket({
    host,
    room,
  });

  socket.addEventListener("open", () => {
    console.log("Connected to PartySocket");
    store.dispatch(setRoomId(room));
    options?.onOpen?.();
  });

  socket.addEventListener("message", (event) => {
    try {
      const message: GameMessage = JSON.parse(event.data);
      handleGameMessage(message);
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  });

  socket.addEventListener("error", (error) => {
    console.error("PartySocket error:", error);
    options?.onError?.(error);
  });

  socket.addEventListener("close", () => {
    console.log("Disconnected from PartySocket");
  });

  return socket;
};

const handleGameMessage = (message: GameMessage) => {
  switch (message.type) {
    case "player:join":
      store.dispatch(
        addPlayer({
          playerId: message.playerId,
          playerName: message.playerName,
          avatarImage: message.avatarImage,
          isReady: message.isReady,
        })
      );
      break;

    case "player:update":
      store.dispatch(
        updatePlayer({
          playerId: message.playerId,
          playerName: message.playerName || "",
          avatarImage: message.avatarImage || "",
          isReady: message.isReady || false,
        })
      );
      break;

    case "player:leave":
      store.dispatch(removePlayer(message.playerId));
      break;

    case "game:start":
      store.dispatch(setGameStarted(true));
      store.dispatch(setPlayers(message.players));
      break;

    case "room:state":
      store.dispatch(setRoomId(message.roomId));
      store.dispatch(setPlayers(message.players));
      store.dispatch(setIsHost(message.isHost));
      store.dispatch(setGameStarted(message.gameStarted));
      break;
  }
};

export const sendPlayerJoin = (
  playerName: string,
  avatarImage: string,
  playerId: string
) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }

  const message: PlayerJoinMessage = {
    type: "player:join",
    playerId,
    playerName,
    avatarImage,
    isReady: false,
  };

  socket.send(JSON.stringify(message));

  // Update local state
  store.dispatch(setPlayerId(playerId));
  store.dispatch(setPlayerName(playerName));
  store.dispatch(setAvatarImage(avatarImage));
};

export const sendPlayerUpdate = (updates: {
  playerName?: string;
  avatarImage?: string;
  isReady?: boolean;
}) => {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }

  const state = store.getState();
  const playerId = state.player.playerId;

  if (!playerId) {
    console.error("Player ID not set");
    return;
  }

  const message: PlayerUpdateMessage = {
    type: "player:update",
    playerId,
    ...updates,
  };

  socket.send(JSON.stringify(message));

  // Update local state
  if (updates.playerName) store.dispatch(setPlayerName(updates.playerName));
  if (updates.avatarImage) store.dispatch(setAvatarImage(updates.avatarImage));
  if (updates.isReady !== undefined)
    store.dispatch(setPlayerReady(updates.isReady));
};

export const disconnectFromPartySocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const getSocket = () => socket;

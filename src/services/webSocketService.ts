import PartySocket from "partysocket";
import { PARTYKIT_HOST } from "./env";
import { handleGameMessage } from "@/context/GameContextUtils";
import type { GameContextType } from "@/types/gameTypes";

let wsInstance: PartySocket | null = null;
let messageListeners: Array<(message: Record<string, unknown>) => void> = [];
let connectionPromise: Promise<void> | null = null;
let contextSetters: Partial<GameContextType> | null = null;
let messageBuffer: Record<string, unknown>[] = [];
const lastRegisteredSetters: Partial<GameContextType> | null = null;
let currentRoomId: string | null = null;

/**
 * Get current contextSetters status (for debugging)
 */
export const getContextSettersStatus = () => {
  return contextSetters !== null;
};

/**
 * Register GameContext setters for use in WebSocket message handling
 */
export const registerGameContextSetters = (
  setters: Partial<GameContextType>
) => {
  contextSetters = setters;
  // Process any buffered messages
  if (messageBuffer.length > 0) {
    messageBuffer.forEach((msg) => {
      console.log("[WebSocket] Processing buffered message:", msg.type);
      handleGameMessage(msg, contextSetters!);
    });
    messageBuffer = [];
  } else {
    console.log("[WebSocket] No buffered messages to process");
  }
};

export const initializeWebSocket = (
  roomId: string = "lobby"
): Promise<PartySocket> => {
  // Recover setters after HMR or if cleared
  if (!contextSetters && lastRegisteredSetters) {
    contextSetters = lastRegisteredSetters;
  }

  // If already connected to the same room, return existing instance
  if (
    wsInstance &&
    wsInstance.readyState === wsInstance.OPEN &&
    currentRoomId === roomId
  ) {
    return Promise.resolve(wsInstance);
  }

  // If switching rooms, close the existing connection
  if (wsInstance && currentRoomId !== roomId) {
    const oldInstance = wsInstance;
    wsInstance = null;
    connectionPromise = null;
    currentRoomId = null;
    // Close the old connection after clearing references
    oldInstance.close();
  }

  // If already connecting, wait for that connection
  if (connectionPromise && wsInstance) {
    return connectionPromise.then(() => wsInstance!);
  }

  currentRoomId = roomId;
  wsInstance = new PartySocket({
    host: PARTYKIT_HOST,
    room: roomId,
  });

  connectionPromise = new Promise<void>((resolve, reject) => {
    const onOpen = () => {
      console.log("Connected to the WebSocket server");
      wsInstance?.removeEventListener("open", onOpen);
      wsInstance?.removeEventListener("error", onError);
      resolve();
    };

    const onError = (error: Event) => {
      console.error("WebSocket connection error:", error);
      wsInstance?.removeEventListener("open", onOpen);
      wsInstance?.removeEventListener("error", onError);
      reject(error);
    };

    wsInstance!.addEventListener("open", onOpen);
    wsInstance!.addEventListener("error", onError);
  });

  wsInstance.addEventListener("message", (event: MessageEvent) => {
    const message = event.data;
    if (message && typeof message === "string") {
      try {
        const parsedMessage = JSON.parse(message);
        if (contextSetters) {
          console.log(
            `[WebSocket] Calling handleGameMessage with type:`,
            parsedMessage.type
          );
          handleGameMessage(parsedMessage, contextSetters);
        } else {
          console.warn(
            "contextSetters is null when message received! Buffering message."
          );
          messageBuffer.push(parsedMessage);
        }
        messageListeners.forEach((listener) => listener(parsedMessage));
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    }
  });

  wsInstance.addEventListener("close", (event: CloseEvent) => {
    // Ignore closes from stale sockets (e.g., previous room connections)
    if (event.target !== wsInstance) {
      console.log(
        `[WebSocket] Ignoring close from stale socket code=${event.code} reason=${event.reason}`
      );
      return;
    }
    connectionPromise = null;
    wsInstance = null;
    // keep contextSetters so they survive reconnects / HMR
    currentRoomId = null;
  });

  wsInstance.addEventListener("error", (error: Event) => {
    console.error("WebSocket error:", error);
  });

  return connectionPromise.then(() => wsInstance!);
};

/**
 * Get current WebSocket instance
 */
export const getWebSocketInstance = (): PartySocket | null => {
  return wsInstance;
};

/**
 * Send a message through the WebSocket
 * Waits for connection if currently connecting
 */
export const sendWebSocketMessage = async (
  message: Record<string, unknown>
): Promise<void> => {
  // If connection is in progress, wait for it
  if (
    connectionPromise &&
    wsInstance &&
    wsInstance.readyState !== wsInstance.OPEN
  ) {
    await connectionPromise;
  }

  if (!wsInstance || wsInstance.readyState !== wsInstance.OPEN) {
    console.error("WebSocket connection is not open. Cannot send message.");
    return;
  }

  wsInstance.send(JSON.stringify(message));
};

/**
 * Subscribe to incoming WebSocket messages
 */
export const subscribeToMessages = (
  callback: (message: Record<string, unknown>) => void
): (() => void) => {
  messageListeners.push(callback);

  // Return unsubscribe function
  return () => {
    messageListeners = messageListeners.filter(
      (listener) => listener !== callback
    );
  };
};

/**
 * Validate existing playerId with server or request a new one
 * Waits for connection to be open before sending
 * Saves playerId to localStorage automatically
 */
export const requestPlayerId = async (): Promise<() => void> => {
  // Wait for connection to be ready
  await initializeWebSocket();

  const existingPlayerId = localStorage.getItem("playerId");
  console.log("Existing playerId from localStorage:", existingPlayerId);

  // Subscribe BEFORE sending so we don't miss the response
  const unsubscribe = subscribeToMessages((message) => {
    console.log("Checking message for playerId:", message);

    // Handle new playerId response
    if (
      message.type === "playerId" &&
      message.id &&
      typeof message.id === "string"
    ) {
      console.log("Received playerId:", message.id);
      localStorage.setItem("playerId", message.id);
    }

    // Handle validation response
    if (message.type === "playerIdValid" && message.valid === true) {
      console.log("Existing playerId is valid");
    }

    if (message.type === "playerIdInvalid" || message.valid === false) {
      console.log("Existing playerId is invalid, requesting new one");
      localStorage.removeItem("playerId");
      sendWebSocketMessage({ type: "getPlayerId" });
    }
  });

  if (existingPlayerId) {
    console.log("Validating existing playerId:", existingPlayerId);
    sendWebSocketMessage({
      type: "validatePlayerId",
      playerId: existingPlayerId,
    });
  } else {
    console.log("Sending getPlayerId request...");
    sendWebSocketMessage({ type: "getPlayerId" });
  }

  return unsubscribe;
};

/**
 * Send player enters room message
 */
export const sendPlayerEnters = (
  room: string,
  player: { name: string; avatar: string; room: string }
): void => {
  sendWebSocketMessage({
    type: "playerEnters",
    room,
    player,
  });
};

/**
 * Send entered lobby message
 */
export const sendEnteredLobby = (
  room: string | undefined,
  avatar: string,
  name: string
): void => {
  sendWebSocketMessage({
    type: "enteredLobby",
    room,
    avatar,
    name,
  });
};

/**
 * Close WebSocket connection
 */
export const closeWebSocket = (): void => {
  if (wsInstance) {
    wsInstance.close();
    wsInstance = null;
    messageListeners = [];
    currentRoomId = null;
  }
};

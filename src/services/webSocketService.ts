import PartySocket from "partysocket";
import type {
  MessageType,
  WebSocketMessage,
  MessageHandler,
} from "@/types/serverTypes";
import type { RoomData } from "@/types/gameTypes";
import { PARTYKIT_HOST } from "./env";

class WebSocketService {
  private host: string;
  private partyName: string;
  private socket: PartySocket | null = null;
  private userId: string | null = null;
  private currentRoom: string | null = null;
  private messageHandlers: Map<MessageType, MessageHandler[]> = new Map();
  private isConnected: boolean = false;

  constructor(host: string, partyName: string = "main") {
    this.host = host;
    this.partyName = partyName;
  }

  // Connect or reconnect options
  private buildSocketOptions(room: string, token?: string) {
    const query = token ? { token } : undefined;
    return {
      host: this.host,
      party: this.partyName,
      room,
      id: this.userId || undefined,
      query,
    } as const;
  }

  // Generate unique user ID
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize connection
  connect(
    options: { room?: string; token?: string; roomData?: RoomData } = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = this.generateUserId();

        if (options.roomData) {
          this.partyName = options.roomData.name;
        }

        const room = options.room ?? "lobby";

        this.socket = new PartySocket(
          this.buildSocketOptions(room, options.token)
        );

        this.currentRoom = room;

        this.socket.addEventListener("open", () => {
          this.isConnected = true;
          console.log("✅ Connected to PartyKit WebSocket");
          resolve(this.userId!);
        });

        this.socket.addEventListener("message", (event) => {
          this.handleMessage(event.data);
        });

        this.socket.addEventListener("close", () => {
          this.isConnected = false;
          console.log("Disconnected from WebSocket");
        });

        this.socket.addEventListener("error", (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Handle incoming messages
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      const handlers = this.messageHandlers.get(message.type);

      if (handlers) {
        handlers.forEach((handler) => handler(message));
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }

  // Subscribe to specific message types
  on(messageType: MessageType, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Subscribe to all raw messages (used by UI to react to server updates)
  subscribeToMessages(
    handler: (message: WebSocketMessage) => void
  ): () => void {
    const socket = this.socket;

    if (!socket) {
      return () => {};
    }

    const listener = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data as string);
        handler(parsed);
      } catch (error) {
        console.error("Error parsing message in subscribeToMessages", error);
      }
    };

    socket.addEventListener("message", listener);

    return () => {
      socket.removeEventListener("message", listener);
    };
  }

  // Switch from lobby to game room using updateProperties + reconnect
  async switchToRoom(options: {
    roomId: string;
    roomData?: RoomData;
    token?: string;
  }): Promise<void> {
    const { roomId, roomData, token } = options;

    if (!this.socket) {
      // If no socket exists yet, establish a connection first
      await this.connect({ room: roomId, roomData, token });
      return;
    }

    if (roomData) {
      this.partyName = roomData.name;
    }

    const query = token ? { token } : undefined;

    this.socket.updateProperties({
      room: roomId,
      party: this.partyName,
      query,
    });
    this.socket.reconnect();
    this.currentRoom = roomId;
  }

  // Return to lobby
  returnToLobby(): void {
    this.switchToRoom({ roomId: "lobby" });
    this.currentRoom = null;
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.readyState === PartySocket.OPEN;
  }

  // Get user ID
  getUserId(): string | null {
    return this.userId;
  }

  // Get current room
  getCurrentRoom(): string | null {
    return this.currentRoom;
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.messageHandlers.clear();
    this.isConnected = false;
  }

  // Get socket instance for utils
  getSocket(): PartySocket | null {
    return this.socket;
  }
}

export default WebSocketService;

// --- Singleton helpers for app-wide usage ---
const defaultService = new WebSocketService(PARTYKIT_HOST, "main");

export const initializeWebSocket = (
  roomOrOptions:
    | string
    | { room?: string; token?: string; roomData?: RoomData } = "lobby"
): Promise<string> => {
  const opts =
    typeof roomOrOptions === "string" ? { room: roomOrOptions } : roomOrOptions;
  return defaultService.connect(opts);
};

export const subscribeToMessages = (
  handler: (message: WebSocketMessage) => void
): (() => void) => {
  return defaultService.subscribeToMessages(handler);
};

export const switchRoom = async (options: {
  roomId: string;
  roomData?: RoomData;
  token?: string;
}): Promise<void> => {
  await defaultService.switchToRoom(options);
};

export const returnToLobby = async (): Promise<void> => {
  await defaultService.switchToRoom({ roomId: "lobby" });
};

export const getWebSocketInstance = (): PartySocket | null => {
  return defaultService.getSocket();
};

import type {
  Player,
  GameContextType,
  GameRoom,
  RoomData,
  GameDeck,
} from "@/types/gameTypes";

// Utility function to handle WebSocket messages and update GameContext state
// Usage: handleGameMessage(message, setters)

/**
 * Handles incoming game messages and updates context state using setters.
 * @param message - The message object from WebSocket (should be typed per message type, but left as object for flexibility).
 * @param setters - An object containing GameContext setter functions.
 */
export function handleGameMessage(
  message: Record<string, unknown>,
  setters: Partial<GameContextType>
) {
  if (!message || typeof message !== "object") return;
  switch (message.type) {
    case "playerId":
      if (setters.setCurrentPlayer)
        setters.setCurrentPlayer(message.id as string);
      break;
    case "lobbyUpdate": {
      const gameRoomObj: GameRoom = {
        count: Number(message.count),
        room: String(message.room),
        type: "lobbyUpdate",
        roomData: {
          count: Number((message.roomData as RoomData)?.count ?? message.count),
          players: ((message.roomData as RoomData)?.players ?? []) as Player[],
          name: String((message.roomData as RoomData)?.name ?? message.room),
        },
      };
      if (setters.setGameRoom) setters.setGameRoom(gameRoomObj);
      if (setters.setPlayers) setters.setPlayers(gameRoomObj.roomData.players);
      break;
    }
    case "roomUpdate": {
      const roomData = message.roomData as RoomData | undefined;
      const players = (message.players ?? roomData?.players ?? []) as Player[];
      const gameRoomObj: GameRoom = {
        count: Number(message.count ?? roomData?.count),
        room: String(message.room),
        type: "roomUpdate",
        roomData: {
          count: Number(roomData?.count ?? message.count),
          players: players,
          name: String(roomData?.name ?? message.room),
          deck: message.deck as GameDeck | undefined,
        },
      };
      if (setters.setGameRoom) setters.setGameRoom(gameRoomObj);
      if (setters.setPlayers) setters.setPlayers(gameRoomObj.roomData.players);

      break;
    }
    case "announcement":
      if (setters.setMessages)
        setters.setMessages((prev) => [
          ...prev,
          { text: message.text as string, type: "announcement" },
        ]);
      break;
    case "villain":
      if (setters.setCustomState)
        setters.setCustomState({ villain: message.villain as string });
      break;
    case "playerReady":
      // Support payload shapes:
      // - { players: Player[] }
      // - { roomData: { players: Player[] } }
      // - { roomData: Player[] } (server broadcasts array directly)
      if (setters.setPlayers) {
        let playersFromMsg: Player[] | undefined;
        const msgAny = message as any;
        if (Array.isArray(msgAny.players)) {
          playersFromMsg = msgAny.players as Player[];
        } else if (
          msgAny.roomData &&
          Array.isArray((msgAny.roomData as RoomData)?.players)
        ) {
          playersFromMsg = (msgAny.roomData as RoomData).players as Player[];
        } else if (Array.isArray(msgAny.roomData)) {
          playersFromMsg = msgAny.roomData as Player[];
        }
        if (playersFromMsg) {
          setters.setPlayers(playersFromMsg);
        }
      }
      break;
    case "allReady":
      if (setters.setCustomState)
        setters.setCustomState({ allReady: message.roomData as boolean });
      break;
    case "scoreUpdate":
      if (setters.setPlayers) setters.setPlayers(message.players as Player[]);
      break;
    case "endOfRound":
      if (setters.setPlayers && message.players)
        setters.setPlayers(message.players as Player[]);
      // Optionally handle round end logic here
      break;
    // Add more cases as needed for your game logic
    default:
      // Optionally handle unknown message types
      break;
  }
}

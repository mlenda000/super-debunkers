import type { Player, GameContextType } from "@/types/gameTypes";
import type { NewsCardProps } from "@/types/types";

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
    case "lobbyUpdate":
      if (setters.setGameRoom) setters.setGameRoom(message.room as string);
      if (
        setters.setPlayers &&
        message.roomData &&
        typeof message.roomData === "object"
      )
        setters.setPlayers(
          (message.roomData as { players: unknown }).players as Player[]
        );
      break;
    case "roomUpdate":
      if (setters.setGameRoom) setters.setGameRoom(message.room as string);
      if (setters.setPlayers) setters.setPlayers(message.players as Player[]);
      if (setters.setSettings && message.deck)
        setters.setSettings({ deck: message.deck as NewsCardProps[] });
      break;
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
      if (setters.setPlayers) setters.setPlayers(message.roomData as Player[]);
      break;
    case "allReady":
      if (setters.setCustomState)
        setters.setCustomState({ allReady: message.roomData as boolean });
      break;
    case "shuffledDeck":
      if (setters.setSettings)
        setters.setSettings({
          deck: message.data as NewsCardProps[],
          isShuffled: message.isShuffled as boolean,
        });
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

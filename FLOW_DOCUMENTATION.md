# Complete Game Flow Documentation

## Overview

This document describes the complete user flow from userId generation, lobby entry, room switching, gameplay, and returning to the lobby.

## Complete Flow: userId Generation → Lobby → Room Switch → Play → Return to Lobby

### 1. **App Initialization & userId Generation**

**Client (GlobalProvider)**

- On app load, `GlobalProvider` checks if playerId is valid in localStorage
- If not valid or expired:
  1. Calls `initializeWebSocket("lobby")` → Establishes WebSocket connection
  2. Subscribes to `"playerId"` messages
  3. Calls `sendGetPlayerId()` → Fetches socket automatically and sends request
  4. Receives `playerId` from server
  5. Stores in localStorage: `playerId`, `playerIdTimestamp`

**Server (server.ts)**

```
Case: "getPlayerId"
→ sender.send({ type: "playerId", id: sender.id })
```

**Timeline:**

```
Client App Loads
    ↓
GlobalProvider initializes WebSocket
    ↓
Socket connects (open event)
    ↓
sendGetPlayerId() called → auto-fetches socket
    ↓
Server receives getPlayerId
    ↓
Server sends playerId response
    ↓
Client receives playerId, stores in localStorage
```

---

### 2. **Lobby Page Entry**

**User Journey:**

1. User navigates to `/game/lobby`
2. `Lobby` component mounts

**Client (Lobby.tsx)**

```typescript
useEffect(() => {
  const sendLobbyMessage = async () => {
    const avatarName = avatar?.substring(avatar.lastIndexOf("/") + 1) || "";
    await initializeWebSocket("lobby");
    // sendEnteredLobby now auto-fetches socket if not provided
    sendEnteredLobby(undefined, "lobby", avatarName, playerName || "");
  };
  sendLobbyMessage();
}, [avatar, playerName]);
```

**Server (server.ts)**

```
Case: "enteredLobby"
→ Builds room counts: Record<string, Room>
→ Broadcasts lobbyUpdate with room data
```

**Timeline:**

```
User enters Lobby page
    ↓
sendEnteredLobby() called → auto-fetches socket
    ↓
Server receives enteredLobby message
    ↓
Server builds room counts and broadcasts update
    ↓
Client receives lobbyUpdate message
    ↓
Lobby UI displays available rooms with player counts
```

---

### 3. **Room Switching (Lobby → Game Room)**

**User Journey:**

1. User clicks a room in the Lobby
2. `handleClick()` is triggered

**Client (Lobby.tsx)**

```typescript
const handleClick = async (name: string, room: string, avatarPath: string) => {
  const avatarName = avatarPath.substring(avatarPath.lastIndexOf("/") + 1);

  if (room === "Create room") {
    navigate("/game/create-room");
  } else {
    const token = localStorage.getItem("authToken") || undefined;

    // Switch room via WebSocket
    await switchRoom({ party: "game", roomId: room, token });

    // Subscribe to roomUpdate confirmation
    const unsubscribe = subscribeToMessages((message) => {
      if (message.type === "roomUpdate" && message.room === room) {
        unsubscribe();
        navigate(`/game/${room}`);
      }
    });

    // Send playerEnters message (auto-fetches socket)
    const socket = getWebSocketInstance();
    sendPlayerEnters(socket, { name, avatar: avatarName, room }, room);

    // Fallback navigation after 2 seconds
    setTimeout(() => {
      console.log(`[Lobby] Timeout reached, navigating to game anyway`);
      unsubscribe();
      navigate(`/game/${room}`);
    }, 2000);
  }
};
```

**WebSocket (webSocketService.ts)**

```typescript
switchToRoom({ roomId: string, roomData?: RoomData, token?: string })
→ socket.updateProperties({ room: roomId, party: this.partyName, query })
→ socket.reconnect()
→ currentRoom = roomId
```

**Server (server.ts)**

```
Case: "playerEnters"
→ player.id = sender.id
→ player.score = 0
→ Find or create room
→ If room doesn't exist, shuffle deck
→ Broadcast roomUpdate with players, count, deck
```

**Timeline:**

```
User clicks room in Lobby
    ↓
switchRoom() called → Updates socket properties & reconnects
    ↓
Socket reconnects to game room
    ↓
sendPlayerEnters() called
    ↓
Server receives playerEnters
    ↓
Server adds player to room, initializes deck
    ↓
Server broadcasts roomUpdate
    ↓
Client receives roomUpdate confirmation
    ↓
Client navigates to `/game/{roomId}`
    ↓
GamePage renders with MainTable & GameTable components
```

---

### 4. **Gameplay - Influencer Ready & Player Ready States**

**Client (MainTable.tsx)**

```typescript
useEffect(() => {
  if (!currentInfluencer) return;

  setThemeStyle(currentInfluencer?.villain as ThemeStyle);
  const tactic = Array.isArray(currentInfluencer?.tacticUsed)
    ? currentInfluencer?.tacticUsed
    : [currentInfluencer?.tacticUsed];

  // sendInfluencerReady auto-fetches socket
  sendInfluencerReady(
    currentInfluencer?.villain as ThemeStyle,
    tactic as string[]
  );
}, [currentInfluencer]);

const handlePlayerReady = () => {
  const updatedPlayers = (gameRoom?.roomData?.players || []).map((p) =>
    p?.name === name ? { ...p, isReady: true } : p
  );

  const socket = getWebSocketInstance();
  sendPlayerReady(socket, updatedPlayers as any);
  setPlayers?.(updatedPlayers);
  setGameRoom?.({
    ...gameRoom,
    roomData: { ...gameRoom.roomData, players: updatedPlayers },
  });
  setPlayerReady(true);
};
```

**Server (server.ts)**

```
Case: "influencer"
→ this.influencerCard = parsedContent
→ Broadcast villain message to all

Case: "playerReady"
→ Update players isReady status
→ Broadcast playerReady with updated roomData

Case: "playerNotReady"
→ Update players isReady status to false
→ Broadcast playerReady with updated roomData
```

---

### 5. **End of Round & Scoring**

**Client (GameTable.tsx)**

```typescript
useEffect(() => {
  if (allPlayersReady && !submitForScoring) {
    setRoundHasEnded(true);
    const players = gameRoom.roomData.players;
    const player = players.find((p: Player) => p.name === playerName);

    // sendEndOfRound now takes (players, round?, socket?) signature
    sendEndOfRound([player], gameRound ?? 0);
    setRoundEnd(true);
    setSubmitForScoring(true);
    setRoundHasEnded(false);
  }
}, [allPlayersReady, submitForScoring, gameRound, playerName, ...]);
```

**Server (server.ts)**

```
Case: "endOfRound"
→ calculateScore(parsedContent.players, this.players, this.influencerCard, currentRound)
→ If all scores updated:
   - resetPlayerForNextRound() for each player
   - Broadcast scoreUpdate with updated players
```

**Timeline:**

```
All players mark ready
    ↓
GameTable detects allPlayersReady condition
    ↓
sendEndOfRound([player], round) called → auto-fetches socket
    ↓
Server receives endOfRound
    ↓
Server calculates scores
    ↓
Server broadcasts scoreUpdate
    ↓
Client receives scoreUpdate
    ↓
ResultModal displays with scores
    ↓
Next round begins or game ends (if round 5 or final)
```

---

### 6. **Return to Lobby**

**User Journey:**

1. User clicks "Lobby" button (previously "Home") in Scoreboard during gameplay
2. OR game ends and user clicks return button

**Client (Scoreboard.tsx)**

```typescript
import { returnToLobby } from "@/services/webSocketService";

const handleReturnToLobby = async () => {
  try {
    setThemeStyle("all");
    await returnToLobby(); // Calls switchToRoom({ roomId: "lobby" })
    navigate("/game/lobby");
  } catch (error) {
    console.error("[Scoreboard] Failed to return to lobby:", error);
    navigate("/game/lobby");
  }
};
```

**WebSocket (webSocketService.ts)**

```typescript
export const returnToLobby = async (): Promise<void> => {
  await defaultService.switchToRoom({ roomId: "lobby" });
};
```

**Server (server.ts)**

```
onClose(connection: Party.Connection)
→ Find room with player
→ Remove player from room.players
→ room.count = room.players.length
→ Broadcast roomUpdate-PlayerLeft
→ If room.count === 0, remove room from rooms[]
→ Remove player from global players[]
```

**Timeline:**

```
User clicks "Lobby" button
    ↓
returnToLobby() called
    ↓
Socket updateProperties({ room: "lobby" })
    ↓
Socket reconnects to lobby
    ↓
Old connection closed
    ↓
Server onClose handler fires
    ↓
Server removes player from game room
    ↓
Server broadcasts roomUpdate-PlayerLeft
    ↓
Client navigates to `/game/lobby`
    ↓
Lobby page reappears with available rooms
```

---

## Data Flow Architecture

### Message Flow: Client → Server → Client

```
Client sends message:
{ type: MessageType, ...payload }
    ↓
Server receives in onMessage()
    ↓
Server processes and stores state
    ↓
Server broadcasts to clients:
{ type: ResponseType, roomData/players/... }
    ↓
Client subscribeToMessages() handler fires
    ↓
Client updates local context & UI
```

### State Management

**Client**

- GlobalProvider: playerId, playerName, avatar, auth
- GameProvider: players, gameRoom, currentPlayer, messages, customState, etc.
- localStorage: playerId, playerIdTimestamp, playerName, avatarImage, authToken

**Server**

- this.players: Global players array
- this.rooms: Array of game rooms
- this.lobby: Lobby room instance
- this.shuffledDeck: Deck for current round
- this.influencerCard: Current influencer card

---

## Socket Lifecycle

```
1. GlobalProvider: initializeWebSocket("lobby")
   → New PartySocket({ host, party: "game", room: "lobby" })
   → "open" event → resolve(userId)

2. Lobby: initializeWebSocket("lobby") already connected
   → sendEnteredLobby()

3. Lobby → GameRoom: switchRoom({ roomId: "game1" })
   → socket.updateProperties({ room: "game1", party: "game" })
   → socket.reconnect()
   → Server sees new room context

4. GameRoom → Lobby: returnToLobby()
   → socket.updateProperties({ room: "lobby", party: "game" })
   → socket.reconnect()
   → Old connection closes → onClose() cleans up old room
```

---

## Helper Functions Summary

### gameMessageUtils.ts

- `sendGetPlayerId(socket?)` - Auto-fetches socket if not provided
- `sendEnteredLobby(socket?, room, avatar?, name?)` - Auto-fetches socket if not provided
- `sendPlayerEnters(socket?, player, room)` - Takes socket or uses connection
- `sendInfluencerReady(villain, tactic)` - Auto-fetches socket
- `sendPlayerReady(socket?, players)` - Takes socket
- `sendPlayerNotReady(socket?, players)` - Takes socket
- `sendEndOfRound(players, round?, socket?)` - Auto-fetches socket if not provided

### webSocketService.ts

- `initializeWebSocket(room?)` - Connect to lobby (singleton)
- `switchRoom({ roomId, roomData?, token? })` - Switch rooms without recreating socket
- `returnToLobby()` - Switch to lobby room
- `subscribeToMessages(handler)` - Subscribe to all messages
- `getWebSocketInstance()` - Get socket for manual sends

---

## Key Improvements Made

1. **sendGetPlayerId**: Now auto-fetches socket via `getWebSocketInstance()` if not passed
2. **sendEnteredLobby**: Now auto-fetches socket if not passed (accepts `undefined`)
3. **sendEndOfRound**: Signature changed to `(players, round?, socket?)` to match usage in GameTable
4. **GlobalProvider**: Added logging and proper socket initialization before sending playerId request
5. **Scoreboard**: "Home" button → "Lobby" button that calls `returnToLobby()` instead of navigating to home
6. **returnToLobby**: New exported helper from webSocketService for clean room-switching

---

## Error Handling

- If socket not ready: Log warning (not error) and return early
- Client-side fallback: 2-second timeout for room switch before force-navigating
- Server-side cleanup: onClose() removes players from rooms and cleans up empty rooms
- Try-catch in all async handlers with navigate fallback

---

## Testing Checklist

✅ App loads → playerId generated and stored
✅ Lobby loads → socket initialized, enteredLobby sent
✅ Click room → room switch works, playerEnters sent, navigate works
✅ Place cards → influencerReady and playerReady messages sent
✅ All ready → endOfRound sent, scores calculated
✅ Click Lobby → returnToLobby() called, socket switches rooms, UI updates
✅ GameTable receives roomUpdate messages and updates state
✅ Multiple rounds work without issues
✅ Disconnect handling works properly

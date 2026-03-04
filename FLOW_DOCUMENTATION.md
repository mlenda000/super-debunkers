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

  setThemeStyle((currentInfluencer?.villain as ThemeStyle) || "all");
  const tactic = Array.isArray(currentInfluencer?.tacticUsed)
    ? currentInfluencer?.tacticUsed
    : [currentInfluencer?.tacticUsed];
  const roomName = gameRoom?.room || gameRoom?.roomData?.name || "";

  // sendInfluencerReady auto-fetches socket, now includes newsCard and room
  sendInfluencerReady(
    currentInfluencer,
    currentInfluencer?.villain as ThemeStyle,
    tactic as string[],
    roomName,
  );
}, [currentInfluencer]);

const handlePlayerReady = () => {
  // Prevent duplicate sends if already marked ready or if no cards placed
  if (playerReady || !finishRound) return;

  // Get the tactics placed on the table (by category name, e.g. "clickbait")
  const tacticIds = mainTableItems
    .filter((card) => String(card.id) !== "1")
    .map((card) => card.category);

  if (tacticIds.length === 0) return;

  // Match player by ID OR by name (inclusive fallback)
  const updatedPlayers = (gameRoom?.roomData?.players || []).map((p) => {
    const isCurrentPlayer =
      (currentPlayerId && p?.id === currentPlayerId) || p?.name === name;
    return isCurrentPlayer ? { ...p, isReady: true, tacticUsed: tacticIds } : p;
  });

  const socket = getWebSocketInstance();
  const roomName = gameRoom?.room || gameRoom?.roomData?.name || "";
  sendPlayerReady(socket, updatedPlayers as any, roomName);

  // Optimistically update local context
  setPlayers?.(updatedPlayers);
  setGameRoom?.({
    ...gameRoom,
    roomData: { ...gameRoom.roomData, players: updatedPlayers },
  });
  setPlayerReady(true);
};
```

**PlayArea (PlayArea.tsx)**

- Renders empty card slots based on `tacticUsed.length`
- Slot buttons are **enabled on desktop** (`onSelectCard` scrolls to hand) and **disabled on mobile** (`onSelectCard` is `undefined`)
- Cards can be placed via drag-and-drop (desktop) or tap-to-select (mobile)
- Played cards can be returned to hand via `handleReturnCard`
- Returning all cards sends `playerNotReady` and resets the ready state

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
// allPlayersReady is memoized from roomPlayers
const allPlayersReady = useMemo(() => {
  if (!Array.isArray(roomPlayers) || roomPlayers.length === 0) return false;
  return roomPlayers.every(
    (player) => player?.isReady === true && player?.tacticUsed?.length > 0,
  );
}, [roomPlayers]);

useEffect(() => {
  // Only send endOfRound once per round (guarded by endOfRoundSentRef)
  if (allPlayersReady && !submitForScoring && !endOfRoundSentRef.current) {
    endOfRoundSentRef.current = true;
    setRoundHasEnded(true);
    const players = gameRoom?.roomData?.players || [];
    const roomName = gameRoom?.room || gameRoom?.roomData?.name || "";
    sendEndOfRound(players as any, gameRound ?? 0, roomName);
    setRoundEnd(true);
    setSubmitForScoring(true);
    setRoundHasEnded(false);
    // Reset cards immediately so the table is clear before modals start
    setResetKey((prev) => prev + 1);
  }
}, [allPlayersReady, submitForScoring, gameRound, ...]);
```

**Card Reset via resetKey (MainTable.tsx)**

```typescript
// When resetKey increments, MainTable clears the play area immediately:
useEffect(() => {
  if (resetKey === 0 || resetKey === lastResetKeyRef.current) return;
  lastResetKeyRef.current = resetKey;

  setPlayersHandItems(originalItems); // Return all cards to hand
  setPlayerReady(false);
  setMainTableItems([]); // Clear the play area
  setSubmitForScoring(false);
  setFinishRound(false);
}, [resetKey]);
```

**scoreUpdate Subscription (GameTable.tsx)**

```typescript
// The scoreUpdate handler avoids double-resetting when this client
// already triggered the round end:
if (
  (message.type === "scoreUpdate" || message.type === "endOfRound") &&
  message.room === currentRoom
) {
  setRoundEnd(true);
  setSubmitForScoring(true);
  setFinishRound(false);
  // Only bump resetKey if this client didn't already reset via allPlayersReady
  if (!endOfRoundSentRef.current) {
    setResetKey((prev) => prev + 1);
  }
}
```

**Safety Net (GameTable.tsx)**

- If `submitForScoring` remains true for 25 seconds without a scoreUpdate, a recovery timer force-resets the state to prevent permanent game lock.

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
GameTable detects allPlayersReady condition (memoized)
    ↓
endOfRoundSentRef prevents duplicate sends
    ↓
sendEndOfRound(players, round, room) called → auto-fetches socket
    ↓
resetKey incremented → MainTable clears play area IMMEDIATELY
    ↓
setRoundEnd(true) → modal sequence begins
    ↓
Server receives endOfRound
    ↓
Server calculates scores
    ↓
Server broadcasts scoreUpdate
    ↓
Client receives scoreUpdate (no double-reset thanks to endOfRoundSentRef guard)
    ↓
Modal sequence: ResultModal (9s) → ResponseModal (3s) → ScoreModal (3s) → RoundModal (1.7s)
    ↓
Next round begins or game ends (if isGameOver)
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

- GlobalProvider: playerId, playerName, avatar, auth, sfxVolume, sfxMuted, themeStyle
- GameProvider: players, gameRoom, currentPlayer, gameRound, activeNewsCard, previousNewsCard, lastScoreUpdatePlayers, endGame, etc.
- localStorage: playerId, playerIdTimestamp, playerName, avatarImage, authToken
- sessionStorage: currentRoom (for reconnection after page refresh)

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
- `sendPlayerEnters(socket, player, room)` - Takes socket, sends playerEnters with player data
- `sendInfluencerReady(newsCard, villain?, tactic?, room?)` - Auto-fetches socket; sends full newsCard + villain + tactic + room
- `sendPlayerReady(socket, players, room?)` - Takes socket; sends updated players array with room
- `sendPlayerNotReady(socket, players, room?)` - Takes socket; sends players with isReady=false
- `sendPlayerLeaves(socket, room?)` - Takes socket; notifies server player left
- `sendEndOfRound(players, round?, room?, socket?)` - Auto-fetches socket; sends only scoring-relevant player data (id, name, avatar, tacticUsed)
- `sendCreateRoom(socket?, roomName)` - Auto-fetches socket; creates a new room
- `sendGetAvailableRooms(socket?)` - Auto-fetches socket; requests room list
- `sendEndGame(socket?, room)` - Auto-fetches socket; ends the game

### webSocketService.ts

- `initializeWebSocket(room?)` - Connect to lobby (singleton)
- `switchRoom({ roomId, roomData?, token? })` - Switch rooms without recreating socket
- `returnToLobby()` - Switch to lobby room
- `subscribeToMessages(handler)` - Subscribe to all messages
- `getWebSocketInstance()` - Get socket for manual sends

---

## Component Hierarchy (Game Page)

```
GamePage
├── RotateScreen
├── GameTable (DndContext wrapper)
│   ├── Scoreboard
│   ├── MainTable (wrapped in Droppable)
│   │   ├── NewsCard (current influencer card)
│   │   └── PlayArea
│   │       ├── PlayedCard (for each placed tactic)
│   │       ├── Slot buttons (empty card slots, enabled on desktop)
│   │       └── Ready button (finish round)
│   ├── PlayersHand (tactic cards to choose from)
│   ├── Toggle button (mobile only, "← Table")
│   └── DragOverlay (renders dragged card above all content)
├── Modal backdrop (shared dark overlay)
├── RoundModal → ResultModal → ResponseModal → ScoreModal → EndGameModal
└── InfoModal
```

---

## End-of-Round Modal Sequence

All modals use `useModalFade` (150ms CSS fade-out before dismiss callback).

| Step | Modal             | Display Time                    | Trigger to Next              |
| ---- | ----------------- | ------------------------------- | ---------------------------- |
| 1    | **RoundModal**    | 1.7s (auto-close)               | Game resumes                 |
| 2    | **ResultModal**   | 9s (with data) / 15s (max)      | → ResponseModal              |
| 3    | **ResponseModal** | 3s (with data) / 10s (fallback) | → ScoreModal                 |
| 4    | **ScoreModal**    | 3s                              | → RoundModal or EndGameModal |
| 5    | **EndGameModal**  | User-driven                     | —                            |

**Cards are cleared from the play area BEFORE the modal sequence starts** (resetKey is incremented in the allPlayersReady effect, not deferred to scoreUpdate).

---

## Reconnection Flow (Page Refresh / Disconnect)

**GamePage.tsx** handles reconnection when the WebSocket is not connected:

```
Page loads without active WebSocket
    ↓
Check sessionStorage for currentRoom
    ↓
Verify room still exists via HTTP fetch to server
    ↓
switchRoom({ roomId }) → establishes WebSocket connection
    ↓
subscribeToMessages() for handleMessage
    ↓
sendPlayerEnters() with stored player data (name, id, avatar)
    ↓
Server detects returning player → sends "reconnectState" message
    ↓
Client restores: gameRoom, players, deck, round, theme, newsCard
    ↓
Skip RoundModal (isReconnectRef = true)
    ↓
Game resumes from current state
```

**Key reconnection details:**

- `sessionStorage.currentRoom` persists across page refreshes but not tab close
- `previousNewsCard` is snapshotted before roomUpdate overwrites the active card
- If room doesn't exist or game is over, player is redirected to lobby
- `joinRejected` message from server also triggers lobby redirect

---

## Key Improvements Made

1. **sendGetPlayerId**: Auto-fetches socket via `getWebSocketInstance()` if not passed
2. **sendEnteredLobby**: Auto-fetches socket if not passed (accepts `undefined`)
3. **sendEndOfRound**: Signature `(players, round?, room?, socket?)` — sends only scoring-relevant data (id, name, avatar, tacticUsed), not scores
4. **sendInfluencerReady**: Now sends full newsCard object + villain + tactic + room
5. **sendPlayerReady**: Sends room parameter; matches player by ID OR name (inclusive)
6. **Scoreboard**: "Home" button → "Lobby" button that calls `returnToLobby()`
7. **returnToLobby**: Exported helper from webSocketService for clean room-switching
8. **Immediate card reset**: `resetKey` incremented in `allPlayersReady` effect, not deferred to `scoreUpdate` — cards clear before modals appear
9. **endOfRoundSentRef guard**: Prevents double-increment of `resetKey` when `scoreUpdate` arrives after local allPlayersReady already fired
10. **25s scoring timeout**: Safety net recovers from stuck scoring state
11. **Reconnection support**: GamePage detects missing WebSocket and reconnects with full state restoration
12. **Mobile/Desktop slot behavior**: PlayArea slots enabled on desktop (scroll to hand), disabled on mobile (use toggle button)
13. **SFX support**: Card placement plays audio via `placeSound` ref, respecting sfxVolume/sfxMuted from GlobalContext
14. **previousNewsCard**: Snapshotted before roomUpdate so ResultModal shows the correct card

---

## Error Handling

- If socket not ready: Log warning (not error) and return early
- Client-side fallback: 2-second timeout for room switch before force-navigating
- Server-side cleanup: onClose() removes players from rooms and cleans up empty rooms
- Try-catch in all async handlers with navigate fallback
- 25-second scoring timeout prevents permanent game lock
- Reconnection verifies room existence via HTTP before attempting WebSocket join
- `joinRejected` server message redirects to lobby
- React StrictMode guard: `setupTimeRef` prevents cleanup from firing playerLeaves on immediate unmount

---

## Testing Checklist

✅ App loads → playerId generated and stored
✅ Lobby loads → socket initialized, enteredLobby sent
✅ Click room → room switch works, playerEnters sent, navigate works
✅ Place cards → influencerReady and playerReady messages sent
✅ All ready → endOfRound sent, cards cleared immediately, scores calculated
✅ Modal sequence plays in correct order with proper timing
✅ Cards are cleared from play area before modals appear
✅ Click Lobby → returnToLobby() called, socket switches rooms, UI updates
✅ GameTable receives roomUpdate messages and updates state
✅ Multiple rounds work without issues
✅ Disconnect handling works properly
✅ Page refresh → reconnects to game room with full state restoration
✅ Desktop slots are clickable (scroll to hand), mobile slots are disabled
✅ Card placement SFX plays at correct volume
✅ Scoring timeout recovers stuck game after 25s

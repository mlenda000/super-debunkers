# Redux Store Setup

This project uses Redux Toolkit for state management in a multiplayer game environment with PartySocket integration.

## Store Structure

### Player Slice (`store/slices/playerSlice.ts`)

Manages the local player's state:

- `playerId`: Unique identifier for the player
- `playerName`: Player's chosen name
- `avatarImage`: Path to the selected avatar image
- `isReady`: Whether the player is ready to start

### Game Slice (`store/slices/gameSlice.ts`)

Manages the game session state:

- `roomId`: Current room/session ID
- `isHost`: Whether the current player is the host
- `gameStarted`: Whether the game has begun
- `players`: Array of other players in the room
- `currentRound`: Current round number
- `maxRounds`: Total rounds in the game

## Usage Examples

### 1. Basic Setup (Already Done)

The Redux Provider is already wrapped in `src/main.tsx`:

```tsx
<Provider store={store}>
  <GlobalProvider>
    <App />
  </GlobalProvider>
</Provider>
```

### 2. Using Redux in Components

```tsx
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPlayerName, setAvatarImage } from "@/store/slices/playerSlice";

function PlayerSetup() {
  const dispatch = useAppDispatch();

  // Select state from the store
  const playerName = useAppSelector((state) => state.player.playerName);
  const avatarImage = useAppSelector((state) => state.player.avatarImage);

  // Update state
  const handleNameChange = (name: string) => {
    dispatch(setPlayerName(name));
  };

  const handleAvatarSelect = (avatar: string) => {
    dispatch(setAvatarImage(avatar));
  };

  return (
    <div>
      <input
        value={playerName || ""}
        onChange={(e) => handleNameChange(e.target.value)}
      />
      <button onClick={() => handleAvatarSelect("/avatars/avatar1.png")}>
        Select Avatar
      </button>
    </div>
  );
}
```

### 3. Using the Custom Hook

```tsx
import { useGameState } from "@/hooks/useGameState";

function GameLobby() {
  const {
    playerName,
    avatarImage,
    players,
    updatePlayerName,
    updateAvatarImage,
  } = useGameState();

  return (
    <div>
      <h2>Welcome {playerName}!</h2>
      <img src={avatarImage} alt="Your avatar" />

      <h3>Players in lobby:</h3>
      <ul>
        {players.map((player) => (
          <li key={player.playerId}>
            {player.playerName} - Ready: {player.isReady ? "✓" : "✗"}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4. PartySocket Integration

```tsx
import { useEffect } from "react";
import { usePartySocket } from "@/hooks/useGameState";

function MultiplayerSetup() {
  const { joinRoom, updatePlayer, leaveRoom } = usePartySocket();

  useEffect(() => {
    // Join room when component mounts
    joinRoom(
      "game-room-123", // roomId
      "player-unique-id", // playerId
      "John Doe", // playerName
      "/avatars/avatar1.png", // avatarImage
      "your-partykit-host.com" // PartySocket host
    );

    // Clean up on unmount
    return () => {
      leaveRoom();
    };
  }, []);

  const markReady = () => {
    updatePlayer({ isReady: true });
  };

  return <button onClick={markReady}>I'm Ready!</button>;
}
```

## Available Actions

### Player Actions

- `setPlayerId(id)` - Set player ID
- `setPlayerName(name)` - Set player name
- `setAvatarImage(avatar)` - Set avatar image path
- `setPlayerReady(boolean)` - Set ready status
- `setPlayerData(data)` - Set multiple fields at once
- `resetPlayer()` - Reset to initial state

### Game Actions

- `setRoomId(id)` - Set room ID
- `setIsHost(boolean)` - Set host status
- `setGameStarted(boolean)` - Set game started status
- `addPlayer(player)` - Add a player to the room
- `updatePlayer(player)` - Update a player's data
- `removePlayer(playerId)` - Remove a player from the room
- `setPlayers(players)` - Set all players at once
- `setCurrentRound(round)` - Set current round
- `incrementRound()` - Increment round by 1
- `resetGame()` - Reset game to initial state

## PartySocket Messages

The system handles these message types:

- `player:join` - When a player joins the room
- `player:update` - When a player updates their data
- `player:leave` - When a player leaves the room
- `game:start` - When the game starts
- `room:state` - Full room state update

## Next Steps

1. Update your PartySocket host URL in `usePartySocket` hook
2. Implement the PartySocket server to handle these message types
3. Update components to use the Redux store instead of local state
4. Add persistence to localStorage if needed
5. Add more game-specific state as needed (scores, cards, etc.)

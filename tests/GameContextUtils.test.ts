/**
 * GameContextUtils Edge Case Tests
 *
 * Tests handleGameMessage() — the pure function that converts incoming
 * WebSocket messages into GameContext state updates.
 */

import { describe, it, expect, vi } from "vitest";
import { handleGameMessage } from "@/context/GameContextUtils";
import type { GameContextType, Player, Message } from "@/types/gameTypes";

/** Build a partial setters object with vitest mocks */
function createSetters(): Partial<GameContextType> & { [k: string]: any } {
  return {
    setCurrentPlayer: vi.fn(),
    setGameRoom: vi.fn(),
    setPlayers: vi.fn(),
    setMessages: vi.fn(),
    setCustomState: vi.fn(),
  };
}

// ============================================
// BASIC MESSAGE TYPES
// ============================================
describe("handleGameMessage - playerId", () => {
  it("should set currentPlayer from playerId message", () => {
    const setters = createSetters();
    handleGameMessage({ type: "playerId", id: "abc-123" }, setters);
    expect(setters.setCurrentPlayer).toHaveBeenCalledWith("abc-123");
  });

  it("should not throw when setter is missing", () => {
    expect(() =>
      handleGameMessage({ type: "playerId", id: "abc" }, {}),
    ).not.toThrow();
  });
});

describe("handleGameMessage - lobbyUpdate", () => {
  it("should set gameRoom and players from lobbyUpdate", () => {
    const setters = createSetters();
    const players: Player[] = [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
    ];
    handleGameMessage(
      {
        type: "lobbyUpdate",
        count: 2,
        room: "test-room",
        roomData: { count: 2, players, name: "test-room" },
      },
      setters,
    );

    expect(setters.setGameRoom).toHaveBeenCalledTimes(1);
    const gameRoomArg = (setters.setGameRoom as any).mock.calls[0][0];
    expect(gameRoomArg.count).toBe(2);
    expect(gameRoomArg.room).toBe("test-room");
    expect(gameRoomArg.type).toBe("lobbyUpdate");
    expect(gameRoomArg.roomData.players).toEqual(players);

    expect(setters.setPlayers).toHaveBeenCalledWith(players);
  });

  it("should fall back to count/room when roomData is missing", () => {
    const setters = createSetters();
    handleGameMessage(
      { type: "lobbyUpdate", count: 0, room: "empty-room" },
      setters,
    );

    const gameRoomArg = (setters.setGameRoom as any).mock.calls[0][0];
    expect(gameRoomArg.count).toBe(0);
    expect(gameRoomArg.roomData.players).toEqual([]);
    expect(gameRoomArg.roomData.name).toBe("empty-room");
  });
});

describe("handleGameMessage - roomUpdate", () => {
  it("should set gameRoom and players from roomUpdate", () => {
    const setters = createSetters();
    const players: Player[] = [{ id: "p1", name: "Alice", score: 100 }];
    handleGameMessage(
      {
        type: "roomUpdate",
        count: 1,
        room: "game-room",
        players,
        cardIndex: 3,
        deck: { type: "shuffledDeck", data: [], isShuffled: true },
      },
      setters,
    );

    expect(setters.setGameRoom).toHaveBeenCalledTimes(1);
    const gameRoomArg = (setters.setGameRoom as any).mock.calls[0][0];
    expect(gameRoomArg.type).toBe("roomUpdate");
    expect(gameRoomArg.cardIndex).toBe(3);
    expect(gameRoomArg.roomData.deck).toBeDefined();

    expect(setters.setPlayers).toHaveBeenCalledWith(players);
  });

  it("should fall back to roomData.players when top-level players is missing", () => {
    const setters = createSetters();
    const players: Player[] = [{ id: "p2", name: "Bob" }];
    handleGameMessage(
      {
        type: "roomUpdate",
        room: "room-x",
        roomData: { count: 1, players, name: "room-x" },
      },
      setters,
    );

    expect(setters.setPlayers).toHaveBeenCalledWith(players);
  });
});

describe("handleGameMessage - announcement", () => {
  it("should append announcement to messages", () => {
    const setters = createSetters();
    handleGameMessage(
      { type: "announcement", text: "Game starting!" },
      setters,
    );

    expect(setters.setMessages).toHaveBeenCalledTimes(1);
    // setMessages receives a callback — invoke it with a previous state
    const updater = (setters.setMessages as any).mock.calls[0][0];
    const prev: Message[] = [{ text: "old", type: "announcement" }];
    const result = updater(prev);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ text: "Game starting!", type: "announcement" });
  });
});

describe("handleGameMessage - villain", () => {
  it("should set villain in customState", () => {
    const setters = createSetters();
    handleGameMessage({ type: "villain", villain: "The_Celeb" }, setters);
    expect(setters.setCustomState).toHaveBeenCalledWith({
      villain: "The_Celeb",
    });
  });
});

// ============================================
// PLAYER READY — multiple payload shapes
// ============================================
describe("handleGameMessage - playerReady", () => {
  const players: Player[] = [
    { id: "p1", name: "Alice", isReady: true },
    { id: "p2", name: "Bob", isReady: false },
  ];

  it("should handle players array at top level", () => {
    const setters = createSetters();
    handleGameMessage({ type: "playerReady", players }, setters);
    expect(setters.setPlayers).toHaveBeenCalledWith(players);
  });

  it("should handle players inside roomData object", () => {
    const setters = createSetters();
    handleGameMessage(
      {
        type: "playerReady",
        roomData: { count: 2, players, name: "room" },
      },
      setters,
    );
    expect(setters.setPlayers).toHaveBeenCalledWith(players);
  });

  it("should handle players as roomData directly (array)", () => {
    const setters = createSetters();
    handleGameMessage({ type: "playerReady", roomData: players }, setters);
    expect(setters.setPlayers).toHaveBeenCalledWith(players);
  });

  it("should not call setPlayers when no recognizable payload", () => {
    const setters = createSetters();
    handleGameMessage({ type: "playerReady" }, setters);
    expect(setters.setPlayers).not.toHaveBeenCalled();
  });
});

describe("handleGameMessage - allReady", () => {
  it("should set allReady in customState", () => {
    const setters = createSetters();
    handleGameMessage({ type: "allReady", roomData: true }, setters);
    expect(setters.setCustomState).toHaveBeenCalledWith({ allReady: true });
  });

  it("should handle allReady false", () => {
    const setters = createSetters();
    handleGameMessage({ type: "allReady", roomData: false }, setters);
    expect(setters.setCustomState).toHaveBeenCalledWith({ allReady: false });
  });
});

describe("handleGameMessage - scoreUpdate", () => {
  it("should set players from scoreUpdate", () => {
    const setters = createSetters();
    const players: Player[] = [
      { id: "p1", name: "Alice", score: 200 },
      { id: "p2", name: "Bob", score: 150 },
    ];
    handleGameMessage({ type: "scoreUpdate", players }, setters);
    expect(setters.setPlayers).toHaveBeenCalledWith(players);
  });
});

describe("handleGameMessage - endOfRound", () => {
  it("should set players from endOfRound", () => {
    const setters = createSetters();
    const players: Player[] = [{ id: "p1", name: "Alice", score: 300 }];
    handleGameMessage({ type: "endOfRound", players }, setters);
    expect(setters.setPlayers).toHaveBeenCalledWith(players);
  });

  it("should not call setPlayers when endOfRound has no players", () => {
    const setters = createSetters();
    handleGameMessage({ type: "endOfRound" }, setters);
    expect(setters.setPlayers).not.toHaveBeenCalled();
  });
});

// ============================================
// EDGE CASES / GUARDS
// ============================================
describe("handleGameMessage - Guards", () => {
  it("should return early for null message", () => {
    const setters = createSetters();
    // @ts-expect-error testing runtime guard
    handleGameMessage(null, setters);
    expect(setters.setCurrentPlayer).not.toHaveBeenCalled();
    expect(setters.setPlayers).not.toHaveBeenCalled();
  });

  it("should return early for undefined message", () => {
    const setters = createSetters();
    // @ts-expect-error testing runtime guard
    handleGameMessage(undefined, setters);
    expect(setters.setCurrentPlayer).not.toHaveBeenCalled();
  });

  it("should return early for non-object message", () => {
    const setters = createSetters();
    // @ts-expect-error testing runtime guard
    handleGameMessage("not-an-object", setters);
    expect(setters.setCurrentPlayer).not.toHaveBeenCalled();
  });

  it("should silently ignore unknown message types", () => {
    const setters = createSetters();
    handleGameMessage({ type: "nonExistentType", data: 42 }, setters);
    // No setter should be called
    expect(setters.setCurrentPlayer).not.toHaveBeenCalled();
    expect(setters.setGameRoom).not.toHaveBeenCalled();
    expect(setters.setPlayers).not.toHaveBeenCalled();
    expect(setters.setMessages).not.toHaveBeenCalled();
    expect(setters.setCustomState).not.toHaveBeenCalled();
  });

  it("should handle message with type but missing payload gracefully", () => {
    const setters = createSetters();
    // playerId without id → sets undefined
    handleGameMessage({ type: "playerId" }, setters);
    expect(setters.setCurrentPlayer).toHaveBeenCalledWith(undefined);
  });

  it("should handle all setters being absent", () => {
    // No setters at all — should not throw
    expect(() =>
      handleGameMessage(
        {
          type: "lobbyUpdate",
          count: 1,
          room: "r",
          roomData: { count: 1, players: [], name: "r" },
        },
        {},
      ),
    ).not.toThrow();
  });
});

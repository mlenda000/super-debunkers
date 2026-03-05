/**
 * gameMessageUtils Edge Case Tests
 *
 * Tests the WebSocket message sender helpers.
 * Uses a mock PartySocket-like object to verify
 * message serialisation and socket-readiness guards.
 */

import { describe, it, expect, vi } from "vitest";

// We need to mock the webSocketService module BEFORE importing gameMessageUtils,
// because several senders fall back to getWebSocketInstance().
vi.mock("../src/services/webSocketService", () => ({
  getWebSocketInstance: vi.fn(() => null),
}));

import {
  sendMessage,
  sendGetPlayerId,
  sendEnteredLobby,
  sendCreateRoom,
  sendGetAvailableRooms,
  sendEndGame,
  sendPlayerEnters,
  sendPlayerReady,
  sendPlayerNotReady,
  sendPlayerLeaves,
  sendCheckAllReady,
  sendStartingDeck,
  sendEndOfRound,
} from "../src/utils/gameMessageUtils";
import { getWebSocketInstance } from "../src/services/webSocketService";

// Build a minimal mock socket
function createMockSocket(readyState = 1): any {
  return {
    readyState,
    OPEN: 1, // instance-level for fallback
    send: vi.fn(),
  };
}

// PartySocket.OPEN is a static property = WebSocket.OPEN = 1
// We patch it on the mock at the instance level and also reference it below.
const OPEN = 1;
const CLOSED = 3;

describe("sendMessage (base helper)", () => {
  it("should send JSON with type, payload, userId, roomId, and timestamp", () => {
    const socket = createMockSocket(OPEN);
    sendMessage(socket, "JOIN_ROOM" as any, { roomId: "r1" }, "u1", "r1");

    expect(socket.send).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("JOIN_ROOM");
    expect(sent.roomId).toBe("r1");
    expect(sent.userId).toBe("u1");
    expect(sent.timestamp).toBeTypeOf("number");
  });

  it("should not send when socket is null", () => {
    // No throw expected
    expect(() => sendMessage(null, "JOIN_ROOM" as any, {}, "u1")).not.toThrow();
  });

  it("should not send when socket is not OPEN", () => {
    const socket = createMockSocket(CLOSED);
    sendMessage(socket, "JOIN_ROOM" as any, {}, "u1");
    expect(socket.send).not.toHaveBeenCalled();
  });
});

describe("sendGetPlayerId", () => {
  it("should send getPlayerId via provided socket", () => {
    const socket = createMockSocket(OPEN);
    sendGetPlayerId(socket);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("getPlayerId");
  });

  it("should fall back to getWebSocketInstance when no socket provided", () => {
    const socket = createMockSocket(OPEN);
    (getWebSocketInstance as any).mockReturnValueOnce(socket);
    sendGetPlayerId();
    expect(socket.send).toHaveBeenCalledTimes(1);
  });

  it("should not throw when both socket and fallback are null", () => {
    (getWebSocketInstance as any).mockReturnValueOnce(null);
    expect(() => sendGetPlayerId()).not.toThrow();
  });
});

describe("sendEnteredLobby", () => {
  it("should send enteredLobby with room, avatar, and name", () => {
    const socket = createMockSocket(OPEN);
    sendEnteredLobby(socket, "lobby-1", "hero.png", "Alice");
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("enteredLobby");
    expect(sent.room).toBe("lobby-1");
    expect(sent.avatar).toBe("hero.png");
    expect(sent.name).toBe("Alice");
  });

  it("should not throw when socket is closed", () => {
    const socket = createMockSocket(CLOSED);
    expect(() => sendEnteredLobby(socket, "room")).not.toThrow();
    expect(socket.send).not.toHaveBeenCalled();
  });
});

describe("sendCreateRoom", () => {
  it("should send createRoom with roomName", () => {
    const socket = createMockSocket(OPEN);
    sendCreateRoom(socket, "new-room");
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("createRoom");
    expect(sent.roomName).toBe("new-room");
  });
});

describe("sendGetAvailableRooms", () => {
  it("should send getAvailableRooms", () => {
    const socket = createMockSocket(OPEN);
    sendGetAvailableRooms(socket);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("getAvailableRooms");
  });
});

describe("sendEndGame", () => {
  it("should send endGame with room", () => {
    const socket = createMockSocket(OPEN);
    sendEndGame(socket, "game-room");
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("endGame");
    expect(sent.room).toBe("game-room");
  });
});

describe("sendPlayerEnters", () => {
  it("should send player and room", () => {
    const socket = createMockSocket(OPEN);
    sendPlayerEnters(
      socket,
      { id: "p1", name: "Alice", avatar: "a.png" },
      "room-1",
    );
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("playerEnters");
    expect(sent.player.id).toBe("p1");
    expect(sent.room).toBe("room-1");
  });

  it("should not send when socket is null", () => {
    expect(() => sendPlayerEnters(null, { id: "p1" }, "room")).not.toThrow();
  });
});

describe("sendPlayerReady / sendPlayerNotReady", () => {
  it("should send playerReady with players array", () => {
    const socket = createMockSocket(OPEN);
    const players = [{ id: "p1", name: "Alice" }] as any[];
    sendPlayerReady(socket, players, "room-1");
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("playerReady");
    expect(sent.players).toEqual(players);
    expect(sent.room).toBe("room-1");
  });

  it("should send playerNotReady with players array", () => {
    const socket = createMockSocket(OPEN);
    const players = [{ id: "p1", name: "Alice" }] as any[];
    sendPlayerNotReady(socket, players, "room-1");
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("playerNotReady");
  });
});

describe("sendPlayerLeaves", () => {
  it("should send playerLeaves with room", () => {
    const socket = createMockSocket(OPEN);
    sendPlayerLeaves(socket, "room-1");
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("playerLeaves");
    expect(sent.room).toBe("room-1");
  });
});

describe("sendCheckAllReady", () => {
  it("should send allReady", () => {
    const socket = createMockSocket(OPEN);
    sendCheckAllReady(socket);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("allReady");
  });
});

describe("sendStartingDeck", () => {
  it("should send startingDeck with data and room", () => {
    const socket = createMockSocket(OPEN);
    const deck = [{ id: "card1" }, { id: "card2" }];
    sendStartingDeck(socket, deck, "room-1");
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("startingDeck");
    expect(sent.data).toEqual(deck);
    expect(sent.room).toBe("room-1");
  });
});

describe("sendEndOfRound", () => {
  it("should send only id, name, avatar, tacticUsed per player (not score)", () => {
    const socket = createMockSocket(OPEN);
    const players = [
      {
        id: "p1",
        name: "Alice",
        avatar: "a.png",
        tacticUsed: ["fear-mongering"],
        score: 999, // should NOT be sent
      },
    ] as any[];
    sendEndOfRound(players, 2, "room-1", socket);

    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("endOfRound");
    expect(sent.round).toBe(2);
    expect(sent.room).toBe("room-1");
    expect(sent.players[0].id).toBe("p1");
    expect(sent.players[0].tacticUsed).toEqual(["fear-mongering"]);
    // Score must NOT be included in the payload
    expect(sent.players[0].score).toBeUndefined();
  });

  it("should fall back to getWebSocketInstance when no socket provided", () => {
    const socket = createMockSocket(OPEN);
    (getWebSocketInstance as any).mockReturnValueOnce(socket);
    sendEndOfRound([{ id: "p1", name: "A", avatar: "a" }] as any[], 1, "r");
    expect(socket.send).toHaveBeenCalledTimes(1);
  });

  it("should not throw when socket is unavailable", () => {
    (getWebSocketInstance as any).mockReturnValueOnce(null);
    expect(() => sendEndOfRound([], 1, "room")).not.toThrow();
  });
});

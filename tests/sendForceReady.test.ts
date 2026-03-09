/**
 * sendForceReady & sendReadyCountdown Tests
 *
 * Tests the forceReady and readyCountdown WebSocket message senders.
 * Uses a mock PartySocket-like object to verify
 * message serialisation and socket-readiness guards.
 */

import { describe, it, expect, vi } from "vitest";

vi.mock("../src/services/webSocketService", () => ({
  getWebSocketInstance: vi.fn(() => null),
}));

import {
  sendForceReady,
  sendReadyCountdown,
} from "../src/utils/gameMessageUtils";
import { getWebSocketInstance } from "../src/services/webSocketService";

function createMockSocket(readyState = 1): any {
  return {
    readyState,
    OPEN: 1,
    send: vi.fn(),
  };
}

const OPEN = 1;
const CLOSED = 3;

// ===========================================================================
// sendForceReady
// ===========================================================================
describe("sendForceReady", () => {
  it("sends forceReady with room and playerId via provided socket", () => {
    const socket = createMockSocket(OPEN);
    sendForceReady(socket, "class-1", "player-42");
    expect(socket.send).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("forceReady");
    expect(sent.room).toBe("class-1");
    expect(sent.playerId).toBe("player-42");
  });

  it("only includes type, room, and playerId in the sent message", () => {
    const socket = createMockSocket(OPEN);
    sendForceReady(socket, "room-A", "p1");
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(Object.keys(sent).sort()).toEqual(["playerId", "room", "type"]);
  });

  it("sends valid JSON", () => {
    const socket = createMockSocket(OPEN);
    sendForceReady(socket, "room-B", "p2");
    expect(() => JSON.parse(socket.send.mock.calls[0][0])).not.toThrow();
  });

  it("falls back to getWebSocketInstance when socket is null", () => {
    const socket = createMockSocket(OPEN);
    (getWebSocketInstance as any).mockReturnValueOnce(socket);
    sendForceReady(null, "room-C", "p3");
    expect(socket.send).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("forceReady");
  });

  it("falls back to getWebSocketInstance when socket is undefined", () => {
    const socket = createMockSocket(OPEN);
    (getWebSocketInstance as any).mockReturnValueOnce(socket);
    sendForceReady(undefined, "room-D", "p4");
    expect(socket.send).toHaveBeenCalledTimes(1);
  });

  it("does not send when socket is not OPEN", () => {
    const socket = createMockSocket(CLOSED);
    sendForceReady(socket, "room-E", "p5");
    expect(socket.send).not.toHaveBeenCalled();
  });

  it("does not throw when both socket and fallback are null", () => {
    (getWebSocketInstance as any).mockReturnValueOnce(null);
    expect(() => sendForceReady(null, "room-F", "p6")).not.toThrow();
  });

  it("does not throw when both socket and fallback are undefined", () => {
    (getWebSocketInstance as any).mockReturnValueOnce(null);
    expect(() => sendForceReady(undefined, "room-G", "p7")).not.toThrow();
  });
});

// ===========================================================================
// sendReadyCountdown
// ===========================================================================
describe("sendReadyCountdown", () => {
  it("sends readyCountdown with room, playerId, and seconds via provided socket", () => {
    const socket = createMockSocket(OPEN);
    sendReadyCountdown(socket, "class-1", "player-1", 30);
    expect(socket.send).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("readyCountdown");
    expect(sent.room).toBe("class-1");
    expect(sent.playerId).toBe("player-1");
    expect(sent.seconds).toBe(30);
  });

  it("defaults to 30 seconds when no seconds provided", () => {
    const socket = createMockSocket(OPEN);
    sendReadyCountdown(socket, "class-2", "player-2");
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.seconds).toBe(30);
  });

  it("allows custom countdown durations", () => {
    const socket = createMockSocket(OPEN);
    sendReadyCountdown(socket, "class-3", "player-3", 15);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.seconds).toBe(15);
  });

  it("only includes type, room, playerId, and seconds in the sent message", () => {
    const socket = createMockSocket(OPEN);
    sendReadyCountdown(socket, "room-A", "p1", 10);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(Object.keys(sent).sort()).toEqual([
      "playerId",
      "room",
      "seconds",
      "type",
    ]);
  });

  it("sends valid JSON", () => {
    const socket = createMockSocket(OPEN);
    sendReadyCountdown(socket, "room-B", "p2", 20);
    expect(() => JSON.parse(socket.send.mock.calls[0][0])).not.toThrow();
  });

  it("falls back to getWebSocketInstance when socket is null", () => {
    const socket = createMockSocket(OPEN);
    (getWebSocketInstance as any).mockReturnValueOnce(socket);
    sendReadyCountdown(null, "room-C", "p3", 25);
    expect(socket.send).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("readyCountdown");
    expect(sent.playerId).toBe("p3");
  });

  it("falls back to getWebSocketInstance when socket is undefined", () => {
    const socket = createMockSocket(OPEN);
    (getWebSocketInstance as any).mockReturnValueOnce(socket);
    sendReadyCountdown(undefined, "room-D", "p4", 30);
    expect(socket.send).toHaveBeenCalledTimes(1);
  });

  it("does not send when socket is not OPEN", () => {
    const socket = createMockSocket(CLOSED);
    sendReadyCountdown(socket, "room-E", "p5", 10);
    expect(socket.send).not.toHaveBeenCalled();
  });

  it("does not throw when both socket and fallback are null", () => {
    (getWebSocketInstance as any).mockReturnValueOnce(null);
    expect(() => sendReadyCountdown(null, "room-F", "p6", 10)).not.toThrow();
  });

  it("does not throw when both socket and fallback are undefined", () => {
    (getWebSocketInstance as any).mockReturnValueOnce(null);
    expect(() =>
      sendReadyCountdown(undefined, "room-G", "p7", 10),
    ).not.toThrow();
  });
});

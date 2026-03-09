/**
 * sendObserveRoom Tests
 *
 * Tests the observeRoom WebSocket message sender.
 * Uses a mock PartySocket-like object to verify
 * message serialisation and socket-readiness guards.
 */

import { describe, it, expect, vi } from "vitest";

vi.mock("../src/services/webSocketService", () => ({
  getWebSocketInstance: vi.fn(() => null),
}));

import { sendObserveRoom } from "../src/utils/gameMessageUtils";
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

describe("sendObserveRoom", () => {
  it("should send observeRoom with roomName via provided socket", () => {
    const socket = createMockSocket(OPEN);
    sendObserveRoom(socket, "class-room-1");
    expect(socket.send).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("observeRoom");
    expect(sent.roomName).toBe("class-room-1");
  });

  it("should send correct roomName for rooms with special characters", () => {
    const socket = createMockSocket(OPEN);
    sendObserveRoom(socket, "Room With Spaces");
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("observeRoom");
    expect(sent.roomName).toBe("Room With Spaces");
  });

  it("should fall back to getWebSocketInstance when socket is null", () => {
    const socket = createMockSocket(OPEN);
    (getWebSocketInstance as any).mockReturnValueOnce(socket);
    sendObserveRoom(null, "test-room");
    expect(socket.send).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("observeRoom");
    expect(sent.roomName).toBe("test-room");
  });

  it("should fall back to getWebSocketInstance when socket is undefined", () => {
    const socket = createMockSocket(OPEN);
    (getWebSocketInstance as any).mockReturnValueOnce(socket);
    sendObserveRoom(undefined, "test-room");
    expect(socket.send).toHaveBeenCalledTimes(1);
  });

  it("should not send when socket is not OPEN", () => {
    const socket = createMockSocket(CLOSED);
    sendObserveRoom(socket, "test-room");
    expect(socket.send).not.toHaveBeenCalled();
  });

  it("should not throw when both socket and fallback are null", () => {
    (getWebSocketInstance as any).mockReturnValueOnce(null);
    expect(() => sendObserveRoom(null, "room")).not.toThrow();
  });

  it("should not throw when both socket and fallback are undefined", () => {
    (getWebSocketInstance as any).mockReturnValueOnce(null);
    expect(() => sendObserveRoom(undefined, "room")).not.toThrow();
  });

  it("should only include type and roomName in the sent message", () => {
    const socket = createMockSocket(OPEN);
    sendObserveRoom(socket, "my-room");
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(Object.keys(sent)).toEqual(["type", "roomName"]);
  });

  it("should send valid JSON", () => {
    const socket = createMockSocket(OPEN);
    sendObserveRoom(socket, "room-123");
    expect(() => JSON.parse(socket.send.mock.calls[0][0])).not.toThrow();
  });
});

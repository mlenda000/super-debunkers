/**
 * Audio Settings Client Tests
 *
 * Tests the sendUpdateAudioSettings WebSocket message sender.
 * Verifies message serialisation, socket-readiness guards,
 * and correct payload structure for all audio fields.
 */

import { describe, it, expect, vi } from "vitest";

vi.mock("../src/services/webSocketService", () => ({
  getWebSocketInstance: vi.fn(() => null),
}));

import { sendUpdateAudioSettings } from "../src/utils/gameMessageUtils";
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

describe("sendUpdateAudioSettings", () => {
  it("should send updateAudioSettings with all boolean fields", () => {
    const socket = createMockSocket(OPEN);
    sendUpdateAudioSettings(socket, "class-room-1", {
      volumeLocked: true,
      musicMuted: true,
      sfxMuted: true,
    });
    expect(socket.send).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("updateAudioSettings");
    expect(sent.room).toBe("class-room-1");
    expect(sent.volumeLocked).toBe(true);
    expect(sent.musicMuted).toBe(true);
    expect(sent.sfxMuted).toBe(true);
  });

  it("should include musicVolume and sfxVolume when provided", () => {
    const socket = createMockSocket(OPEN);
    sendUpdateAudioSettings(socket, "room-1", {
      volumeLocked: true,
      musicMuted: false,
      sfxMuted: false,
      musicVolume: 35,
      sfxVolume: 70,
    });
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.musicVolume).toBe(35);
    expect(sent.sfxVolume).toBe(70);
  });

  it("should send volume levels of zero correctly", () => {
    const socket = createMockSocket(OPEN);
    sendUpdateAudioSettings(socket, "room-1", {
      volumeLocked: true,
      musicMuted: true,
      sfxMuted: true,
      musicVolume: 0,
      sfxVolume: 0,
    });
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.musicVolume).toBe(0);
    expect(sent.sfxVolume).toBe(0);
  });

  it("should not include musicVolume/sfxVolume when omitted", () => {
    const socket = createMockSocket(OPEN);
    sendUpdateAudioSettings(socket, "room-1", {
      volumeLocked: false,
      musicMuted: false,
      sfxMuted: false,
    });
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.musicVolume).toBeUndefined();
    expect(sent.sfxVolume).toBeUndefined();
  });

  it("should not send when socket is not OPEN", () => {
    const socket = createMockSocket(CLOSED);
    sendUpdateAudioSettings(socket, "room-1", {
      volumeLocked: true,
      musicMuted: true,
      sfxMuted: true,
    });
    expect(socket.send).not.toHaveBeenCalled();
  });

  it("should fall back to getWebSocketInstance when socket is null", () => {
    const socket = createMockSocket(OPEN);
    (getWebSocketInstance as any).mockReturnValueOnce(socket);
    sendUpdateAudioSettings(null, "room-1", {
      volumeLocked: true,
      musicMuted: false,
      sfxMuted: false,
    });
    expect(socket.send).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.type).toBe("updateAudioSettings");
  });

  it("should fall back to getWebSocketInstance when socket is undefined", () => {
    const socket = createMockSocket(OPEN);
    (getWebSocketInstance as any).mockReturnValueOnce(socket);
    sendUpdateAudioSettings(undefined, "room-1", {
      volumeLocked: false,
      musicMuted: false,
      sfxMuted: false,
    });
    expect(socket.send).toHaveBeenCalledTimes(1);
  });

  it("should not throw when both socket and fallback are null", () => {
    (getWebSocketInstance as any).mockReturnValueOnce(null);
    expect(() =>
      sendUpdateAudioSettings(null, "room-1", {
        volumeLocked: true,
        musicMuted: true,
        sfxMuted: true,
      }),
    ).not.toThrow();
  });

  it("should send correct room name with special characters", () => {
    const socket = createMockSocket(OPEN);
    sendUpdateAudioSettings(socket, "Mr. Smith's Class", {
      volumeLocked: true,
      musicMuted: false,
      sfxMuted: false,
    });
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.room).toBe("Mr. Smith's Class");
  });

  it("should send unlocked and unmuted settings (Unmute All)", () => {
    const socket = createMockSocket(OPEN);
    sendUpdateAudioSettings(socket, "room-1", {
      volumeLocked: false,
      musicMuted: false,
      sfxMuted: false,
      musicVolume: 20,
      sfxVolume: 50,
    });
    const sent = JSON.parse(socket.send.mock.calls[0][0]);
    expect(sent.volumeLocked).toBe(false);
    expect(sent.musicMuted).toBe(false);
    expect(sent.sfxMuted).toBe(false);
    expect(sent.musicVolume).toBe(20);
    expect(sent.sfxVolume).toBe(50);
  });

  it("should produce valid JSON on the wire", () => {
    const socket = createMockSocket(OPEN);
    sendUpdateAudioSettings(socket, "room-1", {
      volumeLocked: true,
      musicMuted: true,
      sfxMuted: true,
      musicVolume: 42,
      sfxVolume: 88,
    });
    const raw = socket.send.mock.calls[0][0];
    expect(typeof raw).toBe("string");
    // Verify it's parseable JSON
    const parsed = JSON.parse(raw);
    expect(parsed).toBeDefined();
    expect(parsed.type).toBe("updateAudioSettings");
  });
});

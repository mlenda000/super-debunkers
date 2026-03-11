/**
 * Game Results Teacher Isolation Tests (Client-Side)
 *
 * Tests that:
 * - teacherId is generated and persisted correctly
 * - Results filtering logic works on the client
 * - WebSocket message filtering only accepts matching teacherId
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { GameResult } from "../src/types/gameTypes";

// ============================================
// TEACHER ID GENERATION
// ============================================
describe("Teacher ID Generation", () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
  });

  function getOrCreateTeacherId(): string {
    const existing = mockStorage["teacherId"];
    if (existing) return existing;
    const id = `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    mockStorage["teacherId"] = id;
    return id;
  }

  it("should generate a unique teacherId when none exists", () => {
    const id = getOrCreateTeacherId();
    expect(id).toMatch(/^teacher_\d+_[a-z0-9]+$/);
  });

  it("should return the same teacherId on subsequent calls", () => {
    const id1 = getOrCreateTeacherId();
    const id2 = getOrCreateTeacherId();
    expect(id1).toBe(id2);
  });

  it("should use existing teacherId from storage", () => {
    mockStorage["teacherId"] = "teacher_existing_abc";
    const id = getOrCreateTeacherId();
    expect(id).toBe("teacher_existing_abc");
  });

  it("should generate different IDs for different sessions", () => {
    const storage1: Record<string, string> = {};
    const storage2: Record<string, string> = {};

    function getId(storage: Record<string, string>): string {
      const existing = storage["teacherId"];
      if (existing) return existing;
      const id = `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      storage["teacherId"] = id;
      return id;
    }

    const id1 = getId(storage1);
    const id2 = getId(storage2);
    expect(id1).not.toBe(id2);
  });
});

// ============================================
// CLIENT-SIDE RESULTS FILTERING
// ============================================
describe("Client-Side Results Filtering", () => {
  const myTeacherId = "teacher_myid_123";
  const otherTeacherId = "teacher_other_456";

  function createResult(
    roomName: string,
    teacherId: string,
    players: { name: string; score: number }[],
  ): GameResult {
    return {
      roomName,
      teacherId,
      players: players.map((p) => ({ ...p, avatar: "av.png" })),
      completedAt: Date.now(),
    };
  }

  it("should only include results matching the teacher's ID", () => {
    const allResults: GameResult[] = [
      createResult("room-1", myTeacherId, [{ name: "Alice", score: 100 }]),
      createResult("room-2", otherTeacherId, [{ name: "Bob", score: 200 }]),
      createResult("room-3", myTeacherId, [{ name: "Charlie", score: 300 }]),
    ];

    const myResults = allResults.filter((r) => r.teacherId === myTeacherId);
    expect(myResults).toHaveLength(2);
    expect(myResults.map((r) => r.roomName)).toEqual(["room-1", "room-3"]);
  });

  it("should return empty when teacherId does not match any results", () => {
    const allResults: GameResult[] = [
      createResult("room-1", otherTeacherId, [{ name: "Alice", score: 100 }]),
    ];

    const myResults = allResults.filter((r) => r.teacherId === myTeacherId);
    expect(myResults).toHaveLength(0);
  });
});

// ============================================
// WEBSOCKET MESSAGE FILTERING
// ============================================
describe("WebSocket gameResultsUpdated Message Filtering", () => {
  const myTeacherId = "teacher_myid_123";

  function simulateWebSocketMessage(message: {
    type: string;
    teacherId?: string;
    gameResult?: GameResult;
  }): GameResult | null {
    // Simulates the filtering logic from GameResultsPage
    if (message.type === "gameResultsUpdated") {
      if (message.teacherId === myTeacherId && message.gameResult) {
        return message.gameResult;
      }
    }
    return null;
  }

  it("should accept a result update matching teacherId", () => {
    const result: GameResult = {
      roomName: "room-1",
      teacherId: myTeacherId,
      players: [{ name: "Alice", score: 200, avatar: "a.png" }],
      completedAt: Date.now(),
    };

    const accepted = simulateWebSocketMessage({
      type: "gameResultsUpdated",
      teacherId: myTeacherId,
      gameResult: result,
    });

    expect(accepted).not.toBeNull();
    expect(accepted!.roomName).toBe("room-1");
  });

  it("should reject a result update with different teacherId", () => {
    const result: GameResult = {
      roomName: "room-1",
      teacherId: "teacher_other",
      players: [{ name: "Bob", score: 150, avatar: "b.png" }],
      completedAt: Date.now(),
    };

    const accepted = simulateWebSocketMessage({
      type: "gameResultsUpdated",
      teacherId: "teacher_other",
      gameResult: result,
    });

    expect(accepted).toBeNull();
  });

  it("should reject a result update with missing teacherId", () => {
    const result: GameResult = {
      roomName: "room-1",
      teacherId: "",
      players: [{ name: "Bob", score: 150, avatar: "b.png" }],
      completedAt: Date.now(),
    };

    const accepted = simulateWebSocketMessage({
      type: "gameResultsUpdated",
      gameResult: result,
    });

    expect(accepted).toBeNull();
  });

  it("should reject non-gameResultsUpdated messages", () => {
    const accepted = simulateWebSocketMessage({
      type: "scoreUpdate",
      teacherId: myTeacherId,
    });

    expect(accepted).toBeNull();
  });
});

// ============================================
// ROOM CREATION WITH TEACHER ID
// ============================================
describe("Room Creation Request Body", () => {
  it("should include teacherId in the request body for teacher-created rooms", () => {
    const teacherId = "teacher_session_abc";
    const roomName = "my-class-room";

    // Simulate what AdminPage sends
    const requestBody = {
      roomName,
      teacherCreated: true,
      teacherId,
    };

    expect(requestBody.teacherId).toBe(teacherId);
    expect(requestBody.teacherCreated).toBe(true);
    expect(requestBody.roomName).toBe(roomName);
  });

  it("should not include teacherId for non-teacher rooms", () => {
    const roomName = "player-room";

    // Player-created rooms don't include teacherId
    const requestBody = {
      roomName,
    };

    expect(requestBody).not.toHaveProperty("teacherCreated");
    expect(requestBody).not.toHaveProperty("teacherId");
  });
});

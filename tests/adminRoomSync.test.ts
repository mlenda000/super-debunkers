/**
 * Admin Room Sync Tests
 *
 * Tests that teacherRooms are validated against the server on admin page load,
 * removing stale entries that no longer exist on the server.
 * Uses the same sync logic extracted from AdminPage's useEffect.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// The sync logic under test (mirrors AdminPage's useEffect exactly)
// ---------------------------------------------------------------------------
interface LocalStorageMock {
  setItem: ReturnType<typeof vi.fn>;
}

async function syncTeacherRooms(
  fetchFn: typeof fetch,
  partyKitUrl: string,
  teacherRooms: string[],
  setTeacherRooms: (rooms: string[]) => void,
  storage: LocalStorageMock,
): Promise<void> {
  if (teacherRooms.length === 0) return;

  try {
    const response = await fetchFn(`${partyKitUrl}/parties/main/lobby`);
    if (!response.ok) return;
    const data = await response.json();
    const serverRoomNames = new Set(
      (data.rooms || []).map((r: { name: string }) => r.name),
    );
    const valid = teacherRooms.filter((r) => serverRoomNames.has(r));
    if (valid.length !== teacherRooms.length) {
      setTeacherRooms(valid);
      storage.setItem("teacherRooms", JSON.stringify(valid));
    }
  } catch {
    // Server unreachable — keep local list as-is
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function mockFetchResponse(
  rooms: { name: string }[],
  status = 200,
): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve({ rooms }),
  }) as unknown as typeof fetch;
}

function mockFetchError(): typeof fetch {
  return vi
    .fn()
    .mockRejectedValue(new Error("Network error")) as unknown as typeof fetch;
}

const PARTYKIT_URL = "http://127.0.0.1:1999";

describe("Admin Room Sync", () => {
  let storage: LocalStorageMock;
  let setTeacherRooms: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storage = { setItem: vi.fn() };
    setTeacherRooms = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------------------
  // Filtering stale rooms
  // -----------------------------------------------------------------------
  describe("stale room filtering", () => {
    it("should remove rooms that no longer exist on the server", async () => {
      const serverRooms = [{ name: "room-A" }, { name: "room-C" }];
      const teacherRooms = ["room-A", "room-B", "room-C"];
      const fetchFn = mockFetchResponse(serverRooms);

      await syncTeacherRooms(
        fetchFn,
        PARTYKIT_URL,
        teacherRooms,
        setTeacherRooms,
        storage,
      );

      expect(setTeacherRooms).toHaveBeenCalledWith(["room-A", "room-C"]);
    });

    it("should persist filtered rooms to localStorage", async () => {
      const serverRooms = [{ name: "room-A" }];
      const teacherRooms = ["room-A", "room-B"];
      const fetchFn = mockFetchResponse(serverRooms);

      await syncTeacherRooms(
        fetchFn,
        PARTYKIT_URL,
        teacherRooms,
        setTeacherRooms,
        storage,
      );

      expect(storage.setItem).toHaveBeenCalledWith(
        "teacherRooms",
        JSON.stringify(["room-A"]),
      );
    });

    it("should remove all rooms when none exist on server", async () => {
      const serverRooms: { name: string }[] = [];
      const teacherRooms = ["room-A", "room-B"];
      const fetchFn = mockFetchResponse(serverRooms);

      await syncTeacherRooms(
        fetchFn,
        PARTYKIT_URL,
        teacherRooms,
        setTeacherRooms,
        storage,
      );

      expect(setTeacherRooms).toHaveBeenCalledWith([]);
      expect(storage.setItem).toHaveBeenCalledWith(
        "teacherRooms",
        JSON.stringify([]),
      );
    });

    it("should handle server returning rooms not in teacherRooms", async () => {
      const serverRooms = [
        { name: "room-A" },
        { name: "room-D" },
        { name: "room-E" },
      ];
      const teacherRooms = ["room-A", "room-B"];
      const fetchFn = mockFetchResponse(serverRooms);

      await syncTeacherRooms(
        fetchFn,
        PARTYKIT_URL,
        teacherRooms,
        setTeacherRooms,
        storage,
      );

      expect(setTeacherRooms).toHaveBeenCalledWith(["room-A"]);
    });
  });

  // -----------------------------------------------------------------------
  // No update needed
  // -----------------------------------------------------------------------
  describe("no update scenarios", () => {
    it("should not call setTeacherRooms when all rooms still exist", async () => {
      const serverRooms = [
        { name: "room-A" },
        { name: "room-B" },
        { name: "room-C" },
      ];
      const teacherRooms = ["room-A", "room-B"];
      const fetchFn = mockFetchResponse(serverRooms);

      await syncTeacherRooms(
        fetchFn,
        PARTYKIT_URL,
        teacherRooms,
        setTeacherRooms,
        storage,
      );

      expect(setTeacherRooms).not.toHaveBeenCalled();
      expect(storage.setItem).not.toHaveBeenCalled();
    });

    it("should not call setTeacherRooms when teacherRooms is empty", async () => {
      const fetchFn = mockFetchResponse([{ name: "room-A" }]);

      await syncTeacherRooms(
        fetchFn,
        PARTYKIT_URL,
        [],
        setTeacherRooms,
        storage,
      );

      // fetch should not even be called
      expect(fetchFn).not.toHaveBeenCalled();
      expect(setTeacherRooms).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // Error/edge cases
  // -----------------------------------------------------------------------
  describe("error handling", () => {
    it("should not modify rooms when server is unreachable", async () => {
      const teacherRooms = ["room-A", "room-B"];
      const fetchFn = mockFetchError();

      await syncTeacherRooms(
        fetchFn,
        PARTYKIT_URL,
        teacherRooms,
        setTeacherRooms,
        storage,
      );

      expect(setTeacherRooms).not.toHaveBeenCalled();
      expect(storage.setItem).not.toHaveBeenCalled();
    });

    it("should not modify rooms when server returns non-OK status", async () => {
      const teacherRooms = ["room-A"];
      const fetchFn = mockFetchResponse([], 500);

      await syncTeacherRooms(
        fetchFn,
        PARTYKIT_URL,
        teacherRooms,
        setTeacherRooms,
        storage,
      );

      expect(setTeacherRooms).not.toHaveBeenCalled();
    });

    it("should handle server returning null rooms array gracefully", async () => {
      const fetchFn = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ rooms: null }),
      }) as unknown as typeof fetch;
      const teacherRooms = ["room-A"];

      await syncTeacherRooms(
        fetchFn,
        PARTYKIT_URL,
        teacherRooms,
        setTeacherRooms,
        storage,
      );

      expect(setTeacherRooms).toHaveBeenCalledWith([]);
    });

    it("should handle server returning no rooms property gracefully", async () => {
      const fetchFn = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      }) as unknown as typeof fetch;
      const teacherRooms = ["room-A"];

      await syncTeacherRooms(
        fetchFn,
        PARTYKIT_URL,
        teacherRooms,
        setTeacherRooms,
        storage,
      );

      expect(setTeacherRooms).toHaveBeenCalledWith([]);
    });
  });

  // -----------------------------------------------------------------------
  // Fetch URL
  // -----------------------------------------------------------------------
  describe("fetch request", () => {
    it("should call the correct lobby endpoint", async () => {
      const fetchFn = mockFetchResponse([{ name: "room-A" }]);

      await syncTeacherRooms(
        fetchFn,
        PARTYKIT_URL,
        ["room-A"],
        setTeacherRooms,
        storage,
      );

      expect(fetchFn).toHaveBeenCalledWith(
        `${PARTYKIT_URL}/parties/main/lobby`,
      );
    });

    it("should call fetch exactly once", async () => {
      const fetchFn = mockFetchResponse([{ name: "room-A" }]);

      await syncTeacherRooms(
        fetchFn,
        PARTYKIT_URL,
        ["room-A"],
        setTeacherRooms,
        storage,
      );

      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });
});

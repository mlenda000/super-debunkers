/**
 * Tests for observer overlay utility functions.
 *
 * Every test exercises the REAL exported functions — no mocks, no stubs.
 * Player and NewsCard objects mirror the shapes that the server actually sends.
 */
import { describe, it, expect } from "vitest";
import {
  resolveSourcePlayers,
  resolveScoredPlayers,
  resolveDisplayCard,
  isTacticCorrect,
  getPlayerResultLabel,
  isPartialCorrect,
  sortPlayersByScore,
} from "@/components/organisms/observerOverlay/observerOverlayUtils";
import type { Player, NewsCard } from "@/types/gameTypes";

// ---------------------------------------------------------------------------
// Helpers — realistic player & card factories
// ---------------------------------------------------------------------------

/** Build a Player with sensible defaults. Override any field via `overrides`. */
function makePlayer(overrides: Partial<Player> & { id: string }): Player {
  return {
    name: `Player-${overrides.id}`,
    avatar: "avatar1.png",
    score: 0,
    isReady: false,
    tacticUsed: [],
    ...overrides,
  };
}

/** Build a minimal NewsCard. */
function makeCard(overrides: Partial<NewsCard> = {}): NewsCard {
  return {
    id: "card-1",
    caption: "Breaking: Fake health news spreading",
    bodyCopy: "A viral post claims...",
    collection: "health",
    harm: ["misinformation"],
    howToSpotIt: ["Check the source"],
    motive: "engagement",
    newsImage: "news1.png",
    newsLogoImage: "logo.png",
    qrCodeImage: "qr.png",
    tacticUsed: ["Emotional Language", "False Authority"],
    tacticUsedImage: "tactic.png",
    takeaway: "Always verify claims",
    video: "",
    villain: "BigPharma",
    ...overrides,
  };
}

// ===========================================================================
// resolveSourcePlayers
// ===========================================================================
describe("resolveSourcePlayers", () => {
  it("returns gameRoom players when they exist", () => {
    const roomPlayers = [makePlayer({ id: "a" }), makePlayer({ id: "b" })];
    const contextPlayers = [makePlayer({ id: "stale" })];
    expect(resolveSourcePlayers(roomPlayers, contextPlayers)).toBe(roomPlayers);
  });

  it("falls back to context players when gameRoom has empty array", () => {
    const contextPlayers = [makePlayer({ id: "c" })];
    expect(resolveSourcePlayers([], contextPlayers)).toBe(contextPlayers);
  });

  it("falls back to context players when gameRoom players are undefined", () => {
    const contextPlayers = [makePlayer({ id: "d" })];
    expect(resolveSourcePlayers(undefined, contextPlayers)).toBe(
      contextPlayers,
    );
  });

  it("returns empty array when both sources are empty", () => {
    const result = resolveSourcePlayers([], []);
    expect(result).toEqual([]);
  });

  it("returns gameRoom players even when context is empty", () => {
    const roomPlayers = [makePlayer({ id: "only-room" })];
    expect(resolveSourcePlayers(roomPlayers, [])).toBe(roomPlayers);
  });
});

// ===========================================================================
// resolveScoredPlayers
// ===========================================================================
describe("resolveScoredPlayers", () => {
  it("returns lastScoreUpdatePlayers when available", () => {
    const scored = [makePlayer({ id: "s1", wasCorrect: true, score: 10 })];
    const source = [makePlayer({ id: "s1", score: 0 })];
    expect(resolveScoredPlayers(scored, source)).toBe(scored);
  });

  it("falls back to source players when lastScoreUpdate is empty", () => {
    const source = [makePlayer({ id: "s2" })];
    expect(resolveScoredPlayers([], source)).toBe(source);
  });

  it("falls back to source players when lastScoreUpdate is undefined", () => {
    const source = [makePlayer({ id: "s3" })];
    expect(resolveScoredPlayers(undefined, source)).toBe(source);
  });

  it("returns scored players with full scoring data intact", () => {
    const scored = [
      makePlayer({
        id: "p1",
        wasCorrect: true,
        correctCount: 2,
        totalPlayed: 2,
        score: 20,
        streak: 3,
        hasStreak: true,
      }),
    ];
    const result = resolveScoredPlayers(scored, []);
    expect(result[0].wasCorrect).toBe(true);
    expect(result[0].correctCount).toBe(2);
    expect(result[0].streak).toBe(3);
  });
});

// ===========================================================================
// resolveDisplayCard
// ===========================================================================
describe("resolveDisplayCard", () => {
  const card1 = makeCard({ id: "prev" });
  const card2 = makeCard({ id: "active" });

  it("prefers previousNewsCard when both exist", () => {
    expect(resolveDisplayCard(card1, card2)).toBe(card1);
  });

  it("falls back to activeNewsCard when previous is null", () => {
    expect(resolveDisplayCard(null, card2)).toBe(card2);
  });

  it("falls back to activeNewsCard when previous is undefined", () => {
    expect(resolveDisplayCard(undefined, card2)).toBe(card2);
  });

  it("returns null when both are null", () => {
    expect(resolveDisplayCard(null, null)).toBeNull();
  });

  it("returns null when both are undefined", () => {
    expect(resolveDisplayCard(undefined, undefined)).toBeNull();
  });

  it("returns previousNewsCard even when active is null", () => {
    expect(resolveDisplayCard(card1, null)).toBe(card1);
  });
});

// ===========================================================================
// isTacticCorrect
// ===========================================================================
describe("isTacticCorrect", () => {
  const cardTactics = ["Emotional Language", "False Authority"];

  it("matches exact case", () => {
    expect(isTacticCorrect("Emotional Language", cardTactics)).toBe(true);
  });

  it("matches case-insensitively", () => {
    expect(isTacticCorrect("emotional language", cardTactics)).toBe(true);
    expect(isTacticCorrect("EMOTIONAL LANGUAGE", cardTactics)).toBe(true);
    expect(isTacticCorrect("false authority", cardTactics)).toBe(true);
  });

  it("returns false for non-matching tactic", () => {
    expect(isTacticCorrect("Cherry Picking", cardTactics)).toBe(false);
  });

  it("returns false when cardTactics is empty", () => {
    expect(isTacticCorrect("Anything", [])).toBe(false);
  });

  it("handles single-character differences", () => {
    expect(isTacticCorrect("Emotional Languag", cardTactics)).toBe(false);
  });

  it("handles whitespace-only differences correctly", () => {
    // Trailing space should NOT match
    expect(isTacticCorrect("Emotional Language ", cardTactics)).toBe(false);
  });
});

// ===========================================================================
// getPlayerResultLabel
// ===========================================================================
describe("getPlayerResultLabel", () => {
  it('returns "WIN STREAK!" when player has a streak', () => {
    const p = makePlayer({ id: "1", hasStreak: true, wasCorrect: true });
    expect(getPlayerResultLabel(p)).toBe("WIN STREAK!");
  });

  it('returns "GREAT EFFORT!" for partial correct', () => {
    const p = makePlayer({
      id: "2",
      wasCorrect: false,
      totalPlayed: 3,
      correctCount: 1,
    });
    expect(getPlayerResultLabel(p)).toBe("GREAT EFFORT!");
  });

  it('returns "DEBUNKED!" when fully correct', () => {
    const p = makePlayer({
      id: "3",
      wasCorrect: true,
      totalPlayed: 2,
      correctCount: 2,
    });
    expect(getPlayerResultLabel(p)).toBe("DEBUNKED!");
  });

  it('returns "OOPS!" when wasCorrect is false and not partial', () => {
    const p = makePlayer({
      id: "4",
      wasCorrect: false,
      totalPlayed: 2,
      correctCount: 0,
    });
    expect(getPlayerResultLabel(p)).toBe("OOPS!");
  });

  it("returns null when wasCorrect is undefined (round in progress)", () => {
    const p = makePlayer({ id: "5" });
    expect(getPlayerResultLabel(p)).toBeNull();
  });

  it("WIN STREAK takes priority over partial correct", () => {
    const p = makePlayer({
      id: "6",
      hasStreak: true,
      totalPlayed: 3,
      correctCount: 1,
      wasCorrect: false,
    });
    expect(getPlayerResultLabel(p)).toBe("WIN STREAK!");
  });

  it("WIN STREAK takes priority over DEBUNKED", () => {
    const p = makePlayer({
      id: "7",
      hasStreak: true,
      wasCorrect: true,
      totalPlayed: 1,
      correctCount: 1,
    });
    expect(getPlayerResultLabel(p)).toBe("WIN STREAK!");
  });

  it('returns "OOPS!" when wasCorrect is explicitly false with zero plays', () => {
    const p = makePlayer({
      id: "8",
      wasCorrect: false,
      totalPlayed: 0,
      correctCount: 0,
    });
    expect(getPlayerResultLabel(p)).toBe("OOPS!");
  });
});

// ===========================================================================
// isPartialCorrect
// ===========================================================================
describe("isPartialCorrect", () => {
  it("returns true when some but not all tactics are correct", () => {
    const p = makePlayer({ id: "1", totalPlayed: 3, correctCount: 2 });
    expect(isPartialCorrect(p)).toBe(true);
  });

  it("returns false when all tactics are correct", () => {
    const p = makePlayer({ id: "2", totalPlayed: 2, correctCount: 2 });
    expect(isPartialCorrect(p)).toBe(false);
  });

  it("returns false when no tactics are correct", () => {
    const p = makePlayer({ id: "3", totalPlayed: 2, correctCount: 0 });
    expect(isPartialCorrect(p)).toBe(false);
  });

  it("returns false when only one tactic played", () => {
    const p = makePlayer({ id: "4", totalPlayed: 1, correctCount: 1 });
    expect(isPartialCorrect(p)).toBe(false);
  });

  it("returns false when fields are undefined", () => {
    const p = makePlayer({ id: "5" });
    expect(isPartialCorrect(p)).toBe(false);
  });

  it("returns false when totalPlayed is 0", () => {
    const p = makePlayer({ id: "6", totalPlayed: 0, correctCount: 0 });
    expect(isPartialCorrect(p)).toBe(false);
  });

  it("handles edge case: 1 correct out of 2", () => {
    const p = makePlayer({ id: "7", totalPlayed: 2, correctCount: 1 });
    expect(isPartialCorrect(p)).toBe(true);
  });
});

// ===========================================================================
// sortPlayersByScore
// ===========================================================================
describe("sortPlayersByScore", () => {
  it("sorts descending by score", () => {
    const players = [
      makePlayer({ id: "low", score: 5 }),
      makePlayer({ id: "high", score: 30 }),
      makePlayer({ id: "mid", score: 15 }),
    ];
    const sorted = sortPlayersByScore(players);
    expect(sorted.map((p) => p.id)).toEqual(["high", "mid", "low"]);
  });

  it("does not mutate the original array", () => {
    const players = [
      makePlayer({ id: "a", score: 10 }),
      makePlayer({ id: "b", score: 20 }),
    ];
    const copy = [...players];
    sortPlayersByScore(players);
    expect(players).toEqual(copy);
  });

  it("treats undefined scores as 0", () => {
    const players = [
      makePlayer({ id: "undef", score: undefined }),
      makePlayer({ id: "ten", score: 10 }),
    ];
    const sorted = sortPlayersByScore(players);
    expect(sorted[0].id).toBe("ten");
    expect(sorted[1].id).toBe("undef");
  });

  it("returns empty array for empty input", () => {
    expect(sortPlayersByScore([])).toEqual([]);
  });

  it("handles single player", () => {
    const players = [makePlayer({ id: "solo", score: 42 })];
    const sorted = sortPlayersByScore(players);
    expect(sorted).toEqual(players);
  });

  it("maintains relative order for equal scores", () => {
    const players = [
      makePlayer({ id: "first", score: 10 }),
      makePlayer({ id: "second", score: 10 }),
      makePlayer({ id: "third", score: 10 }),
    ];
    const sorted = sortPlayersByScore(players);
    expect(sorted.map((p) => p.id)).toEqual(["first", "second", "third"]);
  });
});

// ===========================================================================
// Integration-style: full game round scenarios
// ===========================================================================
describe("Full game round scenarios", () => {
  const newsCard = makeCard({
    id: "round1",
    caption: "Miracle cure found!",
    tacticUsed: ["Emotional Language", "False Authority"],
  });

  const playersPreScore: Player[] = [
    makePlayer({
      id: "alice",
      name: "Alice",
      score: 10,
      tacticUsed: ["Emotional Language", "Cherry Picking"],
      isReady: true,
    }),
    makePlayer({
      id: "bob",
      name: "Bob",
      score: 5,
      tacticUsed: ["False Authority"],
      isReady: true,
    }),
    makePlayer({
      id: "charlie",
      name: "Charlie",
      score: 0,
      tacticUsed: [],
      isReady: false,
    }),
  ];

  const playersPostScore: Player[] = [
    makePlayer({
      id: "alice",
      name: "Alice",
      score: 15,
      tacticUsed: ["Emotional Language", "Cherry Picking"],
      wasCorrect: false,
      correctCount: 1,
      totalPlayed: 2,
      isReady: true,
    }),
    makePlayer({
      id: "bob",
      name: "Bob",
      score: 15,
      tacticUsed: ["False Authority"],
      wasCorrect: true,
      correctCount: 1,
      totalPlayed: 1,
      isReady: true,
    }),
    makePlayer({
      id: "charlie",
      name: "Charlie",
      score: 0,
      tacticUsed: [],
      wasCorrect: false,
      correctCount: 0,
      totalPlayed: 0,
      isReady: false,
    }),
  ];

  it("pre-score: resolves source + display, no results yet", () => {
    const source = resolveSourcePlayers(playersPreScore, []);
    const scored = resolveScoredPlayers(undefined, source);
    const card = resolveDisplayCard(null, newsCard);

    expect(source).toHaveLength(3);
    expect(scored).toBe(source); // no score update yet
    expect(card).toBe(newsCard);

    // Alice's "Emotional Language" is correct, "Cherry Picking" is wrong
    expect(isTacticCorrect("Emotional Language", card!.tacticUsed!)).toBe(true);
    expect(isTacticCorrect("Cherry Picking", card!.tacticUsed!)).toBe(false);

    // No result labels yet
    source.forEach((p) => {
      expect(getPlayerResultLabel(p)).toBeNull();
    });
  });

  it("post-score: lastScoreUpdate overrides, result labels correct", () => {
    const source = resolveSourcePlayers(playersPreScore, []);
    const scored = resolveScoredPlayers(playersPostScore, source);
    const card = resolveDisplayCard(newsCard, null);

    expect(scored).toBe(playersPostScore);
    expect(card).toBe(newsCard);

    // Alice: partial correct (1 of 2)
    const alice = scored.find((p) => p.id === "alice")!;
    expect(isPartialCorrect(alice)).toBe(true);
    expect(getPlayerResultLabel(alice)).toBe("GREAT EFFORT!");

    // Bob: fully correct
    const bob = scored.find((p) => p.id === "bob")!;
    expect(isPartialCorrect(bob)).toBe(false);
    expect(getPlayerResultLabel(bob)).toBe("DEBUNKED!");

    // Charlie: wasCorrect false, 0 played
    const charlie = scored.find((p) => p.id === "charlie")!;
    expect(isPartialCorrect(charlie)).toBe(false);
    expect(getPlayerResultLabel(charlie)).toBe("OOPS!");
  });

  it("score sorting puts highest first", () => {
    const sorted = sortPlayersByScore(playersPostScore);
    // Alice & Bob both at 15, Charlie at 0
    expect(sorted[0].score).toBe(15);
    expect(sorted[1].score).toBe(15);
    expect(sorted[2].score).toBe(0);
    expect(sorted[2].id).toBe("charlie");
  });

  it("fresh room with no data returns safe defaults", () => {
    const source = resolveSourcePlayers(undefined, []);
    const scored = resolveScoredPlayers(undefined, source);
    const card = resolveDisplayCard(null, null);

    expect(source).toEqual([]);
    expect(scored).toEqual([]);
    expect(card).toBeNull();
  });

  it("streak player shows WIN STREAK over other labels", () => {
    const streakPlayer = makePlayer({
      id: "streak-queen",
      name: "Dana",
      score: 30,
      wasCorrect: true,
      correctCount: 1,
      totalPlayed: 1,
      hasStreak: true,
      streak: 3,
    });
    expect(getPlayerResultLabel(streakPlayer)).toBe("WIN STREAK!");
  });

  it("tactic matching works for all card tactics", () => {
    const tactics = newsCard.tacticUsed!;
    tactics.forEach((tactic) => {
      expect(isTacticCorrect(tactic, tactics)).toBe(true);
      expect(isTacticCorrect(tactic.toUpperCase(), tactics)).toBe(true);
    });
    expect(isTacticCorrect("Nonexistent Tactic", tactics)).toBe(false);
  });
});

// ===========================================================================
// Edge cases & stale data scenarios
// ===========================================================================
describe("Stale data edge cases", () => {
  it("after resetGameState — all resolvers return clean defaults", () => {
    // Simulates what happens after resetGameState() clears everything
    const source = resolveSourcePlayers(undefined, []);
    const scored = resolveScoredPlayers(undefined, source);
    const card = resolveDisplayCard(null, null);

    expect(source).toEqual([]);
    expect(scored).toEqual([]);
    expect(card).toBeNull();
  });

  it("server roomUpdate populates fresh data correctly", () => {
    // After reset, server sends roomUpdate with fresh players
    const freshPlayers = [makePlayer({ id: "new-1", name: "Fresh Player" })];
    const source = resolveSourcePlayers(freshPlayers, []);
    expect(source).toBe(freshPlayers);
    expect(source[0].name).toBe("Fresh Player");
    // No stale scoring data
    expect(source[0].wasCorrect).toBeUndefined();
    expect(source[0].score).toBe(0);
  });

  it("previous scored data does not leak after fresh source", () => {
    const staleScoredPlayers = [
      makePlayer({ id: "old", score: 99, wasCorrect: true }),
    ];
    const freshSource = [makePlayer({ id: "new-1", score: 0 })];

    // lastScoreUpdatePlayers still has old data, source is fresh
    const scored = resolveScoredPlayers(staleScoredPlayers, freshSource);
    // This IS the bug scenario — scored returns stale data
    // The fix is to reset lastScoreUpdatePlayers, which the caller handles
    expect(scored).toBe(staleScoredPlayers);

    // After proper reset, scored falls back to fresh source
    const cleanScored = resolveScoredPlayers(undefined, freshSource);
    expect(cleanScored).toBe(freshSource);
    expect(cleanScored[0].wasCorrect).toBeUndefined();
  });

  it("previousNewsCard from old session does not appear after reset", () => {
    const staleCard = makeCard({ id: "old-round", caption: "Old fake news" });

    // Before reset: stale card would show
    expect(resolveDisplayCard(staleCard, null)?.id).toBe("old-round");

    // After reset: both null
    expect(resolveDisplayCard(null, null)).toBeNull();
  });
});

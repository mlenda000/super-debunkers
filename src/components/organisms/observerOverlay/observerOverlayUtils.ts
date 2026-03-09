import type { Player, NewsCard } from "@/types/gameTypes";

/**
 * Resolve the effective list of players to display.
 * Prefer gameRoom players (up-to-date from server), fall back to context players.
 */
export function resolveSourcePlayers(
  gameRoomPlayers: Player[] | undefined,
  contextPlayers: Player[],
): Player[] {
  if (gameRoomPlayers && gameRoomPlayers.length > 0) {
    return gameRoomPlayers;
  }
  return contextPlayers;
}

/**
 * Resolve the scored snapshot of players.
 * After a scoreUpdate the server provides `lastScoreUpdatePlayers` with
 * wasCorrect / correctCount / etc.  Use that when available.
 */
export function resolveScoredPlayers(
  lastScoreUpdatePlayers: Player[] | undefined,
  sourcePlayers: Player[],
): Player[] {
  if (lastScoreUpdatePlayers && lastScoreUpdatePlayers.length > 0) {
    return lastScoreUpdatePlayers;
  }
  return sourcePlayers;
}

/**
 * Pick the news card to display.
 * `previousNewsCard` is set just before a roomUpdate overwrites the active
 * card — so it represents the card the just-finished round was about.
 * Prefer it for the summary; fall back to the active card.
 */
export function resolveDisplayCard(
  previousNewsCard: NewsCard | null | undefined,
  activeNewsCard: NewsCard | null | undefined,
): NewsCard | null {
  return previousNewsCard ?? activeNewsCard ?? null;
}

/**
 * Check whether a player-placed tactic matches any of the card's actual
 * tactics (case-insensitive).
 */
export function isTacticCorrect(
  playerTactic: string,
  cardTactics: string[],
): boolean {
  const lower = playerTactic.toLowerCase();
  return cardTactics.some((ct) => ct.toLowerCase() === lower);
}

/**
 * Derive the result label for a specific player, mirroring the logic used
 * in ResponseModal.
 */
export function getPlayerResultLabel(player: Player): string | null {
  const isPartialCorrect =
    (player.totalPlayed ?? 0) > 1 &&
    (player.correctCount ?? 0) > 0 &&
    (player.correctCount ?? 0) < (player.totalPlayed ?? 0);

  if (player.hasStreak) return "WIN STREAK!";
  if (isPartialCorrect) return "GREAT EFFORT!";
  if (player.wasCorrect) return "DEBUNKED!";
  if (typeof player.wasCorrect !== "undefined") return "OOPS!";
  return null;
}

/**
 * Whether the player had a "partial correct" outcome — they placed multiple
 * tactics and at least one (but not all) was correct.
 */
export function isPartialCorrect(player: Player): boolean {
  return (
    (player.totalPlayed ?? 0) > 1 &&
    (player.correctCount ?? 0) > 0 &&
    (player.correctCount ?? 0) < (player.totalPlayed ?? 0)
  );
}

/**
 * Sort players by score descending (stable — preserves original order for ties).
 * Returns a new array; does NOT mutate the input.
 */
export function sortPlayersByScore(players: Player[]): Player[] {
  return [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

/**
 * Profanity Filter Edge Case Tests
 *
 * Tests isProfane() and cleanText() — pure functions wrapping bad-words.
 */

import { describe, it, expect } from "vitest";
import { isProfane, cleanText } from "@/services/profanityFilter";

describe("isProfane", () => {
  it("should detect common profanity", () => {
    expect(isProfane("shit")).toBe(true);
    expect(isProfane("fuck")).toBe(true);
  });

  it("should not flag clean text", () => {
    expect(isProfane("hello world")).toBe(false);
    expect(isProfane("super debunkers")).toBe(false);
  });

  it("should handle empty string", () => {
    expect(isProfane("")).toBe(false);
  });

  it("should detect custom-added words", () => {
    // These were explicitly added via filter.addWords(...)
    expect(isProfane("bollocks")).toBe(true);
    expect(isProfane("wanker")).toBe(true);
    expect(isProfane("twat")).toBe(true);
  });

  it("should detect profanity regardless of case", () => {
    expect(isProfane("SHIT")).toBe(true);
    expect(isProfane("Damn")).toBe(true);
  });

  it("should detect profanity embedded in a sentence", () => {
    expect(isProfane("this is bullshit mate")).toBe(true);
    expect(isProfane("what the fuck")).toBe(true);
  });

  it("should not flag partial matches in clean words", () => {
    // "ass" is profane, but "class" should not be flagged
    expect(isProfane("class")).toBe(false);
    expect(isProfane("assistant")).toBe(false);
  });

  it("should handle special characters in input", () => {
    expect(isProfane("!@#$%^&*()")).toBe(false);
    expect(isProfane("🎮🎯")).toBe(false);
  });

  it("should handle very long string", () => {
    const longClean = "hello ".repeat(1000);
    expect(isProfane(longClean)).toBe(false);
  });

  it("should handle whitespace-only input", () => {
    expect(isProfane("   ")).toBe(false);
    expect(isProfane("\n\t")).toBe(false);
  });
});

describe("cleanText", () => {
  it("should replace profanity with asterisks", () => {
    const cleaned = cleanText("shit");
    expect(cleaned).not.toBe("shit");
    expect(cleaned).toContain("*");
  });

  it("should leave clean text unchanged", () => {
    expect(cleanText("hello world")).toBe("hello world");
    expect(cleanText("super debunkers")).toBe("super debunkers");
  });

  it("should handle empty string", () => {
    expect(cleanText("")).toBe("");
  });

  it("should clean profanity in a sentence while preserving clean words", () => {
    const cleaned = cleanText("this is bullshit");
    expect(cleaned).toContain("this is");
    expect(cleaned).not.toContain("bullshit");
  });

  it("should handle multiple profane words", () => {
    const cleaned = cleanText("damn this shit");
    expect(cleaned).not.toContain("damn");
    expect(cleaned).not.toContain("shit");
  });

  it("should handle input with only whitespace", () => {
    expect(cleanText("   ")).toBe("   ");
  });

  it("should handle special characters without mangling them", () => {
    expect(cleanText("hello! @world #test")).toBe("hello! @world #test");
  });
});

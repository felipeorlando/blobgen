import { describe, expect, test } from "bun:test";
import { creditsForCalls, creditsForTokens } from "./costs";

describe("credit costs", () => {
  test("creditsForTokens uses input + output rates, rounded up", () => {
    expect(creditsForTokens(1000, 1000)).toBe(4); // 1*1 + 1*3
    expect(creditsForTokens(0, 0)).toBe(0);
    expect(creditsForTokens(500, 0)).toBe(1); // ceil(0.5)
    expect(creditsForTokens(2000, 1000)).toBe(5); // 2 + 3
  });

  test("creditsForCalls sums per-provider call costs", () => {
    expect(creditsForCalls({ search: 2, youtube: 1 })).toBe(5); // 2*2 + 1*1
    expect(creditsForCalls({})).toBe(0);
    expect(creditsForCalls({ search: 3 })).toBe(6);
  });
});

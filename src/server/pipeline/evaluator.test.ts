import { describe, expect, test } from "bun:test";
import type { LLMProvider } from "@/server/providers";
import { evaluateOutput } from "./evaluator";

function fakeLLM(text: string): LLMProvider {
  return {
    name: "fake",
    async complete() {
      return {
        text,
        usage: { inputTokens: 3, outputTokens: 2 },
        model: "fake",
        raw: {},
      };
    },
  };
}

describe("evaluateOutput", () => {
  test("parses a verdict and reports token usage", async () => {
    const recorded: unknown[] = [];
    const ev = await evaluateOutput({
      llm: fakeLLM('{"verdict":"pass","score":9,"notes":"great"}'),
      stageKey: "script",
      output: { title: "x" },
      recordUsage: async (u) => {
        recorded.push(u);
      },
    });
    expect(ev.verdict).toBe("pass");
    expect(ev.score).toBe(9);
    expect(ev.inputTokens).toBe(3);
    expect(recorded).toHaveLength(1);
  });

  test("falls back to a safe verdict on malformed output", async () => {
    const ev = await evaluateOutput({
      llm: fakeLLM("not json at all"),
      stageKey: "research",
      output: {},
      recordUsage: async () => {},
    });
    expect(["pass", "revise", "reject"]).toContain(ev.verdict);
  });
});

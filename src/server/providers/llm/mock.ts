import type { LLMCompleteArgs, LLMProvider, LLMResult } from "./types";

/**
 * Keyless dev fallback. Returns the caller-provided `sample` as JSON so stage
 * zod-parsing succeeds, letting the whole pipeline run without any API keys.
 */
export class MockLLMProvider implements LLMProvider {
  readonly name = "mock-llm";

  async complete(args: LLMCompleteArgs): Promise<LLMResult> {
    const text =
      args.responseFormat === "json"
        ? JSON.stringify(args.sample ?? { note: "mock output" })
        : typeof args.sample === "string"
          ? args.sample
          : "This is mock LLM output (no OPENROUTER_API_KEY set).";
    // Rough token estimate so credits still move in the demo.
    const inputTokens = Math.ceil(
      (args.system?.length ?? 0) / 4 +
        args.messages.reduce((n, m) => n + m.content.length, 0) / 4,
    );
    return {
      text,
      usage: { inputTokens, outputTokens: Math.ceil(text.length / 4) },
      model: "mock",
      raw: { mock: true },
    };
  }
}

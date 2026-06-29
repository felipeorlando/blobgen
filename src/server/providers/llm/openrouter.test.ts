import { describe, expect, test } from "bun:test";
import { OpenRouterProvider } from "./openrouter";

describe("OpenRouterProvider", () => {
  test("sends auth + model and parses usage", async () => {
    let captured: { url: unknown; init: RequestInit } | undefined;
    const fetchImpl = (async (url: unknown, init: RequestInit) => {
      captured = { url, init };
      return {
        ok: true,
        json: async () => ({
          model: "anthropic/claude-3.5-sonnet",
          choices: [{ message: { content: '{"ok":true}' } }],
          usage: { prompt_tokens: 12, completion_tokens: 7 },
        }),
      } as Response;
    }) as unknown as typeof fetch;

    const provider = new OpenRouterProvider({
      apiKey: "sk-test",
      defaultModel: "anthropic/claude-3.5-sonnet",
      fetchImpl,
    });

    const res = await provider.complete({
      system: "be terse",
      messages: [{ role: "user", content: "hi" }],
      responseFormat: "json",
    });

    expect(res.text).toBe('{"ok":true}');
    expect(res.usage).toEqual({ inputTokens: 12, outputTokens: 7 });

    const headers = captured!.init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer sk-test");
    const body = JSON.parse(captured!.init.body as string);
    expect(body.model).toBe("anthropic/claude-3.5-sonnet");
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages[0]).toEqual({ role: "system", content: "be terse" });
  });

  test("throws on non-ok response", async () => {
    const fetchImpl = (async () =>
      ({ ok: false, status: 429, text: async () => "rate limited" }) as Response) as unknown as typeof fetch;
    const provider = new OpenRouterProvider({
      apiKey: "k",
      defaultModel: "d",
      fetchImpl,
    });
    await expect(
      provider.complete({ messages: [{ role: "user", content: "x" }] }),
    ).rejects.toThrow("OpenRouter 429");
  });
});

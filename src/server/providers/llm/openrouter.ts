import type { LLMCompleteArgs, LLMProvider, LLMResult } from "./types";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/** OpenRouter LLM adapter. `fetchImpl` is injectable for tests. */
export class OpenRouterProvider implements LLMProvider {
  readonly name = "openrouter";

  constructor(
    private opts: {
      apiKey: string;
      defaultModel: string;
      fetchImpl?: typeof fetch;
    },
  ) {}

  async complete(args: LLMCompleteArgs): Promise<LLMResult> {
    const doFetch = this.opts.fetchImpl ?? fetch;
    const model = args.model ?? this.opts.defaultModel;
    const messages = [
      ...(args.system ? [{ role: "system", content: args.system }] : []),
      ...args.messages,
    ];

    const res = await doFetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.opts.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://blobgen.local",
        "X-Title": "blobgen",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: args.temperature ?? 0.7,
        max_tokens: args.maxTokens ?? 2048,
        ...(args.responseFormat === "json"
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 500)}`);
    }

    const json = (await res.json()) as {
      model?: string;
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    return {
      text: json.choices?.[0]?.message?.content ?? "",
      usage: {
        inputTokens: json.usage?.prompt_tokens ?? 0,
        outputTokens: json.usage?.completion_tokens ?? 0,
      },
      model: json.model ?? model,
      raw: json,
    };
  }
}

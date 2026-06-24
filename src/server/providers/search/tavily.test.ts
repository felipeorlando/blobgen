import { describe, expect, test } from "bun:test";
import { TavilyProvider } from "./tavily";

describe("TavilyProvider", () => {
  test("maps results to the common SearchResult shape", async () => {
    let body: Record<string, unknown> | undefined;
    const fetchImpl = (async (_url: unknown, init: RequestInit) => {
      body = JSON.parse(init.body as string);
      return {
        ok: true,
        json: async () => ({
          results: [
            {
              title: "Result A",
              url: "https://a.com",
              content: "snippet a",
              score: 0.9,
              published_date: "2025-01-01",
            },
          ],
        }),
      } as Response;
    }) as unknown as typeof fetch;

    const provider = new TavilyProvider({ apiKey: "tv-key", fetchImpl });
    const results = await provider.search("topic", { numResults: 3 });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      title: "Result A",
      url: "https://a.com",
      snippet: "snippet a",
      score: 0.9,
    });
    expect(body).toMatchObject({
      api_key: "tv-key",
      query: "topic",
      max_results: 3,
    });
  });
});

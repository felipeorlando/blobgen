import type { SearchProvider, SearchResult } from "./types";

/** Deterministic keyless fallback for web research. */
export class MockSearchProvider implements SearchProvider {
  readonly name = "mock-search";

  async search(
    query: string,
    opts?: { numResults?: number },
  ): Promise<SearchResult[]> {
    const n = opts?.numResults ?? 5;
    return Array.from({ length: Math.min(n, 4) }, (_, i) => ({
      title: `${query} — source ${i + 1}`,
      url: `https://example.com/${encodeURIComponent(query)}/${i + 1}`,
      snippet: `Mock research snippet ${i + 1} about "${query}". Set TAVILY_API_KEY for real results.`,
      score: 1 - i * 0.1,
      raw: { mock: true },
    }));
  }
}

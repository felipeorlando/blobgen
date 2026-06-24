import type { SearchProvider, SearchResult } from "./types";

const ENDPOINT = "https://api.tavily.com/search";

export class TavilyProvider implements SearchProvider {
  readonly name = "tavily";

  constructor(private opts: { apiKey: string; fetchImpl?: typeof fetch }) {}

  async search(
    query: string,
    opts?: { numResults?: number },
  ): Promise<SearchResult[]> {
    const doFetch = this.opts.fetchImpl ?? fetch;
    const res = await doFetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: this.opts.apiKey,
        query,
        max_results: opts?.numResults ?? 5,
        search_depth: "basic",
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Tavily ${res.status}: ${body.slice(0, 300)}`);
    }
    const json = (await res.json()) as {
      results?: {
        title?: string;
        url?: string;
        content?: string;
        score?: number;
        published_date?: string;
      }[];
    };
    return (json.results ?? []).map((r) => ({
      title: r.title ?? r.url ?? "Untitled",
      url: r.url ?? "",
      snippet: r.content ?? "",
      score: r.score,
      publishedAt: r.published_date,
      raw: r,
    }));
  }
}

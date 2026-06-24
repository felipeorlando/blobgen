import type { SearchProvider, SearchResult } from "./types";

const ENDPOINT = "https://api.exa.ai/search";

export class ExaProvider implements SearchProvider {
  readonly name = "exa";

  constructor(private opts: { apiKey: string; fetchImpl?: typeof fetch }) {}

  async search(
    query: string,
    opts?: { numResults?: number },
  ): Promise<SearchResult[]> {
    const doFetch = this.opts.fetchImpl ?? fetch;
    const res = await doFetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.opts.apiKey,
      },
      body: JSON.stringify({
        query,
        numResults: opts?.numResults ?? 5,
        contents: { text: { maxCharacters: 1000 } },
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Exa ${res.status}: ${body.slice(0, 300)}`);
    }
    const json = (await res.json()) as {
      results?: {
        title?: string;
        url?: string;
        text?: string;
        score?: number;
        publishedDate?: string;
      }[];
    };
    return (json.results ?? []).map((r) => ({
      title: r.title ?? r.url ?? "Untitled",
      url: r.url ?? "",
      snippet: (r.text ?? "").slice(0, 1000),
      score: r.score,
      publishedAt: r.publishedDate,
      raw: r,
    }));
  }
}

import type { StockItem, StockProvider } from "./types";

const ENDPOINT = "https://api.pexels.com/v1/search";

export class PexelsProvider implements StockProvider {
  readonly name = "pexels";

  constructor(private opts: { apiKey: string; fetchImpl?: typeof fetch }) {}

  async searchImages(query: string, n = 6): Promise<StockItem[]> {
    const doFetch = this.opts.fetchImpl ?? fetch;
    const url = new URL(ENDPOINT);
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", String(n));
    const res = await doFetch(url, {
      headers: { Authorization: this.opts.apiKey },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Pexels ${res.status}: ${body.slice(0, 300)}`);
    }
    const json = (await res.json()) as {
      photos?: {
        id?: number;
        width?: number;
        height?: number;
        src?: { large?: string; medium?: string; tiny?: string };
        alt?: string;
      }[];
    };
    return (json.photos ?? []).map((p) => ({
      id: String(p.id ?? crypto.randomUUID()),
      kind: "image" as const,
      url: p.src?.large ?? p.src?.medium ?? "",
      thumb: p.src?.tiny ?? p.src?.medium ?? "",
      width: p.width,
      height: p.height,
      provider: "pexels",
      meta: { alt: p.alt },
    }));
  }
}

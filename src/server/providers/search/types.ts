export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedAt?: string;
  score?: number;
  raw?: unknown;
}

export interface SearchProvider {
  readonly name: string;
  search(
    query: string,
    opts?: { numResults?: number },
  ): Promise<SearchResult[]>;
}

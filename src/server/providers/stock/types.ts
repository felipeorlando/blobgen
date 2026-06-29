export interface StockItem {
  id: string;
  kind: "image" | "video";
  url: string;
  thumb: string;
  width?: number;
  height?: number;
  provider: string;
  meta?: unknown;
}

export interface StockProvider {
  readonly name: string;
  searchImages(query: string, n?: number): Promise<StockItem[]>;
}

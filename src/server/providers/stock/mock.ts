import type { StockItem, StockProvider } from "./types";

// Local images that already ship in /public/images, so previews render keyless.
const LOCAL = [
  "/images/space.jpg",
  "/images/tech.jpg",
  "/images/desk.jpg",
  "/images/notebook.jpg",
  "/images/city.jpg",
  "/images/mountains.jpg",
  "/images/motivation.jpg",
  "/images/history.jpg",
];

export class MockStockProvider implements StockProvider {
  readonly name = "mock-stock";

  async searchImages(query: string, n = 6): Promise<StockItem[]> {
    return Array.from({ length: Math.min(n, LOCAL.length) }, (_, i) => ({
      id: `mock-${i}`,
      kind: "image" as const,
      url: LOCAL[i],
      thumb: LOCAL[i],
      width: 1200,
      height: 800,
      provider: "mock-stock",
      meta: { query, alt: `${query} ${i + 1}` },
    }));
  }
}

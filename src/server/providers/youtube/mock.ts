import type {
  YouTubeChannelInfo,
  YouTubeProvider,
  YouTubeVideo,
} from "./types";

export class MockYouTubeProvider implements YouTubeProvider {
  readonly name = "mock-youtube";

  async searchVideos(query: string, max = 8): Promise<YouTubeVideo[]> {
    return Array.from({ length: Math.min(max, 5) }, (_, i) => ({
      id: `mock-${i}`,
      title: `${query} — popular take #${i + 1}`,
      channelTitle: `Creator ${i + 1}`,
      publishedAt: undefined,
      description: `Mock YouTube result for "${query}".`,
    }));
  }

  async getChannel(idOrHandle: string): Promise<YouTubeChannelInfo | null> {
    return {
      id: idOrHandle,
      title: idOrHandle.replace(/^@/, ""),
      description: "Mock channel (set YOUTUBE_API_KEY for real data).",
      subscribers: 12_345,
    };
  }
}

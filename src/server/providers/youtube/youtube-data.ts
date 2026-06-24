import type {
  YouTubeChannelInfo,
  YouTubeProvider,
  YouTubeVideo,
} from "./types";

const BASE = "https://www.googleapis.com/youtube/v3";

/** YouTube Data API v3 (public data, API-key only). */
export class YouTubeDataProvider implements YouTubeProvider {
  readonly name = "youtube-data";

  constructor(private opts: { apiKey: string; fetchImpl?: typeof fetch }) {}

  private get doFetch() {
    return this.opts.fetchImpl ?? fetch;
  }

  async searchVideos(query: string, max = 8): Promise<YouTubeVideo[]> {
    const url = new URL(`${BASE}/search`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", String(max));
    url.searchParams.set("key", this.opts.apiKey);

    const res = await this.doFetch(url);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`YouTube ${res.status}: ${body.slice(0, 300)}`);
    }
    const json = (await res.json()) as {
      items?: {
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          channelTitle?: string;
          publishedAt?: string;
          description?: string;
        };
      }[];
    };
    return (json.items ?? [])
      .filter((i) => i.id?.videoId)
      .map((i) => ({
        id: i.id!.videoId!,
        title: i.snippet?.title ?? "",
        channelTitle: i.snippet?.channelTitle ?? "",
        publishedAt: i.snippet?.publishedAt,
        description: i.snippet?.description,
      }));
  }

  async getChannel(idOrHandle: string): Promise<YouTubeChannelInfo | null> {
    const url = new URL(`${BASE}/channels`);
    url.searchParams.set("part", "snippet,statistics");
    if (idOrHandle.startsWith("@")) {
      url.searchParams.set("forHandle", idOrHandle);
    } else {
      url.searchParams.set("id", idOrHandle);
    }
    url.searchParams.set("key", this.opts.apiKey);

    const res = await this.doFetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      items?: {
        id?: string;
        snippet?: { title?: string; description?: string };
        statistics?: { subscriberCount?: string };
      }[];
    };
    const item = json.items?.[0];
    if (!item) return null;
    return {
      id: item.id ?? idOrHandle,
      title: item.snippet?.title ?? "",
      description: item.snippet?.description ?? "",
      subscribers: item.statistics?.subscriberCount
        ? Number(item.statistics.subscriberCount)
        : undefined,
    };
  }
}

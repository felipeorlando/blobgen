export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt?: string;
  description?: string;
}

export interface YouTubeChannelInfo {
  id: string;
  title: string;
  description: string;
  subscribers?: number;
}

export interface YouTubeProvider {
  readonly name: string;
  searchVideos(query: string, max?: number): Promise<YouTubeVideo[]>;
  getChannel(idOrHandle: string): Promise<YouTubeChannelInfo | null>;
}

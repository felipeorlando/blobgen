import { env, ProviderNotConfigured } from "@/env";
import { allowMock, warnMockOnce } from "../_util";
import { MockYouTubeProvider } from "./mock";
import { YouTubeDataProvider } from "./youtube-data";
import type { YouTubeProvider } from "./types";

export type {
  YouTubeProvider,
  YouTubeVideo,
  YouTubeChannelInfo,
} from "./types";

let instance: YouTubeProvider | undefined;

/** The configured YouTube provider (Data API, or a keyless mock in dev). */
export function youtube(): YouTubeProvider {
  if (instance) return instance;
  if (env.YOUTUBE_API_KEY) {
    instance = new YouTubeDataProvider({ apiKey: env.YOUTUBE_API_KEY });
  } else if (allowMock()) {
    warnMockOnce("YouTube Data API", "YOUTUBE_API_KEY");
    instance = new MockYouTubeProvider();
  } else {
    throw new ProviderNotConfigured("YouTube Data API", "YOUTUBE_API_KEY");
  }
  return instance;
}

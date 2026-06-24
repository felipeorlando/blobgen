import { env, ProviderNotConfigured } from "@/env";
import { allowMock, warnMockOnce } from "../_util";
import { MockMediaProvider } from "./mock";
import { ReplicateMediaProvider } from "./replicate";
import type { MediaProvider } from "./types";

export type { MediaProvider, MediaGenInput, MediaGenResult } from "./types";

let instance: MediaProvider | undefined;

/** The configured media provider (Replicate, or a keyless mock in dev). */
export function media(): MediaProvider {
  if (instance) return instance;
  if (env.REPLICATE_API_TOKEN) {
    instance = new ReplicateMediaProvider({
      apiToken: env.REPLICATE_API_TOKEN,
      ttsModel: env.REPLICATE_TTS_MODEL,
      imageModel: env.REPLICATE_IMAGE_MODEL,
    });
  } else if (allowMock()) {
    warnMockOnce("Replicate media", "REPLICATE_API_TOKEN");
    instance = new MockMediaProvider();
  } else {
    throw new ProviderNotConfigured("Replicate", "REPLICATE_API_TOKEN");
  }
  return instance;
}

import type { MediaProvider } from "./types";

export type { MediaProvider, MediaGenInput, MediaGenResult } from "./types";

/**
 * Wave 2. The Replicate adapter implements `MediaProvider` against the
 * predictions API (REPLICATE_API_TOKEN). The Production stage is stubbed in
 * Wave 1, so this is a placeholder that throws if invoked early.
 */
export function media(): MediaProvider {
  return {
    name: "unimplemented-media",
    async generate() {
      throw new Error(
        "Media generation (Replicate) lands in Wave 2 — not implemented yet.",
      );
    },
  };
}

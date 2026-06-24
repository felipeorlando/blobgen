/**
 * Media generation (image/video/voice) — Wave 2. The interface is defined now
 * so the Production stage and Replicate adapter plug in without engine changes.
 */
export interface MediaGenInput {
  kind: "image" | "video" | "tts";
  prompt?: string;
  imageUrl?: string;
  voice?: string;
  model?: string;
}

export interface MediaGenResult {
  url: string;
  model: string;
  raw: unknown;
}

export interface MediaProvider {
  readonly name: string;
  generate(input: MediaGenInput): Promise<MediaGenResult>;
}

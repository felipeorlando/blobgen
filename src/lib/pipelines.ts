/**
 * The creative "pipelines" a project can be produced with. Each id maps 1:1 onto
 * an OpenMontage `pipeline_defs/<id>.yaml` manifest — OpenMontage is the creative
 * engine, this is just the catalog the composer + agent share.
 *
 * `zeroKey` pipelines render via OpenMontage's free path (Piper TTS, FFmpeg,
 * Remotion, Archive.org/Pexels) — no paid provider keys required, so they stay
 * selectable for the demo even before paid providers are configured.
 */
export interface PipelineDef {
  /** Matches the OpenMontage pipeline_defs/<id>.yaml basename. */
  id: string;
  label: string;
  hint: string;
  zeroKey: boolean;
}

export const PIPELINES: readonly PipelineDef[] = [
  {
    id: "documentary_montage",
    label: "Documentary Montage",
    hint: "Real footage + narration from free archives",
    zeroKey: true,
  },
  {
    id: "clip_factory",
    label: "Clip Factory",
    hint: "Batch-extract shareable clips from long-form",
    zeroKey: true,
  },
  {
    id: "talking_head",
    label: "Talking Head",
    hint: "Narrated explainer with simple b-roll",
    zeroKey: true,
  },
  {
    id: "podcast_repurpose",
    label: "Podcast Repurpose",
    hint: "Turn an episode into captioned shorts",
    zeroKey: true,
  },
  {
    id: "screen_demo",
    label: "Screen Demo",
    hint: "Product/screen walkthrough with voiceover",
    zeroKey: true,
  },
  {
    id: "cinematic",
    label: "Cinematic",
    hint: "AI-generated cinematic motion video",
    zeroKey: false,
  },
  {
    id: "animated_explainer",
    label: "Animated Explainer",
    hint: "Motion-graphics explainer",
    zeroKey: false,
  },
  {
    id: "animation",
    label: "Animation",
    hint: "Fully animated short",
    zeroKey: false,
  },
  {
    id: "avatar_spokesperson",
    label: "Avatar Spokesperson",
    hint: "AI presenter delivers the script",
    zeroKey: false,
  },
  {
    id: "character_animation",
    label: "Character Animation",
    hint: "Consistent character across scenes",
    zeroKey: false,
  },
  {
    id: "hybrid",
    label: "Hybrid",
    hint: "Mix stock, generated and motion footage",
    zeroKey: false,
  },
  {
    id: "localization_dub",
    label: "Localization & Dub",
    hint: "Translate + dub into another language",
    zeroKey: false,
  },
] as const;

export const DEFAULT_PIPELINE = "documentary_montage";

export function getPipeline(id: string): PipelineDef | undefined {
  return PIPELINES.find((p) => p.id === id);
}

export function isPipelineId(id: string): boolean {
  return PIPELINES.some((p) => p.id === id);
}

/** Normalize an arbitrary string to a valid pipeline id (falls back to default). */
export function coercePipeline(id: string | null | undefined): string {
  return id && isPipelineId(id) ? id : DEFAULT_PIPELINE;
}

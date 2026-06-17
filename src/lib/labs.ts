/**
 * Mock data + constants for the blobgen.ai **Labs** surface (frontend only).
 *
 * Labs is the atomic counterpart to the "New idea" pipeline: instead of turning
 * one idea into a long-form + Shorts + cuts, each Lab generates a single kind of
 * asset (an image, a video clip, a cloned voice, a song) — and the Media browser
 * lets you pull from existing image / video / sound libraries that the Editor
 * will eventually compose.
 *
 * Everything here is deterministic (static tables + pure helpers, no Date.now /
 * Math.random at module load) so SSR and the client render identical markup.
 */

import type { LucideIcon } from "lucide-react";
import {
  Clapperboard,
  Image as ImageIcon,
  Mic,
  Music,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Credits — shared across the studio (New idea + Labs draw from one wallet)  */
/* -------------------------------------------------------------------------- */

export const CREDIT_BALANCE = 248;

/* -------------------------------------------------------------------------- */
/*  Lab tools                                                                  */
/* -------------------------------------------------------------------------- */

export type LabOutput = "visual" | "audio";

/** A single segmented control shown in a Lab's prompt composer. */
export type LabControl = {
  id: string;
  label: string;
  options: string[];
};

export type LabToolId = "image" | "video" | "voice" | "music";

export type LabTool = {
  id: LabToolId;
  /** Route segment under /studio/labs */
  slug: string;
  title: string;
  /** One-liner used as the topbar subtitle + hub card description. */
  tagline: string;
  icon: LucideIcon;
  /** Icon-chip accent classes (bg + text), tuned for light & dark. */
  accent: string;
  output: LabOutput;
  /** Credits spent per generation — surfaced before the user commits. */
  cost: number;
  /** Textarea placeholder. */
  placeholder: string;
  /** Prompt chips shown under the composer. */
  suggestions: string[];
  /** Per-tool option groups (aspect, style, model, …). */
  controls: LabControl[];
  /** Generate-button label. */
  cta: string;
  /** Singular noun for a single result ("image", "clip", "take", "track"). */
  resultNoun: string;
  /** How many results a single run produces (for the mock results grid). */
  batch: number;
};

export const LAB_TOOLS: LabTool[] = [
  {
    id: "image",
    slug: "image",
    title: "Image studio",
    tagline: "Thumbnails, covers, and backdrops from a prompt",
    icon: ImageIcon,
    accent: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    output: "visual",
    cost: 4,
    placeholder:
      "Describe an image — subject, mood, lighting, lens. e.g. a lone hiker on a foggy ridge at dawn, cinematic",
    suggestions: [
      "Bold YouTube thumbnail, high contrast, shocked face",
      "Minimal podcast cover, dark, neon accent",
      "Wide cinematic landscape for a sleep story",
    ],
    controls: [
      { id: "ratio", label: "Aspect ratio", options: ["16:9", "1:1", "4:5", "9:16"] },
      { id: "style", label: "Style", options: ["Photoreal", "Cinematic", "Illustrated", "3D"] },
      { id: "count", label: "Variations", options: ["1", "2", "4"] },
    ],
    cta: "Generate images",
    resultNoun: "image",
    batch: 4,
  },
  {
    id: "video",
    slug: "video",
    title: "Video studio",
    tagline: "Short AI clips from text or a still frame",
    icon: Clapperboard,
    accent: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    output: "visual",
    cost: 12,
    placeholder:
      "Describe a shot — motion, camera move, subject. e.g. slow dolly across a rainy neon Tokyo street at night",
    suggestions: [
      "Slow pan over Saturn's rings, calm and vast",
      "B-roll: coffee being poured, macro, warm light",
      "Looping background of drifting clouds, timelapse",
    ],
    controls: [
      { id: "ratio", label: "Aspect ratio", options: ["9:16", "1:1", "16:9"] },
      { id: "duration", label: "Duration", options: ["4s", "6s", "8s"] },
      { id: "model", label: "Model", options: ["Draft", "Standard", "Cinematic"] },
    ],
    cta: "Generate clip",
    resultNoun: "clip",
    batch: 2,
  },
  {
    id: "voice",
    slug: "voice",
    title: "Voice lab",
    tagline: "Clone a voice and narrate in it",
    icon: Mic,
    accent: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    output: "audio",
    cost: 2,
    placeholder:
      "Paste a line to hear in the selected voice. e.g. Welcome back — today we're unpacking one strange idea.",
    suggestions: [
      "Read a 30s hook in the cloned voice",
      "Calm narrator intro for a documentary",
      "Punchy 10s teaser for a Short",
    ],
    controls: [
      { id: "voice", label: "Voice", options: ["Priya (cloned)", "Atlas", "Maple", "Documentary"] },
      { id: "emotion", label: "Delivery", options: ["Neutral", "Warm", "Energetic", "Soft"] },
      { id: "speed", label: "Pace", options: ["Slow", "Natural", "Fast"] },
    ],
    cta: "Generate voiceover",
    resultNoun: "take",
    batch: 2,
  },
  {
    id: "music",
    slug: "music",
    title: "Music & songs",
    tagline: "Original tracks, beds, and stings",
    icon: Music,
    accent: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    output: "audio",
    cost: 6,
    placeholder:
      "Describe a track — genre, mood, instruments, tempo. e.g. dreamy lo-fi beat, mellow keys, 80 bpm, for studying",
    suggestions: [
      "Tense cinematic build for a history mini-doc",
      "Upbeat synth intro sting, 5 seconds",
      "Ambient pad bed for a sleep story, no drums",
    ],
    controls: [
      { id: "mood", label: "Mood", options: ["Calm", "Epic", "Upbeat", "Tense"] },
      { id: "length", label: "Length", options: ["0:15", "0:30", "1:00", "2:00"] },
      { id: "vocals", label: "Vocals", options: ["Instrumental", "Hummed", "Lyrics"] },
    ],
    cta: "Generate track",
    resultNoun: "track",
    batch: 2,
  },
];

export function getLabTool(slug: string): LabTool | undefined {
  return LAB_TOOLS.find((t) => t.slug === slug);
}

/* -------------------------------------------------------------------------- */
/*  Media browser — existing image / video / sound libraries                  */
/* -------------------------------------------------------------------------- */

export type MediaKind = "image" | "video" | "sound";
export type MediaSource = "Generated" | "Stock" | "Uploaded";

export type MediaItem = {
  id: string;
  kind: MediaKind;
  title: string;
  /** Present for image/video tiles; sounds render a waveform instead. */
  thumb?: string;
  source: MediaSource;
  /** Short meta line: dimensions, duration, format. */
  meta: string;
};

export const MEDIA_KINDS: { id: MediaKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "sound", label: "Sounds" },
];

export const MEDIA_ITEMS: MediaItem[] = [
  { id: "m1", kind: "image", title: "Foggy ridge at dawn", thumb: "/images/mountains.jpg", source: "Generated", meta: "1920 × 1080" },
  { id: "m2", kind: "video", title: "Neon city drive", thumb: "/images/city.jpg", source: "Generated", meta: "0:06 · 9:16" },
  { id: "m3", kind: "sound", title: "Rain on a tin roof", source: "Stock", meta: "2:14 · loop" },
  { id: "m4", kind: "image", title: "Desk flat-lay, warm", thumb: "/images/desk.jpg", source: "Uploaded", meta: "2048 × 1365" },
  { id: "m5", kind: "video", title: "Saturn ring flyby", thumb: "/images/space.jpg", source: "Generated", meta: "0:08 · 16:9" },
  { id: "m6", kind: "sound", title: "Cinematic riser", source: "Stock", meta: "0:09 · sting" },
  { id: "m7", kind: "image", title: "Lion, golden hour", thumb: "/images/lion.jpg", source: "Stock", meta: "1600 × 900" },
  { id: "m8", kind: "sound", title: "Calm lo-fi bed", source: "Generated", meta: "1:00 · 80 bpm" },
  { id: "m9", kind: "video", title: "Pour-over macro", thumb: "/images/blueberries.jpg", source: "Stock", meta: "0:05 · 1:1" },
  { id: "m10", kind: "image", title: "Old map, parchment", thumb: "/images/history.jpg", source: "Generated", meta: "1920 × 1080" },
  { id: "m11", kind: "sound", title: "Ambient pad, no drums", source: "Generated", meta: "2:00 · loop" },
  { id: "m12", kind: "image", title: "Travel, open road", thumb: "/images/travel.jpg", source: "Uploaded", meta: "3000 × 2000" },
  { id: "m13", kind: "video", title: "Drifting clouds", thumb: "/images/hourglass.jpg", source: "Stock", meta: "0:08 · 16:9" },
  { id: "m14", kind: "image", title: "Notebook & pen", thumb: "/images/notebook.jpg", source: "Stock", meta: "1600 × 1067" },
  { id: "m15", kind: "sound", title: "Soft page turn", source: "Stock", meta: "0:02 · sfx" },
  { id: "m16", kind: "video", title: "Tech close-up", thumb: "/images/tech.jpg", source: "Generated", meta: "0:06 · 16:9" },
  { id: "m17", kind: "image", title: "Finance abstract", thumb: "/images/finance.jpg", source: "Generated", meta: "1920 × 1080" },
  { id: "m18", kind: "sound", title: "Tense heartbeat", source: "Stock", meta: "0:30 · loop" },
];

export function getMedia(kind: MediaKind | "all" = "all"): MediaItem[] {
  return kind === "all"
    ? MEDIA_ITEMS
    : MEDIA_ITEMS.filter((m) => m.kind === kind);
}

/* -------------------------------------------------------------------------- */
/*  Voices (Voice lab)                                                         */
/* -------------------------------------------------------------------------- */

export type Voice = {
  id: string;
  name: string;
  tag: string;
  /** Where the voice came from. */
  origin: "Cloned" | "Preset";
  sampleLabel: string;
};

export const VOICES: Voice[] = [
  { id: "priya", name: "Priya (you)", tag: "Warm · mid", origin: "Cloned", sampleLabel: "0:42 sample" },
  { id: "atlas", name: "Atlas", tag: "Deep · documentary", origin: "Preset", sampleLabel: "Preset" },
  { id: "maple", name: "Maple", tag: "Bright · friendly", origin: "Preset", sampleLabel: "Preset" },
  { id: "ember", name: "Ember", tag: "Soft · ASMR", origin: "Preset", sampleLabel: "Preset" },
];

/* -------------------------------------------------------------------------- */
/*  Deterministic faux waveform (for audio results & sound tiles)             */
/* -------------------------------------------------------------------------- */

/**
 * A stable bar-height array (0..1) derived purely from a string id, so audio
 * placeholders look distinct yet render identically on server and client.
 */
export function waveformBars(seed: string, n = 48): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    const v = ((h >>> 0) % 1000) / 1000; // 0..1
    // Shape it: taller in the middle, never fully silent.
    const env = 0.35 + 0.65 * Math.sin((Math.PI * (i + 1)) / (n + 1));
    out.push(Math.max(0.12, Math.min(1, v * env + 0.12)));
  }
  return out;
}

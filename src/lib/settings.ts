/**
 * Studio settings model (frontend only): automation/autopilot + generation
 * defaults. Pure types, option tables, and a deterministic default — no hooks
 * here, so this is safe to import from server or client. Persistence lives in
 * the settings view (localStorage, mirroring the channel context pattern).
 */

import type { LucideIcon } from "lucide-react";
import { CalendarDays, CalendarRange, CalendarClock, Repeat } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Autopilot                                                                  */
/* -------------------------------------------------------------------------- */

export type Cadence = "daily" | "weekdays" | "thrice" | "weekly";

export const CADENCES: {
  id: Cadence;
  label: string;
  hint: string;
  perWeek: number;
  icon: LucideIcon;
}[] = [
  { id: "daily", label: "Every day", hint: "7 videos / week", perWeek: 7, icon: Repeat },
  { id: "weekdays", label: "Weekdays", hint: "Mon–Fri, 5 / week", perWeek: 5, icon: CalendarRange },
  { id: "thrice", label: "3× per week", hint: "Mon · Wed · Fri", perWeek: 3, icon: CalendarDays },
  { id: "weekly", label: "Once a week", hint: "1 video / week", perWeek: 1, icon: CalendarClock },
];

/* -------------------------------------------------------------------------- */
/*  Generation defaults                                                        */
/* -------------------------------------------------------------------------- */

/** Default render size for the long-form output. */
export type VideoSizeId = "1080p16x9" | "4k16x9" | "1080p9x16" | "1080p1x1";

export const VIDEO_SIZES: {
  id: VideoSizeId;
  label: string;
  ratio: string;
  res: string;
}[] = [
  { id: "1080p16x9", label: "1080p", ratio: "16:9", res: "1920 × 1080" },
  { id: "4k16x9", label: "4K", ratio: "16:9", res: "3840 × 2160" },
  { id: "1080p9x16", label: "Vertical", ratio: "9:16", res: "1080 × 1920" },
  { id: "1080p1x1", label: "Square", ratio: "1:1", res: "1080 × 1080" },
];

export type QualityTier = "draft" | "standard" | "cinematic";

export const QUALITY_TIERS: { id: QualityTier; label: string; hint: string }[] = [
  { id: "draft", label: "Draft", hint: "Fastest · lowest cost" },
  { id: "standard", label: "Standard", hint: "Balanced" },
  { id: "cinematic", label: "Cinematic", hint: "Best quality · highest cost" },
];

/* -------------------------------------------------------------------------- */
/*  Combined settings shape + default                                          */
/* -------------------------------------------------------------------------- */

export type StudioSettings = {
  autopilot: {
    enabled: boolean;
    cadence: Cadence;
    /** Auto-cut Shorts from each long-form. */
    autoShorts: boolean;
    /** Max Shorts to spin off per long-form (1–10). */
    maxShorts: number;
    /** Only publish in the analytics-suggested best window. */
    bestTimeOnly: boolean;
  };
  generation: {
    /** Credit ceiling per video; autopilot won't exceed it. */
    costCap: number;
    size: VideoSizeId;
    quality: QualityTier;
  };
};

export const DEFAULT_SETTINGS: StudioSettings = {
  autopilot: {
    enabled: true,
    cadence: "thrice",
    autoShorts: true,
    maxShorts: 3,
    bestTimeOnly: true,
  },
  generation: {
    costCap: 60,
    size: "1080p16x9",
    quality: "standard",
  },
};

export const COST_CAP = { min: 10, max: 200, step: 5 } as const;
export const MAX_SHORTS = { min: 1, max: 10 } as const;
export const SETTINGS_STORAGE_KEY = "blobgen-studio-settings";

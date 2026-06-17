/**
 * Mock data + helpers for the blobgen.ai studio demo (frontend only).
 *
 * Everything here is deterministic: a tiny seeded PRNG drives the numbers so the
 * server and client render identical markup (no hydration drift, no Date.now /
 * Math.random at module load). Switching the active channel re-derives every
 * metric, so the whole analytics surface visibly changes per channel.
 */

import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Captions,
  FileText,
  Image as ImageIcon,
  Scissors,
  Clapperboard,
  Smartphone,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Deterministic PRNG                                                         */
/* -------------------------------------------------------------------------- */

/** mulberry32 — pure, seeded, no global state. Same seed → same sequence. */
function seeded(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string into a stable 32-bit seed. */
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const round = (n: number, dp = 1) => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

/* -------------------------------------------------------------------------- */
/*  Formatting                                                                */
/* -------------------------------------------------------------------------- */

export function compact(n: number): string {
  if (n >= 1_000_000) return `${round(n / 1_000_000, 1)}M`;
  if (n >= 1_000) return `${round(n / 1_000, 1)}K`;
  return `${n}`;
}

export function signed(n: number, suffix = "%"): string {
  const v = round(n, 1);
  return `${v > 0 ? "+" : ""}${v}${suffix}`;
}

/* -------------------------------------------------------------------------- */
/*  Output formats (New Idea page)                                            */
/* -------------------------------------------------------------------------- */

export type OutputFormat = {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  ratio: string;
};

export const OUTPUT_FORMATS: OutputFormat[] = [
  { id: "long", label: "Long-form video", hint: "Widescreen 16:9", icon: Clapperboard, ratio: "16:9" },
  { id: "short", label: "Short", hint: "Vertical 9:16", icon: Smartphone, ratio: "9:16" },
  { id: "cuts", label: "Cuts", hint: "Clips from the long-form", icon: Scissors, ratio: "Clip" },
  { id: "thumbnail", label: "Thumbnail", hint: "Cover art", icon: ImageIcon, ratio: "4:3" },
  { id: "script", label: "Script", hint: "Hook to outro", icon: FileText, ratio: "Doc" },
  { id: "voiceover", label: "Voiceover", hint: "AI narration", icon: AudioLines, ratio: "Audio" },
  { id: "captions", label: "Captions", hint: "Burned-in SRT", icon: Captions, ratio: "SRT" },
];

export const ASPECT_RATIOS = ["9:16", "1:1", "4:5", "16:9"] as const;
export const DURATIONS = ["15s", "30s", "60s", "3 min"] as const;

export type VoiceStyle = { id: string; label: string };
export const VOICE_STYLES: VoiceStyle[] = [
  { id: "calm", label: "Calm narrator" },
  { id: "punchy", label: "Punchy hook" },
  { id: "documentary", label: "Documentary" },
  { id: "asmr", label: "Soft ASMR" },
];

/* -------------------------------------------------------------------------- */
/*  Channels                                                                  */
/* -------------------------------------------------------------------------- */

export type Channel = {
  id: string;
  name: string;
  handle: string;
  niche: string;
  image: string;
  thumbs: string[];
  videoTitles: string[];
  subscribers: number;
  grade: string;
  joinedLabel: string;
};

const CHANNELS_RAW: Omit<Channel, "subscribers" | "grade">[] = [
  {
    id: "stoic",
    name: "Stoic Mornings",
    handle: "@stoicmornings",
    niche: "Philosophy & discipline",
    image: "/images/motivation.jpg",
    joinedLabel: "Operating since 2024",
    thumbs: [
      "/images/motivation.jpg",
      "/images/lion.jpg",
      "/images/mountains.jpg",
      "/images/desk.jpg",
      "/images/notebook.jpg",
      "/images/hourglass.jpg",
    ],
    videoTitles: [
      "The 5am rule that rewired my focus",
      "Marcus Aurelius on dealing with rude people",
      "Why discipline beats motivation every time",
      "How to stay calm when everything breaks",
      "The Stoic morning routine, in 60 seconds",
      "Read this before you quit",
      "Negative visualization, actually explained",
      "One question that kills procrastination",
    ],
  },
  {
    id: "ledger",
    name: "Ledger & Latte",
    handle: "@ledgerlatte",
    niche: "Money, explained slowly",
    image: "/images/finance.jpg",
    joinedLabel: "Operating since 2023",
    thumbs: [
      "/images/finance.jpg",
      "/images/desk.jpg",
      "/images/city.jpg",
      "/images/tech.jpg",
      "/images/notebook.jpg",
      "/images/blueberries.jpg",
    ],
    videoTitles: [
      "Why your savings lose money while you sleep",
      "The 50/30/20 budget nobody actually follows",
      "Compound interest is quietly insane",
      "I tracked every coffee for a year",
      "Index funds vs the lottery brain",
      "The real cost of buy now, pay later",
      "How banks make money off your float",
      "Three numbers that run your whole budget",
    ],
  },
  {
    id: "cosmic",
    name: "Cosmic Lull",
    handle: "@cosmiclull",
    niche: "Sleep stories from space",
    image: "/images/space.jpg",
    joinedLabel: "Operating since 2025",
    thumbs: [
      "/images/space.jpg",
      "/images/mountains.jpg",
      "/images/travel.jpg",
      "/images/city.jpg",
      "/images/hourglass.jpg",
    ],
    videoTitles: [
      "A slow tour of Saturn's rings",
      "What falling into a black hole sounds like",
      "Drifting past the Voyager probe",
      "The quietest place in the solar system",
      "Sleep story: the edge of the Milky Way",
      "Why the night sky is running out of dark",
      "Ten minutes alone on Europa",
    ],
  },
  {
    id: "echo",
    name: "Echoes of History",
    handle: "@echoeshistory",
    niche: "History in 60 seconds",
    image: "/images/history.jpg",
    joinedLabel: "Operating since 2022",
    thumbs: [
      "/images/history.jpg",
      "/images/hourglass.jpg",
      "/images/city.jpg",
      "/images/travel.jpg",
      "/images/lion.jpg",
    ],
    videoTitles: [
      "The library that burned for a decade",
      "How a single typo started a war",
      "The last day of Pompeii, hour by hour",
      "Rome had a traffic problem in 50 BC",
      "The map that was wrong for 300 years",
      "What Vikings actually ate for breakfast",
      "The night two cities swapped names",
    ],
  },
];

const GRADES = ["A", "A-", "B+", "B"];

export const CHANNELS: Channel[] = CHANNELS_RAW.map((c) => {
  const rnd = seeded(hashSeed(c.id));
  const subscribers = Math.round((6 + rnd() * 150) * 1000);
  const grade = GRADES[Math.floor(rnd() * GRADES.length)];
  return { ...c, subscribers, grade };
});

export function getChannel(id: string): Channel {
  return CHANNELS.find((c) => c.id === id) ?? CHANNELS[0];
}

/* -------------------------------------------------------------------------- */
/*  Retention curve generator                                                 */
/* -------------------------------------------------------------------------- */

/** A believable audience-retention curve: hooks high, drops fast, wobbles, drifts. */
export function retentionCurve(seedStr: string, points = 30): number[] {
  const rnd = seeded(hashSeed(seedStr));
  const hookDrop = 0.2 + rnd() * 0.12;
  const base = 0.44 + rnd() * 0.14;
  const wob = 0.05 + rnd() * 0.05;
  const phase = rnd() * Math.PI * 2;
  const endBias = (rnd() - 0.4) * 0.18;
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const hook = 1 - hookDrop * Math.min(1, t * 3.4);
    const settle = base + (hook - base) * Math.exp(-2.6 * t);
    const wave = Math.sin(t * Math.PI * 3 + phase) * wob * (0.5 + t);
    let v = settle + wave + endBias * t;
    v = Math.max(0.14, Math.min(0.99, v));
    out.push(round(v * 100, 1));
  }
  out[0] = round(97 + rnd() * 2.5, 1);
  return out;
}

const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

/* -------------------------------------------------------------------------- */
/*  Videos                                                                     */
/* -------------------------------------------------------------------------- */

export type VideoFormat = "Short" | "Long-form";

export type Video = {
  id: string;
  channelId: string;
  title: string;
  thumb: string;
  format: VideoFormat;
  durationLabel: string;
  publishedLabel: string;
  views: number;
  ctr: number;
  retention: number;
  curve: number[];
  flagged: boolean;
};

const DATE_LABELS = [
  "Jun 14, 2026",
  "Jun 9, 2026",
  "Jun 3, 2026",
  "May 27, 2026",
  "May 21, 2026",
  "May 14, 2026",
  "May 6, 2026",
  "Apr 29, 2026",
];

function buildVideos(channel: Channel): Video[] {
  return channel.videoTitles.map((title, i) => {
    const id = `${channel.id}-v${i}`;
    const rnd = seeded(hashSeed(id));
    const curve = retentionCurve(id);
    const isShort = rnd() > 0.42;
    const views = Math.round((8 + rnd() * 480) * 1000);
    const ctr = round(4.4 + rnd() * 5.2, 1);
    const retention = round(avg(curve), 1);
    return {
      id,
      channelId: channel.id,
      title,
      thumb: channel.thumbs[i % channel.thumbs.length],
      format: isShort ? "Short" : "Long-form",
      durationLabel: isShort
        ? `0:${String(20 + Math.floor(rnd() * 40)).padStart(2, "0")}`
        : `${4 + Math.floor(rnd() * 8)}:${String(Math.floor(rnd() * 60)).padStart(2, "0")}`,
      publishedLabel: DATE_LABELS[i % DATE_LABELS.length],
      views,
      ctr,
      retention,
      curve,
      flagged: retention < 45,
    };
  });
}

const VIDEOS_BY_CHANNEL: Record<string, Video[]> = Object.fromEntries(
  CHANNELS.map((c) => [c.id, buildVideos(c)]),
);

export function getVideos(channelId: string): Video[] {
  return VIDEOS_BY_CHANNEL[channelId] ?? [];
}

/* -------------------------------------------------------------------------- */
/*  Channel-level analytics                                                   */
/* -------------------------------------------------------------------------- */

export type Kpi = {
  key: string;
  label: string;
  value: string;
  raw: number;
  delta: number;
  spark: number[];
};

export type ChannelAnalytics = {
  retention: number;
  ctr: number;
  views: number;
  watchHours: number;
  subsGained: number;
  grade: string;
  curve: number[];
  formatSplit: { shorts: number; long: number };
  heatmap: number[][];
  insight: {
    headline: string;
    body: string;
    bestElement: string;
    action: string;
    sentiment: "Excellent" | "Strong" | "Watch";
  };
};

function sparkline(seedStr: string, n = 12): number[] {
  const rnd = seeded(hashSeed(seedStr));
  let v = 0.5;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    v = Math.max(0.1, Math.min(0.95, v + (rnd() - 0.45) * 0.28));
    out.push(round(v * 100, 1));
  }
  return out;
}

/** 7 days x 10 weeks upload-cadence intensity grid (0..4), deterministic. */
function heatmap(seedStr: string): number[][] {
  const rnd = seeded(hashSeed(seedStr));
  return Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 10 }, () => {
      const weekend = day >= 5 ? 0.35 : 1;
      const r = rnd() * weekend;
      if (r < 0.32) return 0;
      if (r < 0.55) return 1;
      if (r < 0.74) return 2;
      if (r < 0.9) return 3;
      return 4;
    }),
  );
}

const INSIGHTS: Record<
  string,
  Pick<ChannelAnalytics["insight"], "headline" | "body" | "bestElement" | "action">
> = {
  stoic: {
    headline: "Hooks are landing, middles are leaking",
    body: "Viewers stay through the first 8 seconds at an unusually high rate, but a dip around the 35% mark suggests the second beat runs long. Tightening the mid-section could lift average retention by an estimated 6 points.",
    bestElement: "Opening hook",
    action: "Trim the middle beat",
  },
  ledger: {
    headline: "Thumbnails are doing the heavy lifting",
    body: "Click-through sits well above your category benchmark, so packaging is working. Retention is steady rather than spiking, which points to pacing. Try a sharper payoff in the final 10 seconds to convert watch time into subscribers.",
    bestElement: "Thumbnail and title",
    action: "Add a stronger payoff",
  },
  cosmic: {
    headline: "Long sessions, soft click-through",
    body: "Average view duration is excellent for the sleep niche, with very flat retention after the intro. The opportunity is discovery: click-through trails the others, so the next test should be brighter cover art and a clearer promise in the title.",
    bestElement: "Average view duration",
    action: "Test brighter cover art",
  },
  echo: {
    headline: "Consistent, but plateauing",
    body: "Your cadence is steady and retention is reliable across uploads. Growth has flattened, which usually means the format is mature. A short series with cliffhanger endings could reignite session starts and returning viewers.",
    bestElement: "Upload consistency",
    action: "Try a serialized arc",
  },
};

export function getAnalytics(channelId: string): ChannelAnalytics {
  const channel = getChannel(channelId);
  const videos = getVideos(channelId);
  const retention = round(avg(videos.map((v) => v.retention)), 1);
  const ctr = round(avg(videos.map((v) => v.ctr)), 1);
  const views = videos.reduce((a, v) => a + v.views, 0);
  const rnd = seeded(hashSeed(`${channelId}-agg`));
  const watchHours = Math.round((views / 1000) * (1.1 + rnd() * 1.6));
  const subsGained = Math.round(channel.subscribers * (0.01 + rnd() * 0.05));
  const shorts = Math.round(40 + rnd() * 45);
  const sentiment: ChannelAnalytics["insight"]["sentiment"] =
    retention >= 60 ? "Excellent" : retention >= 50 ? "Strong" : "Watch";

  return {
    retention,
    ctr,
    views,
    watchHours,
    subsGained,
    grade: channel.grade,
    curve: retentionCurve(`${channelId}-channel`),
    formatSplit: { shorts, long: 100 - shorts },
    heatmap: heatmap(`${channelId}-heat`),
    insight: { ...INSIGHTS[channelId], sentiment },
  };
}

/** KPI cards for a channel, or for a specific selected video when provided. */
export function getKpis(channelId: string, video?: Video | null): Kpi[] {
  const a = getAnalytics(channelId);
  const rnd = seeded(hashSeed(video ? video.id : `${channelId}-kpi`));
  const d = () => round((rnd() - 0.42) * 26, 1);

  const retention = video ? video.retention : a.retention;
  const ctr = video ? video.ctr : a.ctr;
  const views = video ? video.views : a.views;
  const watch = video ? Math.round(video.views / 1000 * 1.4) : a.watchHours;

  return [
    {
      key: "retention",
      label: "Avg. retention",
      value: `${retention}%`,
      raw: retention,
      delta: d(),
      spark: sparkline(`${video?.id ?? channelId}-r`),
    },
    {
      key: "ctr",
      label: "Click-through",
      value: `${ctr}%`,
      raw: ctr,
      delta: d(),
      spark: sparkline(`${video?.id ?? channelId}-c`),
    },
    {
      key: "views",
      label: "Views",
      value: compact(views),
      raw: views,
      delta: d(),
      spark: sparkline(`${video?.id ?? channelId}-v`),
    },
    {
      key: "watch",
      label: "Watch time",
      value: `${compact(watch)}h`,
      raw: watch,
      delta: d(),
      spark: sparkline(`${video?.id ?? channelId}-w`),
    },
  ];
}

/* -------------------------------------------------------------------------- */
/*  Projects (New Idea page)                                                  */
/* -------------------------------------------------------------------------- */

export type ProjectStatus = "Published" | "Scheduled" | "Rendering" | "Draft";

export type Project = {
  id: string;
  channelId: string;
  title: string;
  thumb: string;
  format: VideoFormat;
  status: ProjectStatus;
  editedLabel: string;
};

const PROJECT_EDITS = [
  "Edited 2 hours ago",
  "Edited yesterday",
  "Edited Jun 13",
  "Edited Jun 10",
  "Edited Jun 6",
  "Edited Jun 1",
];

const STATUS_CYCLE: ProjectStatus[] = [
  "Rendering",
  "Scheduled",
  "Published",
  "Draft",
  "Published",
  "Published",
];

function buildProjects(channel: Channel): Project[] {
  return channel.videoTitles.slice(0, 6).map((title, i) => {
    const rnd = seeded(hashSeed(`${channel.id}-p${i}`));
    return {
      id: `${channel.id}-p${i}`,
      channelId: channel.id,
      title,
      thumb: channel.thumbs[(i + 1) % channel.thumbs.length],
      format: rnd() > 0.5 ? "Short" : "Long-form",
      status: STATUS_CYCLE[i % STATUS_CYCLE.length],
      editedLabel: PROJECT_EDITS[i % PROJECT_EDITS.length],
    };
  });
}

const PROJECTS_BY_CHANNEL: Record<string, Project[]> = Object.fromEntries(
  CHANNELS.map((c) => [c.id, buildProjects(c)]),
);

export function getProjects(channelId: string): Project[] {
  return PROJECTS_BY_CHANNEL[channelId] ?? [];
}

/** Look up a single project by id across every channel (for the editor route). */
export function getProjectById(id: string): Project | undefined {
  for (const list of Object.values(PROJECTS_BY_CHANNEL)) {
    const found = list.find((p) => p.id === id);
    if (found) return found;
  }
  return undefined;
}

/* -------------------------------------------------------------------------- */
/*  Prompt suggestions (New Idea page)                                        */
/* -------------------------------------------------------------------------- */

export const SUGGESTIONS: Record<string, string[]> = {
  stoic: [
    "A 12-minute essay on morning discipline, plus 5 cuts",
    "One idea as both a long-form and a Short",
    "Turn a Marcus Aurelius quote into a 45s Short",
  ],
  ledger: [
    "A 10-minute deep dive on compound interest",
    "Cut a finance long-form into 6 vertical Shorts",
    "Long-form plus Shorts from one script",
  ],
  cosmic: [
    "A 20-minute sleep journey to Jupiter, with cuts",
    "One nebula tour as long-form and Shorts",
    "A calm 60s Short about the size of the universe",
  ],
  echo: [
    "A long-form mini-doc on the fall of Pompeii",
    "Turn this story into a video plus 4 cuts",
    "A 60s Short on a strange historical law",
  ],
};

/* -------------------------------------------------------------------------- */
/*  Library (full asset archive)                                              */
/* -------------------------------------------------------------------------- */

export type AssetKind =
  | "Long-form"
  | "Short"
  | "Cuts"
  | "Thumbnail"
  | "Script"
  | "Voiceover";

export type LibraryItem = {
  id: string;
  channelId: string;
  title: string;
  thumb: string;
  kind: AssetKind;
  visual: boolean;
  status: ProjectStatus;
  editedLabel: string;
  meta: string;
};

const LIB_KINDS: AssetKind[] = [
  "Long-form",
  "Short",
  "Cuts",
  "Short",
  "Thumbnail",
  "Long-form",
  "Script",
  "Short",
  "Cuts",
  "Voiceover",
  "Short",
  "Long-form",
  "Thumbnail",
  "Short",
  "Cuts",
  "Script",
];

const LIB_STATUS: ProjectStatus[] = [
  "Published",
  "Published",
  "Scheduled",
  "Draft",
  "Published",
  "Rendering",
  "Published",
  "Published",
  "Draft",
  "Published",
  "Scheduled",
  "Published",
  "Published",
  "Draft",
  "Published",
  "Published",
];

const LIB_EDITS = [
  "2 hours ago",
  "yesterday",
  "Jun 13",
  "Jun 11",
  "Jun 9",
  "Jun 6",
  "Jun 3",
  "May 30",
  "May 27",
  "May 23",
  "May 19",
  "May 14",
  "May 9",
  "May 4",
  "Apr 28",
  "Apr 22",
];

function kindMeta(
  kind: AssetKind,
  rnd: () => number,
): { meta: string; visual: boolean } {
  const ss = () => String(Math.floor(rnd() * 60)).padStart(2, "0");
  switch (kind) {
    case "Long-form":
      return { meta: `${6 + Math.floor(rnd() * 12)}:${ss()} min`, visual: true };
    case "Short":
      return { meta: `0:${String(20 + Math.floor(rnd() * 39)).padStart(2, "0")}`, visual: true };
    case "Cuts":
      return { meta: `${3 + Math.floor(rnd() * 6)} clips`, visual: true };
    case "Thumbnail":
      return { meta: "1280 x 720", visual: true };
    case "Script":
      return { meta: `${round(0.6 + rnd() * 2.4, 1)}k words`, visual: false };
    case "Voiceover":
      return { meta: `${1 + Math.floor(rnd() * 9)}:${ss()} min`, visual: false };
  }
}

function buildLibrary(channel: Channel): LibraryItem[] {
  return LIB_KINDS.map((kind, i) => {
    const id = `${channel.id}-lib${i}`;
    const rnd = seeded(hashSeed(id));
    const { meta, visual } = kindMeta(kind, rnd);
    return {
      id,
      channelId: channel.id,
      title: channel.videoTitles[i % channel.videoTitles.length],
      thumb: channel.thumbs[i % channel.thumbs.length],
      kind,
      visual,
      status: LIB_STATUS[i % LIB_STATUS.length],
      editedLabel: `Edited ${LIB_EDITS[i % LIB_EDITS.length]}`,
      meta,
    };
  });
}

const LIBRARY_BY_CHANNEL: Record<string, LibraryItem[]> = Object.fromEntries(
  CHANNELS.map((c) => [c.id, buildLibrary(c)]),
);

export function getLibrary(channelId: string): LibraryItem[] {
  return LIBRARY_BY_CHANNEL[channelId] ?? [];
}

/* -------------------------------------------------------------------------- */
/*  Audience                                                                  */
/* -------------------------------------------------------------------------- */

export type LabeledPct = { label: string; pct: number };
export type GeoRow = { country: string; pct: number };

export type AudienceData = {
  subscribers: number;
  subsGained: number;
  uniqueViewers: number;
  returningRate: number;
  avgViewLabel: string;
  newViewers: number;
  returning: number;
  age: LabeledPct[];
  countries: GeoRow[];
  devices: LabeledPct[];
  online: number[][];
  subscriberTrend: number[];
};

/** Turn raw weights into integer percentages summing to exactly 100. */
function normalizePct(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (w / sum) * 100);
  const floored = raw.map((r) => Math.floor(r));
  const rem = 100 - floored.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < rem; k++) floored[order[k % order.length].i] += 1;
  return floored;
}

const AGE_LABELS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];
const COUNTRY_POOL = [
  "United States",
  "United Kingdom",
  "India",
  "Canada",
  "Germany",
  "Australia",
  "Brazil",
  "Philippines",
];
const DEVICE_LABELS = ["Mobile", "Desktop", "TV", "Tablet"];

export function getAudience(channelId: string): AudienceData {
  const channel = getChannel(channelId);
  const videos = getVideos(channelId);
  const rnd = seeded(hashSeed(`${channelId}-audience`));

  const subscribers = channel.subscribers;
  const subsGained = Math.round(subscribers * (0.01 + rnd() * 0.05));
  const uniqueViewers = Math.round(
    videos.reduce((a, v) => a + v.views, 0) * (0.32 + rnd() * 0.26),
  );
  const returningRate = Math.round(38 + rnd() * 32);
  const totalSecs = 70 + Math.floor(rnd() * 250);
  const avgViewLabel = `${Math.floor(totalSecs / 60)}:${String(totalSecs % 60).padStart(2, "0")}`;
  const returning = Math.round(34 + rnd() * 30);
  const newViewers = 100 - returning;

  const peak = Math.floor(rnd() * 3) + 1;
  const age = AGE_LABELS.map((label) => ({ label, pct: 0 }));
  const agePct = normalizePct(
    AGE_LABELS.map((_, i) => Math.max(0.4, 3 - Math.abs(i - peak)) + rnd() * 0.6),
  );
  age.forEach((a, i) => (a.pct = agePct[i]));

  const geoPct = normalizePct(COUNTRY_POOL.map(() => 0.2 + rnd()));
  const countries = COUNTRY_POOL.map((country, i) => ({
    country,
    pct: geoPct[i],
  }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);

  const devPct = normalizePct([
    3.2 + rnd(),
    1.3 + rnd(),
    0.5 + rnd() * 0.8,
    0.4 + rnd() * 0.6,
  ]);
  const devices = DEVICE_LABELS.map((label, i) => ({ label, pct: devPct[i] }));

  const online = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 12 }, (_, slot) => {
      const evening = slot >= 8 && slot <= 11 ? 1.6 : slot >= 6 ? 1.1 : 0.5;
      const weekend = day >= 5 ? 1.15 : 1;
      const r = rnd() * evening * weekend;
      if (r < 0.4) return 0;
      if (r < 0.8) return 1;
      if (r < 1.15) return 2;
      if (r < 1.5) return 3;
      return 4;
    }),
  );

  let base = 0.36 + rnd() * 0.18;
  const subscriberTrend = Array.from({ length: 14 }, () => {
    base = Math.min(0.97, base + rnd() * 0.06);
    return round(base * 100, 1);
  });

  return {
    subscribers,
    subsGained,
    uniqueViewers,
    returningRate,
    avgViewLabel,
    newViewers,
    returning,
    age,
    countries,
    devices,
    online,
    subscriberTrend,
  };
}

/* -------------------------------------------------------------------------- */
/*  Schedule (planner)                                                        */
/* -------------------------------------------------------------------------- */
/* A static two-week window so SSR and client agree (no Date.now at load).
   "Today" is anchored at Tue Jun 16, 2026 — index 1 of the first week. */

const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const SCHEDULE_TODAY_INDEX = 1;

export type ScheduleWeek = { label: string; range: string };

export const SCHEDULE_WEEKS: ScheduleWeek[] = [
  { label: "This week", range: "Jun 15 – 21" },
  { label: "Next week", range: "Jun 22 – 28" },
];

export type ScheduleDay = {
  index: number;
  week: 0 | 1;
  weekday: string;
  dayNum: number;
  isWeekend: boolean;
  isToday: boolean;
  isPast: boolean;
};

export const SCHEDULE_DAYS: ScheduleDay[] = Array.from({ length: 14 }, (_, index) => {
  const dow = index % 7;
  return {
    index,
    week: (index < 7 ? 0 : 1) as 0 | 1,
    weekday: WEEKDAY_NAMES[dow],
    dayNum: 15 + index, // Jun 15 .. Jun 28
    isWeekend: dow >= 5,
    isToday: index === SCHEDULE_TODAY_INDEX,
    isPast: index < SCHEDULE_TODAY_INDEX,
  };
});

/** Human-relative day label, anchored at today. */
export function relativeDay(dayIndex: number): string {
  const diff = dayIndex - SCHEDULE_TODAY_INDEX;
  if (diff <= 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

const SCHEDULE_SLOTS = [
  { minutes: 420, label: "7:00 AM", short: "7a" },
  { minutes: 540, label: "9:00 AM", short: "9a" },
  { minutes: 720, label: "12:00 PM", short: "12p" },
  { minutes: 900, label: "3:00 PM", short: "3p" },
  { minutes: 1080, label: "6:00 PM", short: "6p" },
  { minutes: 1200, label: "8:00 PM", short: "8p" },
];

export type UploadStatus = "Scheduled" | "Rendering" | "Draft";

export type ScheduledUpload = {
  id: string;
  channelId: string;
  title: string;
  thumb: string;
  visual: boolean;
  kind: AssetKind;
  status: UploadStatus;
  dayIndex: number;
  minutes: number;
  timeLabel: string;
  autopilot: boolean;
};

const SCHED_KINDS: AssetKind[] = [
  "Long-form",
  "Short",
  "Short",
  "Cuts",
  "Long-form",
  "Short",
  "Thumbnail",
  "Short",
  "Cuts",
  "Script",
  "Long-form",
  "Short",
];

/** Deterministically pick `k` distinct slot indices, returned in time order. */
function pickSlots(rnd: () => number, k: number): number[] {
  const idx = SCHEDULE_SLOTS.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, k).sort((a, b) => a - b);
}

function buildSchedule(channel: Channel): ScheduledUpload[] {
  const rnd = seeded(hashSeed(`${channel.id}-schedule`));
  const out: ScheduledUpload[] = [];
  let i = 0;

  for (let d = SCHEDULE_TODAY_INDEX; d < 14; d++) {
    const weekend = d % 7 >= 5;
    const weekFade = d < 7 ? 1 : 0.7; // next week is a little sparser
    const chance = (weekend ? 0.3 : 0.74) * weekFade;
    if (rnd() > chance) continue;

    const perDay = 1 + (rnd() > 0.78 ? 1 : 0);
    for (const si of pickSlots(rnd, perDay)) {
      const slot = SCHEDULE_SLOTS[si];
      const kind = SCHED_KINDS[i % SCHED_KINDS.length];
      const soon = d <= SCHEDULE_TODAY_INDEX + 1;
      const status: UploadStatus = soon
        ? rnd() > 0.45
          ? "Rendering"
          : "Scheduled"
        : rnd() > 0.85
          ? "Draft"
          : "Scheduled";

      out.push({
        id: `${channel.id}-sch${i}`,
        channelId: channel.id,
        title: channel.videoTitles[i % channel.videoTitles.length],
        thumb: channel.thumbs[i % channel.thumbs.length],
        visual: kind !== "Script",
        kind,
        status,
        dayIndex: d,
        minutes: slot.minutes,
        timeLabel: slot.label,
        autopilot: rnd() > 0.56,
      });
      i++;
    }
  }

  return out.sort((a, b) => a.dayIndex - b.dayIndex || a.minutes - b.minutes);
}

const SCHEDULE_BY_CHANNEL: Record<string, ScheduledUpload[]> = Object.fromEntries(
  CHANNELS.map((c) => [c.id, buildSchedule(c)]),
);

export function getSchedule(channelId: string): ScheduledUpload[] {
  return SCHEDULE_BY_CHANNEL[channelId] ?? [];
}

/* -------------------------------------------------------------------------- */
/*  Best time to publish                                                      */
/* -------------------------------------------------------------------------- */

export type BestTime = {
  grid: number[][]; // [7 weekdays][6 slots] intensity 0..4
  weekdays: string[];
  slots: string[];
  bestDay: number;
  bestSlot: number;
  bestLabel: string;
};

export function getBestTimes(channelId: string): BestTime {
  const rnd = seeded(hashSeed(`${channelId}-besttime`));
  const grid = WEEKDAY_NAMES.map((_, day) =>
    SCHEDULE_SLOTS.map((s) => {
      const evening = s.minutes >= 1020 ? 1.7 : s.minutes >= 660 ? 1.15 : 0.6;
      const weekend = day >= 5 ? 1.2 : 1;
      const r = rnd() * evening * weekend;
      if (r < 0.45) return 0;
      if (r < 0.85) return 1;
      if (r < 1.2) return 2;
      if (r < 1.6) return 3;
      return 4;
    }),
  );

  let bestDay = 0;
  let bestSlot = 0;
  let best = -1;
  grid.forEach((row, day) =>
    row.forEach((v, slot) => {
      const score = v * 10 + slot; // tie-break toward later slots
      if (score > best) {
        best = score;
        bestDay = day;
        bestSlot = slot;
      }
    }),
  );

  return {
    grid,
    weekdays: WEEKDAY_NAMES,
    slots: SCHEDULE_SLOTS.map((s) => s.short),
    bestDay,
    bestSlot,
    bestLabel: `${WEEKDAY_NAMES[bestDay]} · ${SCHEDULE_SLOTS[bestSlot].label}`,
  };
}

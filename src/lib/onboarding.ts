/**
 * Mock data for the blobgen.ai onboarding flow (frontend only).
 *
 * The flow connects an *existing* YouTube channel, has the AI "read" its videos
 * to infer what it's about, and finds competitors. It reuses the studio's demo
 * channels as the channels detected on the account, so the studio the user lands
 * in reflects the channel they just connected.
 */

import {
  CHANNELS,
  getAnalytics,
  getAudience,
  getChannel,
} from "@/lib/studio";

/* -------------------------------------------------------------------------- */
/*  Auth providers (account step)                                              */
/* -------------------------------------------------------------------------- */

export type Provider = { id: string; label: string };
export const PROVIDERS: Provider[] = [
  { id: "google", label: "Google" },
  { id: "youtube", label: "YouTube" },
];

/* -------------------------------------------------------------------------- */
/*  Detected channels (connect step)                                           */
/*  These are the studio's demo channels — i.e. what "your account" owns.      */
/* -------------------------------------------------------------------------- */

export const DETECTED_CHANNELS = CHANNELS;
export const NEW_CHANNEL_ID = "new";

/* -------------------------------------------------------------------------- */
/*  New-channel setup                                                          */
/* -------------------------------------------------------------------------- */

export const AVATAR_OPTIONS = [
  "/images/motivation.jpg",
  "/images/finance.jpg",
  "/images/space.jpg",
  "/images/history.jpg",
  "/images/lion.jpg",
  "/images/city.jpg",
  "/images/mountains.jpg",
  "/images/tech.jpg",
];

export function toHandle(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}

/* -------------------------------------------------------------------------- */
/*  AI channel analysis (existing-channel path)                                */
/* -------------------------------------------------------------------------- */

const PILLARS: Record<string, string[]> = {
  stoic: ["Discipline", "Morning routines", "Stoic philosophy", "Focus"],
  ledger: ["Personal finance", "Budgeting", "Investing 101", "Money psychology"],
  cosmic: ["Sleep stories", "Space & astronomy", "Ambient narration", "ASMR"],
  echo: ["History", "Mini-docs", "Ancient world", "Untold stories"],
};

const THROUGHLINE: Record<string, string> = {
  stoic: "calm, sharp lessons on discipline and focus",
  ledger: "patient, jargon-free explainers about money",
  cosmic: "slow, narrated journeys through space, made for sleep",
  echo: "tight, surprising stories from history",
};

export type ChannelAnalysis = {
  videoCount: number;
  niche: string;
  pillars: string[];
  /** Ordered narration blocks streamed out during the analysis. */
  lines: string[];
  /** Editable one-liner prefilled for the user to confirm or tweak. */
  summary: string;
  audienceAge: string;
  topCountry: string;
  shortsPct: number;
};

export function buildAnalysis(channelId: string): ChannelAnalysis {
  const channel = getChannel(channelId);
  const analytics = getAnalytics(channelId);
  const audience = getAudience(channelId);
  const pillars = PILLARS[channelId] ?? ["Storytelling", "Short-form", "Faceless"];
  const through = THROUGHLINE[channelId] ?? "a consistent, faceless content style";

  const topAge = [...audience.age].sort((a, b) => b.pct - a.pct)[0]?.label ?? "25-34";
  const topCountry = audience.countries[0]?.country ?? "United States";
  const shortsPct = analytics.formatSplit.shorts;
  const videoCount = channel.videoTitles.length;
  const [t1, t2] = channel.videoTitles;

  return {
    videoCount,
    niche: channel.niche,
    pillars,
    audienceAge: topAge,
    topCountry,
    shortsPct,
    lines: [
      `${channel.name} is a ${channel.niche.toLowerCase()} channel.`,
      `Across its ${videoCount} videos, the through-line is ${through}. Uploads like “${t1}” and “${t2}” set the tone.`,
      `The audience skews ${topAge} and is concentrated in ${topCountry}, watching mostly in the evening.`,
      `Roughly ${shortsPct}% of output is Shorts — that's where blobgen will focus first.`,
    ],
    summary: `${channel.name} makes ${channel.niche.toLowerCase()} content — ${pillars
      .slice(0, 3)
      .join(", ")
      .toLowerCase()}. blobgen will generate on-brand Shorts and long-form in this voice.`,
  };
}

/* -------------------------------------------------------------------------- */
/*  Competitors (mocked YouTube search)                                        */
/* -------------------------------------------------------------------------- */

export type Competitor = {
  id: string;
  name: string;
  handle: string;
  subscribers: number;
  avatar: string;
  /** Maps to a detected-channel id for "suggested for you", or "general". */
  niche: string;
};

export const COMPETITORS: Competitor[] = [
  // Stoicism / discipline
  { id: "c-dd", name: "Daily Discipline", handle: "dailydiscipline", subscribers: 412_000, avatar: "/images/motivation.jpg", niche: "stoic" },
  { id: "c-im", name: "Iron Mind", handle: "ironmind", subscribers: 188_000, avatar: "/images/lion.jpg", niche: "stoic" },
  { id: "c-mm", name: "The Marcus Method", handle: "marcusmethod", subscribers: 76_400, avatar: "/images/notebook.jpg", niche: "stoic" },
  // Finance
  { id: "c-cl", name: "Coin Logic", handle: "coinlogic", subscribers: 934_000, avatar: "/images/finance.jpg", niche: "ledger" },
  { id: "c-bd", name: "The Budget Desk", handle: "budgetdesk", subscribers: 245_000, avatar: "/images/desk.jpg", niche: "ledger" },
  { id: "c-ic", name: "Index & Chill", handle: "indexandchill", subscribers: 61_200, avatar: "/images/blueberries.jpg", niche: "ledger" },
  // Space / sleep
  { id: "c-ds", name: "Drift to Sleep", handle: "drifttosleep", subscribers: 1_270_000, avatar: "/images/space.jpg", niche: "cosmic" },
  { id: "c-nn", name: "Nebula Nights", handle: "nebulanights", subscribers: 503_000, avatar: "/images/mountains.jpg", niche: "cosmic" },
  { id: "c-ol", name: "Orbit Lullabies", handle: "orbitlullabies", subscribers: 142_000, avatar: "/images/travel.jpg", niche: "cosmic" },
  // History
  { id: "c-pt", name: "Past Tense", handle: "pasttense", subscribers: 689_000, avatar: "/images/history.jpg", niche: "echo" },
  { id: "c-ch", name: "The Chronicle", handle: "thechronicle", subscribers: 318_000, avatar: "/images/hourglass.jpg", niche: "echo" },
  { id: "c-ye", name: "Yesterday, Explained", handle: "yesterdayexplained", subscribers: 97_800, avatar: "/images/city.jpg", niche: "echo" },
  // General / faceless-creator
  { id: "c-fe", name: "Faceless Empire", handle: "facelessempire", subscribers: 556_000, avatar: "/images/tech.jpg", niche: "general" },
  { id: "c-qg", name: "Quiet Growth", handle: "quietgrowth", subscribers: 121_000, avatar: "/images/desk.jpg", niche: "general" },
  { id: "c-dd2", name: "The Daily Drop", handle: "thedailydrop", subscribers: 84_300, avatar: "/images/notebook.jpg", niche: "general" },
];

export function getCompetitor(id: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.id === id);
}

/** Keyword → niche key, used to suggest competitors for a new (freeform) channel. */
function inferNicheKey(text: string): string {
  const t = text.toLowerCase();
  if (/(space|sleep|cosmos|astronom|nebula|asmr)/.test(t)) return "cosmic";
  if (/(money|finance|budget|invest|stock|crypto|wealth)/.test(t)) return "ledger";
  if (/(history|ancient|war|empire|myth|past)/.test(t)) return "echo";
  if (/(stoic|discipline|motivat|mindset|habit|focus)/.test(t)) return "stoic";
  return "general";
}

/** Suggested competitors for an existing channel id or a freeform topic string. */
export function suggestCompetitors(nicheKeyOrTopic: string): Competitor[] {
  const key = COMPETITORS.some((c) => c.niche === nicheKeyOrTopic)
    ? nicheKeyOrTopic
    : inferNicheKey(nicheKeyOrTopic);
  const matched = COMPETITORS.filter((c) => c.niche === key);
  const pool = matched.length ? matched : COMPETITORS.filter((c) => c.niche === "general");
  return pool.slice(0, 3);
}

/** Mocked YouTube search — matches name/handle, case-insensitive. */
export function searchCompetitors(query: string): Competitor[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return COMPETITORS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q),
  );
}

/* -------------------------------------------------------------------------- */
/*  Wizard steps (shown in the progress rail)                                  */
/* -------------------------------------------------------------------------- */

export type WizardStepId = "connect" | "channel" | "competitors";

export const WIZARD_STEPS: { id: WizardStepId; rail: string; eyebrow: string }[] = [
  { id: "connect", rail: "Connect", eyebrow: "Account" },
  { id: "channel", rail: "Your channel", eyebrow: "Setup" },
  { id: "competitors", rail: "Competitors", eyebrow: "Benchmark" },
];

export type StepMeta = { eyebrow: string; title: string; subtitle: string };

export function stepMeta(id: WizardStepId, isNew: boolean): StepMeta {
  switch (id) {
    case "connect":
      return {
        eyebrow: "Account",
        title: "Connect your YouTube",
        subtitle: "Link your account and choose the channel you want blobgen to run.",
      };
    case "channel":
      return isNew
        ? {
            eyebrow: "New channel",
            title: "Tell us about your channel",
            subtitle: "There are no videos to read yet — describe what it'll be about.",
          }
        : {
            eyebrow: "Analysis",
            title: "Here's what we found",
            subtitle: "We read your channel so the studio understands its voice and audience.",
          };
    case "competitors":
      return {
        eyebrow: "Benchmark",
        title: "Who are you up against?",
        subtitle: "Track competitors to benchmark performance and surface content gaps.",
      };
  }
}

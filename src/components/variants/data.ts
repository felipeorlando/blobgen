import {
  AudioLines,
  Captions,
  FileText,
  Images,
  Lightbulb,
  type LucideIcon,
  Upload,
} from "lucide-react";

export type StepId =
  | "topic"
  | "script"
  | "voiceover"
  | "visuals"
  | "captions"
  | "upload";

export type Step = {
  id: StepId;
  n: number;
  label: string;
  short: string;
  blurb: string;
  icon: LucideIcon;
};

// Single source of truth shared by all three step-by-step variants.
export const STEPS: Step[] = [
  {
    id: "topic",
    n: 1,
    label: "Topic",
    short: "Topic",
    blurb: "Drop in any idea or keyword to start.",
    icon: Lightbulb,
  },
  {
    id: "script",
    n: 2,
    label: "Script",
    short: "Script",
    blurb: "AI writes a hook, body, and CTA in seconds.",
    icon: FileText,
  },
  {
    id: "voiceover",
    n: 3,
    label: "Voiceover",
    short: "Voiceover",
    blurb: "A natural AI voice narrates every line.",
    icon: AudioLines,
  },
  {
    id: "visuals",
    n: 4,
    label: "Visuals",
    short: "Visuals",
    blurb: "On-brand b-roll matched to the script.",
    icon: Images,
  },
  {
    id: "captions",
    n: 5,
    label: "Captions",
    short: "Captions",
    blurb: "Word-perfect captions, auto-timed.",
    icon: Captions,
  },
  {
    id: "upload",
    n: 6,
    label: "Upload / Schedule",
    short: "Upload",
    blurb: "Publish now or schedule to YouTube.",
    icon: Upload,
  },
];

export const SCRIPT = [
  {
    head: "HOOK (0–2s)",
    lines: ["These AI tools will 10x your content workflow."],
  },
  {
    head: "MAIN (2–25s)",
    lines: [
      "1. ChatGPT – ideation & writing assistant.",
      "2. Canva – stunning designs in seconds.",
      "3. Descript – edit videos like a doc.",
      "4. Runway – next-level AI video tools.",
    ],
  },
  {
    head: "CTA (25–30s)",
    lines: ["Save this & follow for more creator tips!"],
  },
];

export const VISUALS = [
  { img: "/images/space.jpg", tag: "HOOK", name: "Intro" },
  { img: "/images/tech.jpg", tag: "00:02", name: "1. ChatGPT" },
  { img: "/images/desk.jpg", tag: "00:06", name: "2. Canva" },
  { img: "/images/notebook.jpg", tag: "00:10", name: "3. Descript" },
  { img: "/images/city.jpg", tag: "00:14", name: "4. Runway" },
];

export const CAPTIONS = [
  { time: "00:00", lead: "These ", hl: "AI tools", tail: " will 10x your workflow." },
  { time: "00:02", hl: "1. ChatGPT", tail: " – ideation & writing assistant." },
  { time: "00:06", hl: "2. Canva", tail: " – stunning designs in seconds." },
  { time: "00:10", hl: "3. Descript", tail: " – edit videos like a doc." },
];

export const WAVE = [
  28, 44, 62, 38, 80, 54, 70, 90, 48, 34, 60, 76, 42, 88, 56, 30, 66, 50, 82,
  40, 58, 72, 46, 94, 36, 64, 52, 78, 44, 86, 32, 68, 54, 74, 40, 60, 48, 84,
  38, 56,
];

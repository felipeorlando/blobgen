import Image from "next/image";
import {
  ArrowRight,
  AudioLines,
  CalendarDays,
  Captions,
  Download,
  EllipsisVertical,
  FileText,
  Images,
  Lightbulb,
  type LucideIcon,
  MessageCircle,
  Mic,
  Play,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Upload,
  Zap,
} from "lucide-react";
import { Eyebrow } from "@/components/section-heading";
import { LogoMark, YouTubeIcon } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS: { n: number; label: string; icon: LucideIcon }[] = [
  { n: 1, label: "Topic", icon: Lightbulb },
  { n: 2, label: "Script", icon: FileText },
  { n: 3, label: "Voiceover", icon: AudioLines },
  { n: 4, label: "Visuals", icon: Images },
  { n: 5, label: "Captions", icon: Captions },
  { n: 6, label: "Upload / Schedule", icon: Upload },
];

export function Pipeline() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
    >
      <div className="glow-radial" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ---- header ---- */}
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Eyebrow icon={Sparkles}>AI Video Autopilot</Eyebrow>
          <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-grad-light">Turn any topic into a </span>
            <span className="text-grad-red">YouTube Short</span>
            <span className="text-grad-light"> on autopilot</span>
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            blobgen.ai writes the script, adds AI voiceover, creates visuals,
            auto-captions, and publishes or schedules your Short—automatically.
          </p>
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <a
              href="#pricing"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-12 w-full rounded-xl px-7 text-base font-semibold glow-red hover:bg-primary sm:w-auto",
              )}
            >
              <Zap className="size-4" />
              Generate a Short
            </a>
            <a
              href="#use-cases"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "h-12 w-full rounded-xl px-7 text-base font-semibold sm:w-auto",
              )}
            >
              <Play className="size-4" />
              Watch Demo
            </a>
          </div>
        </div>

        {/* ---- stepper ---- */}
        <div className="mt-12 overflow-x-auto no-scrollbar">
          <ol className="mx-auto flex min-w-max items-center justify-center gap-1 sm:gap-2">
            {STEPS.map((s, i) => (
              <li key={s.n} className="flex items-center">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground dark:bg-background/50">
                    <s.icon className="size-4" />
                  </span>
                  <span className="flex size-5 items-center justify-center rounded-full bg-foreground/[0.08] text-[11px] font-bold text-foreground dark:bg-white/10">
                    {s.n}
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium text-foreground">
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 ? (
                  <ArrowRight className="mx-2 size-4 shrink-0 text-muted-foreground/40 sm:mx-3" />
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        {/* ---- bento ---- */}
        <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,248px)_minmax(0,0.72fr)] lg:items-stretch">
          {/* LEFT region */}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-rows-[1fr_auto]">
            <TopicCard />
            <ScriptCard />
            <VoiceoverCard />
            <VisualsCard className="sm:col-span-3" />
          </div>

          {/* CENTER phone */}
          <div className="mx-auto w-full max-w-[300px] lg:max-w-none lg:h-full">
            <PhonePreview />
          </div>

          {/* RIGHT region */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-rows-[1fr_auto]">
            <CaptionsCard />
            <UploadCard />
            <AllSetBar className="sm:col-span-2" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- shared ---------------- */

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card card-surface transition-colors hover:border-primary/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {n}
    </span>
  );
}

function CardHead({
  n,
  title,
  badge,
}: {
  n: number;
  title: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
      <StepNumber n={n} />
      <h3 className="text-[0.95rem] font-semibold whitespace-nowrap text-foreground">
        {title}
      </h3>
      {badge ? <span className="ml-auto shrink-0">{badge}</span> : null}
    </div>
  );
}

function ReadyBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
      {children}
    </span>
  );
}

function MockButton({
  icon: Icon,
  className,
  children,
}: {
  icon: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        buttonVariants({ variant: "default" }),
        "h-10 rounded-xl px-4 text-sm font-semibold glow-red",
        className,
      )}
    >
      <Icon className="size-4" />
      {children}
    </span>
  );
}

/* ---------------- 1. Topic ---------------- */

function TopicCard() {
  return (
    <Card className="flex flex-col p-4">
      <CardHead n={1} title="Topic" />
      <p className="mt-3 text-xs text-muted-foreground">
        {"What's your Short about?"}
      </p>
      <div className="mt-2 flex flex-1 flex-col rounded-xl border border-border bg-muted/50 p-3 dark:bg-background/50">
        <p className="text-sm font-medium text-foreground">
          Best AI tools for creators
        </p>
        <p className="mt-auto pt-6 text-right text-[11px] text-muted-foreground">
          27/120
        </p>
      </div>
      <MockButton icon={Sparkles} className="mt-3 justify-center">
        Generate Script
      </MockButton>
    </Card>
  );
}

/* ---------------- 2. Script ---------------- */

const SCRIPT = [
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

function ScriptCard() {
  return (
    <Card className="flex flex-col p-4">
      <CardHead n={2} title="Script" badge={<ReadyBadge>AI Generated</ReadyBadge>} />
      <div className="mt-3 space-y-3 font-mono text-[11px] leading-relaxed">
        {SCRIPT.map((block) => (
          <div key={block.head}>
            <p className="font-semibold tracking-wide text-primary/90">
              {block.head}
            </p>
            {block.lines.map((line) => (
              <p key={line} className="text-foreground/85">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- 3. Voiceover ---------------- */

const WAVE = [
  28, 44, 62, 38, 80, 54, 70, 90, 48, 34, 60, 76, 42, 88, 56, 30, 66, 50, 82,
  40, 58, 72, 46, 94, 36, 64, 52, 78, 44, 86, 32, 68, 54, 74, 40, 60, 48, 84,
  38, 56,
];

function VoiceoverCard() {
  return (
    <Card className="flex flex-col p-4">
      <CardHead n={3} title="Voiceover" badge={<ReadyBadge>Voice Ready</ReadyBadge>} />
      <div className="mt-3 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.5_0.243_28)] text-white">
          <Mic className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Emma (US)</p>
          <p className="text-xs text-muted-foreground">Friendly • Energetic</p>
        </div>
      </div>
      <div className="mt-4 flex h-12 items-center gap-[2px]">
        {WAVE.map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}%` }}
            className={cn(
              "flex-1 rounded-full",
              i < 15 ? "bg-primary" : "bg-primary/30",
            )}
          />
        ))}
      </div>
      <div className="mt-auto flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-2.5 pt-3 dark:bg-background/50">
        <Play className="size-4 fill-current text-foreground" />
        <span className="font-mono text-xs text-muted-foreground">
          0:00 / 0:30
        </span>
        <Download className="ml-auto size-4 text-muted-foreground" />
      </div>
    </Card>
  );
}

/* ---------------- 4. Visuals ---------------- */

const VISUALS = [
  { img: "/images/space.jpg", tag: "HOOK", name: "Intro" },
  { img: "/images/tech.jpg", tag: "00:02", name: "1. ChatGPT" },
  { img: "/images/desk.jpg", tag: "00:06", name: "2. Canva" },
  { img: "/images/notebook.jpg", tag: "00:10", name: "3. Descript" },
  { img: "/images/city.jpg", tag: "00:14", name: "4. Runway" },
];

function VisualsCard({ className }: { className?: string }) {
  return (
    <Card className={cn("flex flex-col p-4", className)}>
      <CardHead n={4} title="Visuals" badge={<ReadyBadge>AI Generated</ReadyBadge>} />
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {VISUALS.map((v) => (
          <div
            key={v.name}
            className="overflow-hidden rounded-lg border border-border bg-muted/40 dark:bg-background/40"
          >
            <div className="relative aspect-[5/4]">
              <Image
                src={v.img}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
              <span className="absolute left-1 top-1 rounded bg-black/65 px-1 py-0.5 font-mono text-[9px] font-medium text-white">
                {v.tag}
              </span>
            </div>
            <p className="truncate px-1.5 py-1 text-[10px] font-medium text-foreground">
              {v.name}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- center: phone ---------------- */

function RailIcon({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="flex size-9 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm">
        <Icon className="size-4" />
      </span>
      <span className="text-[9px] font-semibold">{label}</span>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[2.2rem] border-[6px] border-foreground/10 bg-black shadow-2xl lg:aspect-auto lg:h-full">
      <Image
        src="/images/tech.jpg"
        alt="Generated YouTube Short preview"
        fill
        sizes="280px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/85" />

      {/* content */}
      <div className="relative flex h-full flex-col p-3.5 text-white">
        <div className="flex items-center justify-end">
          <EllipsisVertical className="size-4" />
        </div>

        {/* stacked captions */}
        <div className="mt-3 flex flex-col items-start gap-1.5">
          <span className="-rotate-1 rounded bg-white px-2 py-1 text-[0.95rem] font-extrabold tracking-tight text-black shadow-md">
            Best AI tools
          </span>
          <span className="rotate-1 rounded bg-primary px-2 py-1 text-[0.95rem] font-extrabold tracking-tight text-white shadow-md">
            for creators
          </span>
        </div>

        <div className="flex-1" />

        {/* bottom meta */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <LogoMark className="size-6 rounded-md" />
            <span className="text-xs font-semibold">@blobgenai</span>
            <span className="ml-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-black">
              Subscribe
            </span>
          </div>
          <p className="text-[11px] leading-snug">
            Best AI tools for creators{" "}
            <span className="text-white/65">
              #aitools #creators #productivity
            </span>
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full w-1/3 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      {/* action rail */}
      <div className="absolute bottom-24 right-2.5 flex flex-col items-center gap-3 text-white">
        <RailIcon icon={ThumbsUp} label="12K" />
        <RailIcon icon={ThumbsDown} label="Dislike" />
        <RailIcon icon={MessageCircle} label="143" />
        <RailIcon icon={Share2} label="Share" />
      </div>
    </div>
  );
}

/* ---------------- 5. Captions ---------------- */

const CAPTIONS = [
  { time: "00:00", lead: "These ", hl: "AI tools", tail: " will 10x your workflow." },
  { time: "00:02", hl: "1. ChatGPT", tail: " – ideation & writing assistant." },
  { time: "00:06", hl: "2. Canva", tail: " – stunning designs in seconds." },
  { time: "00:10", hl: "3. Descript", tail: " – edit videos like a doc." },
];

function CaptionsCard() {
  return (
    <Card className="flex flex-col p-4">
      <CardHead
        n={5}
        title="Captions"
        badge={<ReadyBadge>Auto Captions</ReadyBadge>}
      />
      <div className="mt-3 flex flex-col gap-2.5">
        {CAPTIONS.map((c) => (
          <div key={c.time} className="flex gap-2.5">
            <span className="mt-px shrink-0 rounded-md bg-muted/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground dark:bg-background/70">
              {c.time}
            </span>
            <p className="text-xs leading-relaxed text-foreground/85">
              {c.lead ? c.lead : null}
              <span className="font-semibold text-primary">{c.hl}</span>
              {c.tail}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- 6. Upload / Schedule ---------------- */

function Radio({ label, selected }: { label: string; selected?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "flex size-3.5 items-center justify-center rounded-full border",
          selected ? "border-primary" : "border-input",
        )}
      >
        {selected ? <span className="size-1.5 rounded-full bg-primary" /> : null}
      </span>
      <span className={selected ? "font-medium text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </span>
  );
}

function UploadCard() {
  return (
    <Card className="flex flex-col p-4">
      <CardHead
        n={6}
        title="Upload / Schedule"
        badge={<ReadyBadge>Scheduled</ReadyBadge>}
      />
      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-border bg-muted/50 p-2.5 dark:bg-background/50">
        <YouTubeIcon className="size-6 shrink-0 text-[#FF0000]" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            @blobgenai
          </p>
          <p className="text-[11px] text-muted-foreground">125K subscribers</p>
        </div>
      </div>

      <p className="mt-3 text-xs font-medium text-muted-foreground">
        Publish as
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
        <Radio label="Public" selected />
        <Radio label="Unlisted" />
        <Radio label="Private" />
      </div>

      <p className="mt-3 text-xs font-medium text-muted-foreground">
        Schedule for
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-xs font-medium text-foreground dark:bg-background/60">
          <CalendarDays className="size-3.5 text-muted-foreground" />
          May 24, 2025
        </span>
        <span className="inline-flex items-center rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-xs font-medium text-foreground dark:bg-background/60">
          6:00 PM
        </span>
      </div>

      <MockButton icon={CalendarDays} className="mt-4 h-11 justify-center">
        <span className="flex flex-col items-center leading-tight">
          <span>Scheduled</span>
          <span className="text-[10px] font-medium opacity-85">for 6:00 PM</span>
        </span>
      </MockButton>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        {"We'll publish automatically."}
      </p>
    </Card>
  );
}

/* ---------------- all set ---------------- */

function AllSetBar({ className }: { className?: string }) {
  return (
    <Card className={cn("flex items-center gap-3.5 p-4", className)}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
        <Zap className="size-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {"All set! Your Short is ready to go."}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          blobgen.ai handles the rest while you focus on growing.
        </p>
      </div>
    </Card>
  );
}

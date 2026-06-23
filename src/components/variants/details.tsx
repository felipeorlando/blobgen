import Image from "next/image";
import { CalendarDays, Download, Mic, Play } from "lucide-react";
import { YouTubeIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { CAPTIONS, SCRIPT, VISUALS, WAVE, type StepId } from "./data";

/** Rich illustration for a single pipeline step. Fills its parent panel. */
export function StepDetail({ id }: { id: StepId }) {
  switch (id) {
    case "topic":
      return <TopicDetail />;
    case "script":
      return <ScriptDetail />;
    case "voiceover":
      return <VoiceoverDetail />;
    case "visuals":
      return <VisualsDetail />;
    case "captions":
      return <CaptionsDetail />;
    case "upload":
      return <UploadDetail />;
  }
}

function ReadyTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
      {children}
    </span>
  );
}

function DetailFrame({
  caption,
  badge,
  children,
}: {
  caption: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 duration-500 animate-in fade-in-0 slide-in-from-bottom-1">
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
          {caption}
        </p>
        {badge}
      </div>
      <div className="mt-5 flex flex-1 flex-col duration-500 animate-in fade-in-0 slide-in-from-bottom-3 [animation-delay:110ms] [animation-fill-mode:both]">
        {children}
      </div>
    </div>
  );
}

function TopicDetail() {
  return (
    <DetailFrame caption="What's your Short about?">
      <div className="flex flex-1 flex-col justify-center">
        <div className="rounded-2xl border border-border bg-muted/40 p-4 dark:bg-background/40">
          <p className="text-lg font-semibold text-foreground sm:text-xl">
            Best AI tools for creators
            <span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 animate-pulse bg-primary align-middle sm:h-6" />
          </p>
          <p className="mt-6 text-right text-xs text-muted-foreground">27 / 120</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["#aitools", "#creators", "#productivity"].map((t) => (
            <span
              key={t}
              className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </DetailFrame>
  );
}

function ScriptDetail() {
  return (
    <DetailFrame caption="Script" badge={<ReadyTag>AI Generated</ReadyTag>}>
      <div className="space-y-3 font-mono text-xs leading-relaxed">
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
    </DetailFrame>
  );
}

function VoiceoverDetail() {
  return (
    <DetailFrame caption="Voiceover" badge={<ReadyTag>Voice Ready</ReadyTag>}>
      <div className="flex flex-1 flex-col justify-center gap-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Mic className="size-5" />
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">Emma (US)</p>
            <p className="text-xs text-muted-foreground">Friendly • Energetic</p>
          </div>
        </div>
        <div className="flex h-16 items-center gap-[3px]">
          {WAVE.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className={cn(
                "flex-1 rounded-full",
                i < 18 ? "bg-primary" : "bg-primary/30",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/40">
          <Play className="size-4 fill-current text-foreground" />
          <span className="font-mono text-xs text-muted-foreground">
            0:00 / 0:30
          </span>
          <Download className="ml-auto size-4 text-muted-foreground" />
        </div>
      </div>
    </DetailFrame>
  );
}

function VisualsDetail() {
  return (
    <DetailFrame caption="Visuals" badge={<ReadyTag>AI Generated</ReadyTag>}>
      <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-5">
        {VISUALS.map((v) => (
          <div
            key={v.name}
            className="overflow-hidden rounded-xl border border-border bg-muted/30 dark:bg-background/30"
          >
            <div className="relative aspect-[3/4] sm:aspect-[4/5]">
              <Image
                src={v.img}
                alt=""
                fill
                sizes="160px"
                className="object-cover"
              />
              <span className="absolute left-1.5 top-1.5 rounded bg-black/65 px-1 py-0.5 font-mono text-[9px] font-medium text-white">
                {v.tag}
              </span>
            </div>
            <p className="truncate px-2 py-1.5 text-[11px] font-medium text-foreground">
              {v.name}
            </p>
          </div>
        ))}
      </div>
    </DetailFrame>
  );
}

function CaptionsDetail() {
  return (
    <DetailFrame caption="Captions" badge={<ReadyTag>Auto Captions</ReadyTag>}>
      <div className="flex flex-1 flex-col justify-center gap-3">
        {CAPTIONS.map((c) => (
          <div key={c.time} className="flex gap-3">
            <span className="mt-0.5 shrink-0 rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground dark:bg-background/60">
              {c.time}
            </span>
            <p className="text-sm leading-relaxed text-foreground/85">
              {c.lead ? c.lead : null}
              <span className="font-semibold text-primary">{c.hl}</span>
              {c.tail}
            </p>
          </div>
        ))}
      </div>
    </DetailFrame>
  );
}

function UploadDetail() {
  return (
    <DetailFrame caption="Upload / Schedule" badge={<ReadyTag>Scheduled</ReadyTag>}>
      <div className="flex flex-1 flex-col justify-center gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/40">
          <YouTubeIcon className="size-7 shrink-0 text-[#FF0000]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              @blobgenai
            </p>
            <p className="text-xs text-muted-foreground">127.4K subscribers</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
            <span className="size-3.5 rounded-full border-[3px] border-primary" />
            Public
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground dark:bg-background/50">
            <CalendarDays className="size-4 text-muted-foreground" />
            May 24, 2025
          </span>
          <span className="inline-flex items-center rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground dark:bg-background/50">
            6:00 PM
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
          <CalendarDays className="size-4 text-primary" />
          <span className="font-semibold text-foreground">
            Scheduled for 6:00 PM
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            Auto-publish on
          </span>
        </div>
      </div>
    </DetailFrame>
  );
}

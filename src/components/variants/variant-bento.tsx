"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CAPTIONS, SCRIPT, STEPS, VISUALS, WAVE, type Step } from "./data";
import { useAutoAdvance } from "./use-auto-advance";

const DURATION = 3200;

// Span hints drive the asymmetric masonry; focus moves, the grid stays put.
const SPAN: Record<string, string> = {
  script: "lg:row-span-2",
  visuals: "lg:row-span-2",
};

export function VariantBento() {
  const { active, setActive, setPaused } = useAutoAdvance(STEPS.length, DURATION);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[170px] lg:grid-flow-row-dense lg:grid-cols-3"
    >
      {STEPS.map((step, i) => (
        <BentoTile
          key={step.id}
          step={step}
          active={i === active}
          onSelect={() => setActive(i)}
          className={SPAN[step.id]}
        />
      ))}
    </div>
  );
}

function BentoTile({
  step,
  active,
  onSelect,
  className,
}: {
  step: Step;
  active: boolean;
  onSelect: () => void;
  className?: string;
}) {
  const Icon = step.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "step" : undefined}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[1.6rem] border p-5 text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.99]",
        active
          ? "z-10 border-primary/40 bg-card shadow-[0_24px_50px_-24px_oklch(0.6_0.24_26/0.45)] lg:scale-[1.015]"
          : "border-border bg-card/40 opacity-75 hover:opacity-100",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg border transition-colors",
            active
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-muted/50 text-muted-foreground dark:bg-background/50",
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="text-sm font-semibold text-foreground">{step.label}</span>
        <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground/50">
          0{step.n}
        </span>
        {active ? (
          <span className="relative ml-1 flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/70" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <TileBody step={step} active={active} />
      </div>
    </button>
  );
}

function TileBody({ step, active }: { step: Step; active: boolean }) {
  switch (step.id) {
    case "topic":
      return (
        <div className="flex flex-1 items-center">
          <div className="w-full rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/40">
            <p className={cn("text-sm font-medium text-foreground", active && "pipe-caret")}>
              Best AI tools for creators
            </p>
          </div>
        </div>
      );

    case "script":
      return (
        <div className="relative space-y-2 overflow-hidden font-mono text-[11px] leading-relaxed">
          {SCRIPT.map((b) => (
            <div key={b.head}>
              <p className="font-semibold text-primary/90">{b.head}</p>
              {b.lines.map((l) => (
                <p key={l} className="truncate text-foreground/80">
                  {l}
                </p>
              ))}
            </div>
          ))}
          {active ? (
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
          ) : null}
        </div>
      );

    case "voiceover":
      return (
        <div className="flex flex-1 flex-col justify-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.5_0.243_28)] font-mono text-[11px] font-bold text-white">
              EM
            </span>
            <span className="text-xs text-muted-foreground">Emma · en-US</span>
          </div>
          <div className={cn("flex h-9 items-center gap-[2px]", active && "animate-pulse")}>
            {WAVE.slice(0, 30).map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className={cn("flex-1 rounded-full", i < 12 ? "bg-primary" : "bg-primary/30")}
              />
            ))}
          </div>
        </div>
      );

    case "visuals":
      return (
        <div className="grid flex-1 grid-cols-3 gap-2">
          {VISUALS.slice(0, 6).map((v, i) => (
            <div
              key={v.name}
              style={active ? { animationDelay: `${i * 220}ms` } : undefined}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg ring-1 ring-border",
                active && "pipe-float",
              )}
            >
              <Image src={v.img} alt="" fill sizes="90px" className="object-cover" />
            </div>
          ))}
        </div>
      );

    case "captions":
      return (
        <div className="flex flex-1 flex-col justify-center gap-2">
          {CAPTIONS.slice(0, 3).map((c, i) => (
            <div key={c.time} className="flex items-start gap-2">
              <span className="mt-px font-mono text-[10px] text-muted-foreground/60">
                {c.time}
              </span>
              <p className="text-[11px] leading-snug text-foreground/80">
                {c.lead ?? null}
                <span className={cn("font-semibold text-primary", active && i === 0 && "animate-pulse")}>
                  {c.hl}
                </span>
                {c.tail}
              </p>
            </div>
          ))}
        </div>
      );

    case "upload":
      return (
        <div className="flex flex-1 flex-col justify-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex size-2 items-center justify-center">
              <span className={cn("size-2 rounded-full bg-emerald-500", active && "animate-pulse")} />
            </span>
            @blobgenai · 127.4K subs
          </div>
          {active ? (
            <span
              key="popped"
              className="pipe-pop inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white"
            >
              <Check className="size-3.5" strokeWidth={3} />
              Scheduled · May 24, 6:00 PM
            </span>
          ) : (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground dark:bg-background/50">
              May 24, 6:00 PM
            </span>
          )}
        </div>
      );
  }
}

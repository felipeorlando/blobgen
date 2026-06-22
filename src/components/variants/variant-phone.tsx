"use client";

import Image from "next/image";
import {
  Check,
  EllipsisVertical,
  MessageCircle,
  Play,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { LogoMark } from "@/components/icons";
import { cn } from "@/lib/utils";
import { STEPS, WAVE } from "./data";
import { useAutoAdvance } from "./use-auto-advance";

const DURATION = 2800;

// Per-step annotation that floats beside the phone, narrating the layer being
// added. Sides alternate so the eye ping-pongs as the Short assembles.
const CALLOUTS: { side: "left" | "right"; top: string; value: string }[] = [
  { side: "left", top: "24%", value: "Best AI tools for creators" },
  { side: "left", top: "40%", value: "Hook · Main · CTA, written" },
  { side: "right", top: "33%", value: "Emma (US) · friendly, energetic" },
  { side: "left", top: "28%", value: "5 b-roll clips matched to the script" },
  { side: "right", top: "22%", value: "Word-perfect captions, auto-timed" },
  { side: "right", top: "58%", value: "Scheduled · May 24, 6:00 PM" },
];

// Each layer fades + lifts into place; hidden layers ignore pointer events.
function reveal(on: boolean) {
  return cn(
    "transition-all duration-500 ease-out",
    on
      ? "opacity-100 translate-y-0 blur-0"
      : "opacity-0 translate-y-3 blur-[1px] pointer-events-none",
  );
}

export function VariantPhone() {
  const { active, setActive, paused, setPaused } = useAutoAdvance(
    STEPS.length,
    DURATION,
  );
  const ActiveIcon = STEPS[active].icon;
  const callout = CALLOUTS[active];
  const left = callout.side === "left";

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* segmented timeline */}
      <ol className="flex items-stretch gap-2 sm:gap-3">
        {STEPS.map((step, i) => {
          const passed = i < active;
          const isActive = i === active;
          return (
            <li key={step.id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setActive(i)}
                className="block w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors duration-300",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px] shadow-primary/15"
                        : passed
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-muted/50 text-muted-foreground dark:bg-background/50",
                    )}
                  >
                    {passed ? <Check className="size-3.5" strokeWidth={3} /> : step.n}
                  </span>
                  <span
                    className={cn(
                      "hidden truncate text-xs font-medium transition-colors sm:block",
                      isActive || passed
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.short}
                  </span>
                </div>
                <span className="mt-2 block h-1 overflow-hidden rounded-full bg-primary/15">
                  {passed ? (
                    <span className="block h-full w-full bg-primary" />
                  ) : isActive ? (
                    <span
                      key={active}
                      className="block h-full origin-left bg-primary"
                      style={{
                        animation: `pipe-fill ${DURATION}ms linear forwards`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* assembling phone on a workbench */}
      <div className="relative mt-12 flex min-h-[600px] justify-center">
        <div className="pipe-canvas pointer-events-none absolute inset-0" />

        {/* ambient device glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-6 left-1/2 h-10 w-52 -translate-x-1/2 rounded-[100%] bg-black/40 blur-2xl" />

        {/* floating step annotation */}
        <div
          key={`pill-${active}`}
          className="absolute left-2 top-0 z-10 hidden duration-500 animate-in fade-in-0 slide-in-from-left-3 sm:left-8 sm:block lg:left-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur card-surface">
            <ActiveIcon className="size-3.5 text-primary" />
            {STEPS[active].n}. {STEPS[active].label}
          </span>
        </div>

        {/* per-step callout filling the negative space */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div
            key={`call-${active}`}
            className={cn(
              "absolute w-56 duration-500 animate-in fade-in-0",
              left
                ? "right-1/2 mr-[172px] text-right slide-in-from-left-4"
                : "left-1/2 ml-[172px] slide-in-from-right-4",
            )}
            style={{ top: callout.top }}
          >
            <div className="relative rounded-xl border border-border bg-card/90 p-3 backdrop-blur card-surface">
              <p
                className={cn(
                  "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary",
                  left && "flex-row-reverse",
                )}
              >
                <ActiveIcon className="size-3" />
                {STEPS[active].label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-foreground/85">
                {callout.value}
              </p>
              {/* connector toward the phone */}
              <span
                className={cn(
                  "absolute top-1/2 h-px w-9 -translate-y-1/2 bg-gradient-to-r",
                  left
                    ? "left-full from-primary/70 to-transparent"
                    : "right-full from-transparent to-primary/70",
                )}
              />
              <span
                className={cn(
                  "absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_1px] shadow-primary/50",
                  left ? "left-[calc(100%+34px)]" : "right-[calc(100%+34px)]",
                )}
              />
            </div>
          </div>
        </div>

        <div className="relative aspect-[9/19] w-[280px] shrink-0 overflow-hidden rounded-[2.4rem] border-[6px] border-foreground/10 bg-[oklch(0.13_0.01_265)] shadow-2xl">
          {/* b-roll fades in at the Visuals step */}
          <Image
            src="/images/tech.jpg"
            alt="Generated YouTube Short preview"
            fill
            sizes="280px"
            className={cn(
              "object-cover transition-opacity duration-700",
              active >= 3 ? "opacity-100" : "opacity-0",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-black/85" />

          <div className="relative flex h-full flex-col p-3.5 text-white">
            <div className="flex items-center justify-end">
              <EllipsisVertical className="size-4" />
            </div>

            {/* topic brief */}
            <div
              className={cn(
                "absolute inset-x-4 top-1/2 -translate-y-1/2",
                reveal(active === 0),
              )}
            >
              <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wide text-white/60">
                  Topic
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Best AI tools for creators
                </p>
              </div>
            </div>

            {/* script teleprompter */}
            <div
              className={cn(
                "absolute inset-x-4 top-1/2 -translate-y-1/2",
                reveal(active === 1 || active === 2),
              )}
            >
              <div className="rounded-xl border border-white/15 bg-black/40 p-3 font-mono text-[10px] leading-relaxed backdrop-blur-sm">
                <p className="font-semibold text-primary">HOOK (0–2s)</p>
                <p className="text-white/85">
                  These AI tools will 10x your content workflow.
                </p>
                <p className="mt-1.5 font-semibold text-primary">MAIN</p>
                <p className="text-white/85">1. ChatGPT 2. Canva 3. Descript…</p>
              </div>
            </div>

            {/* captions */}
            <div
              className={cn(
                "mt-3 flex flex-col items-start gap-1.5",
                reveal(active >= 4),
              )}
            >
              <span className="-rotate-1 rounded bg-white px-2 py-1 text-[0.95rem] font-extrabold tracking-tight text-black shadow-md">
                Best AI tools
              </span>
              <span className="rotate-1 rounded bg-primary px-2 py-1 text-[0.95rem] font-extrabold tracking-tight text-primary-foreground shadow-md">
                for creators
              </span>
            </div>

            <div className="flex-1" />

            {/* waveform (recording) */}
            <div
              className={cn(
                "flex h-8 items-center gap-[2px]",
                reveal(active >= 2 && active < 5),
              )}
            >
              {WAVE.slice(0, 32).map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 rounded-full bg-white/80"
                />
              ))}
            </div>

            {/* finished footer */}
            <div className={cn("space-y-2.5", reveal(active >= 5))}>
              <div className="flex items-center gap-2">
                <LogoMark className="size-6 rounded-md" />
                <span className="text-xs font-semibold">@blobgenai</span>
                <span className="ml-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-black">
                  Subscribe
                </span>
              </div>
              <p className="text-[11px] leading-snug">
                Best AI tools for creators{" "}
                <span className="text-white/65">#aitools #creators</span>
              </p>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/25">
                <div className="h-full w-1/3 rounded-full bg-primary" />
              </div>
            </div>
          </div>

          {/* action rail */}
          <div
            className={cn(
              "absolute bottom-24 right-2.5 flex flex-col items-center gap-3 text-white",
              reveal(active >= 5),
            )}
          >
            {[
              { icon: ThumbsUp, label: "12K" },
              { icon: ThumbsDown, label: "Dislike" },
              { icon: MessageCircle, label: "143" },
              { icon: Share2, label: "Share" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="flex size-9 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm">
                  <Icon className="size-4" />
                </span>
                <span className="text-[9px] font-semibold">{label}</span>
              </div>
            ))}
          </div>

          {/* scheduled stamp */}
          <div
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              reveal(active === 5),
            )}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-bold text-white shadow-lg">
              <Check className="size-4" strokeWidth={3} />
              Scheduled
            </span>
          </div>

          {/* center play affordance, at the Visuals reveal */}
          <div
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              reveal(active === 3),
            )}
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <Play className="size-6 fill-white text-white" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { Check, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS, VISUALS, WAVE } from "./data";
import { useAutoAdvance } from "./use-auto-advance";

const DURATION = 3400;
const STAMPS = ["00:00", "00:03", "00:09", "00:14", "00:22", "00:27"];

export function VariantConsole() {
  const { active, setActive, paused, setPaused } = useAutoAdvance(
    STEPS.length,
    DURATION,
  );

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]"
    >
      {/* left: run log — dividers, no cards */}
      <div>
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Terminal className="size-3.5" />
          </span>
          <span className="font-mono text-xs font-medium text-foreground">
            build · short.mp4
          </span>
          <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
            {active + 1}/6
          </span>
        </div>

        <ol className="divide-y divide-border/70">
          {STEPS.map((step, i) => {
            const done = i < active;
            const running = i === active;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className="group flex w-full items-center gap-3 py-3 text-left transition-transform active:scale-[0.99]"
                >
                  <Status done={done} running={running} />
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground/50">
                    0{step.n}
                  </span>
                  <span
                    className={cn(
                      "flex-1 truncate font-mono text-[13px] transition-colors",
                      running
                        ? "font-semibold text-foreground"
                        : done
                          ? "text-foreground/65"
                          : "text-muted-foreground/55",
                    )}
                  >
                    {step.id.replace("upload", "upload-schedule")}
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground/55">
                    {done || running ? STAMPS[i] : "--:--"}
                  </span>
                </button>
                {running ? (
                  <div className="mb-3 h-0.5 overflow-hidden rounded-full bg-primary/15">
                    <div
                      key={active}
                      className="h-full origin-left bg-primary"
                      style={{
                        animation: `pipe-fill ${DURATION}ms linear forwards`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      {/* right: terminal output pane — always dark, like an editor */}
      <div className="overflow-hidden rounded-2xl border border-border shadow-[0_24px_50px_-20px_rgba(20,5,5,0.35)]">
        <div className="flex items-center gap-2 border-b border-white/10 bg-[oklch(0.2_0.006_265)] px-4 py-2.5">
          <span className="flex gap-1.5">
            <i className="size-2.5 rounded-full bg-white/15" />
            <i className="size-2.5 rounded-full bg-white/15" />
            <i className="size-2.5 rounded-full bg-white/15" />
          </span>
          <span className="ml-2 font-mono text-[11px] text-white/45">
            blobgen render · {STEPS[active].id}
          </span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            live
          </span>
        </div>
        <div className="min-h-[372px] bg-[oklch(0.145_0.006_265)] p-5 font-mono text-[12.5px] leading-relaxed text-white/85">
          <Output key={active} active={active} />
        </div>
      </div>
    </div>
  );
}

function Status({ done, running }: { done: boolean; running: boolean }) {
  if (done) {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (running) {
    return (
      <span className="size-5 shrink-0 animate-spin rounded-full bg-[conic-gradient(var(--primary)_0deg,transparent_280deg)] p-[2.5px]">
        <span className="block size-full rounded-full bg-background" />
      </span>
    );
  }
  return <span className="size-5 shrink-0 rounded-full border-2 border-border" />;
}

function Line({
  i,
  tone = "out",
  children,
}: {
  i: number;
  tone?: "cmd" | "dim" | "out" | "ok";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "cmd"
      ? "text-white"
      : tone === "dim"
        ? "text-white/45"
        : tone === "ok"
          ? "text-emerald-400"
          : "text-white/80";
  return (
    <p
      style={{ animationDelay: `${i * 95}ms` }}
      className={cn(
        "flex items-start gap-2 duration-300 animate-in fade-in-0 slide-in-from-left-2 [animation-fill-mode:both]",
        toneClass,
      )}
    >
      {tone === "ok" ? (
        <Check className="mt-[3px] size-3 shrink-0" strokeWidth={3} />
      ) : null}
      <span className="min-w-0">{children}</span>
    </p>
  );
}

function Output({ active }: { active: number }) {
  const id = STEPS[active].id;

  if (id === "topic") {
    return (
      <div className="space-y-1.5">
        <Line i={0} tone="cmd">
          $ blobgen new --topic{" "}
          <span className="text-primary">&quot;Best AI tools for creators&quot;</span>
        </Line>
        <Line i={1} tone="dim">resolving niche · matched 3 angles</Line>
        <Line i={2} tone="ok">topic locked · 27/120 chars</Line>
      </div>
    );
  }

  if (id === "script") {
    return (
      <div className="space-y-1.5">
        <Line i={0} tone="dim">drafting script · 31s read target</Line>
        <Line i={1}>
          <span className="text-primary">HOOK</span> These AI tools will 10x your
          workflow.
        </Line>
        <Line i={2}>
          <span className="text-primary">MAIN</span> 1. ChatGPT 2. Canva 3.
          Descript 4. Runway
        </Line>
        <Line i={3}>
          <span className="text-primary">CTA</span> Save this &amp; follow for
          more.
        </Line>
        <Line i={4} tone="ok">script ready · 142 words</Line>
      </div>
    );
  }

  if (id === "voiceover") {
    return (
      <div className="space-y-3">
        <Line i={0} tone="dim">synthesizing voice · emma · en-US</Line>
        <div
          style={{ animationDelay: "120ms" }}
          className="flex h-12 items-center gap-[2px] duration-500 animate-in fade-in-0 [animation-fill-mode:both]"
        >
          {WAVE.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className={cn(
                "flex-1 rounded-full",
                i < 16 ? "bg-primary" : "bg-primary/30",
              )}
            />
          ))}
        </div>
        <Line i={3} tone="ok">voiceover rendered · 0:31</Line>
      </div>
    );
  }

  if (id === "visuals") {
    return (
      <div className="space-y-3">
        <Line i={0} tone="dim">matching b-roll · 5 scenes · 1080×1920</Line>
        <div
          style={{ animationDelay: "120ms" }}
          className="grid grid-cols-5 gap-2 duration-500 animate-in fade-in-0 [animation-fill-mode:both]"
        >
          {VISUALS.map((v) => (
            <div
              key={v.name}
              className="relative aspect-square overflow-hidden rounded-md ring-1 ring-white/10"
            >
              <Image src={v.img} alt="" fill sizes="80px" className="object-cover" />
              <span className="absolute bottom-0.5 left-0.5 rounded bg-black/70 px-1 font-mono text-[8px] text-white/90">
                {v.tag}
              </span>
            </div>
          ))}
        </div>
        <Line i={4} tone="ok">visuals composited · 5 clips</Line>
      </div>
    );
  }

  if (id === "captions") {
    return (
      <div className="space-y-1.5">
        <Line i={0} tone="dim">transcribing · word-level timing</Line>
        <Line i={1}>
          <span className="text-white/45">00:00</span> These{" "}
          <span className="text-primary">AI tools</span> will 10x your workflow.
        </Line>
        <Line i={2}>
          <span className="text-white/45">00:06</span>{" "}
          <span className="text-primary">Canva</span> · stunning designs in
          seconds.
        </Line>
        <Line i={3} tone="ok">captions burned in · 142 words synced</Line>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Line i={0} tone="dim">connecting · youtube @blobgenai</Line>
      <Line i={1}>
        visibility=<span className="text-primary">public</span>{" "}
        schedule=2025-05-24T18:00
      </Line>
      <Line i={2} tone="ok">scheduled · publishes automatically</Line>
    </div>
  );
}

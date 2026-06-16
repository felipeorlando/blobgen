"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getChannel } from "@/lib/studio";
import { buildAnalysis } from "@/lib/onboarding";
import { useOnboarding } from "../onboarding-context";

type Phase = "scan" | "stream" | "done";

export function AnalyzeStep() {
  const { state, set } = useOnboarding();
  const channelId = state.selectedChannelId ?? "";
  const channel = getChannel(channelId);
  const analysis = buildAnalysis(channelId);
  const lines = analysis.lines;

  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(() =>
    state.analysisDone ? "done" : "scan",
  );
  const [blockIndex, setBlockIndex] = useState(() =>
    state.analysisDone ? lines.length : 0,
  );

  // Scanning → streaming.
  useEffect(() => {
    if (phase !== "scan") return;
    const t = setTimeout(() => setPhase("stream"), reduce ? 200 : 1300);
    return () => clearTimeout(t);
  }, [phase, reduce]);

  function handleBlockDone() {
    const next = blockIndex + 1;
    if (next >= lines.length) {
      setPhase("done");
      set({
        analysisDone: true,
        analysisSummary: state.analysisSummary || analysis.summary,
      });
    } else {
      setBlockIndex(next);
    }
  }

  return (
    <div className="space-y-4">
      {/* AI header */}
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-inset ring-primary/25">
          <Sparkles className="size-4" />
        </span>
        <div>
          <p className="text-[0.84rem] font-semibold text-foreground">blobgen AI</p>
          <p className="text-[0.72rem] text-muted-foreground">
            {phase === "done"
              ? "Analysis complete"
              : `Reading ${channel.handle}`}
          </p>
        </div>
        {phase === "done" ? (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[0.72rem] font-semibold text-emerald-500">
            <Check className="size-3.5" strokeWidth={3} />
            Done
          </span>
        ) : null}
      </div>

      {/* Scanning videos */}
      {phase === "scan" ? (
        <div className="rounded-2xl border border-border bg-card p-4 card-surface">
          <p className="mb-3 text-[0.82rem] font-medium text-muted-foreground">
            Reading {analysis.videoCount} videos…
          </p>
          <div className="flex gap-2 overflow-hidden">
            {channel.thumbs.slice(0, 6).map((src, i) => (
              <span
                key={src + i}
                className="relative aspect-square w-full overflow-hidden rounded-lg ring-1 ring-inset ring-border"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <Image src={src} alt="" fill sizes="60px" className="object-cover" />
                <span className="pipe-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4 card-surface">
          <div className="space-y-2.5">
            {lines.map((line, i) => {
              if (i > blockIndex) return null;
              const isCurrent = i === blockIndex && phase === "stream";
              return (
                <p
                  key={i}
                  className={cn(
                    "text-[0.9rem] leading-relaxed text-foreground",
                    i === 0 && "font-medium",
                  )}
                >
                  {isCurrent ? (
                    <Typewriter text={line} onDone={handleBlockDone} />
                  ) : (
                    line
                  )}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Editable summary */}
      {phase === "done" ? (
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
          <label className="block">
            <span className="mb-1.5 block text-[0.8rem] font-medium text-foreground">
              Channel summary{" "}
              <span className="font-normal text-muted-foreground">
                — edit if anything&apos;s off
              </span>
            </span>
            <textarea
              value={state.analysisSummary}
              onChange={(e) => set({ analysisSummary: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-xl border border-input bg-card p-3 text-[0.9rem] leading-relaxed text-foreground outline-none transition-colors focus:border-primary/60 focus:ring-3 focus:ring-ring/40"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Typewriter({
  text,
  speed = 16,
  onDone,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
}) {
  const [n, setN] = useState(0);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = setTimeout(() => {
        setN(text.length);
        doneRef.current?.();
      }, 80);
      return () => clearTimeout(t);
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) {
        clearInterval(id);
        doneRef.current?.();
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <>
      {text.slice(0, n)}
      {n < text.length ? (
        <span className="pipe-caret text-primary" aria-hidden />
      ) : null}
    </>
  );
}

function useReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

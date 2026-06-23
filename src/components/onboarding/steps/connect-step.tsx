"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, Loader2, Plus, ShieldCheck } from "lucide-react";
import { YouTubeIcon } from "@/components/icons";
import { Reveal } from "@/components/studio/reveal";
import { cn } from "@/lib/utils";
import { compact } from "@/lib/studio";
import { DETECTED_CHANNELS, NEW_CHANNEL_ID } from "@/lib/onboarding";
import { useOnboarding } from "../onboarding-context";

type Status = "idle" | "connecting" | "connected";

export function ConnectStep() {
  const { state, set } = useOnboarding();
  const [status, setStatus] = useState<Status>(
    state.connected ? "connected" : "idle",
  );
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function connect() {
    setStatus("connecting");
    timer.current = setTimeout(() => {
      setStatus("connected");
      set({ connected: true });
    }, 1500);
  }

  // Switching the chosen channel resets anything derived from it.
  function pick(id: string) {
    if (id === state.selectedChannelId) return;
    set({
      selectedChannelId: id,
      analysisDone: false,
      analysisSummary: "",
      competitorIds: [],
    });
  }

  if (status !== "connected") {
    return (
      <div className="space-y-4">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border bg-card card-surface">
            <div className="flex items-center gap-3 border-b border-border bg-[oklch(0.06_0.01_265)] px-5 py-4 dark:bg-black/30">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white">
                <YouTubeIcon className="size-6 text-[#FF0000]" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.92rem] font-semibold text-white">YouTube</p>
                <p className="text-[0.78rem] text-white/55">
                  Import your channels &amp; analytics
                </p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-[0.88rem] leading-relaxed text-muted-foreground">
                Link your account so blobgen can read your channels, then upload
                and schedule on your behalf.
              </p>
              <button
                type="button"
                onClick={connect}
                disabled={status === "connecting"}
                className="glow-accent mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[0.88rem] font-semibold text-primary-foreground transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary/90 active:scale-[0.99] disabled:opacity-80 motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                {status === "connecting" ? (
                  <>
                    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <YouTubeIcon className="size-4" />
                    Connect YouTube account
                  </>
                )}
              </button>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <p className="flex items-center justify-center gap-2 text-center text-[0.78rem] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            Read &amp; upload access only. Revoke anytime.
          </p>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <Reveal>
        <p className="text-[0.8rem] font-medium text-foreground">
          {DETECTED_CHANNELS.length} channels found on your account
        </p>
      </Reveal>

      {DETECTED_CHANNELS.map((c, i) => {
        const active = state.selectedChannelId === c.id;
        return (
          <Reveal key={c.id} delay={40 + i * 45}>
            <button
              type="button"
              onClick={() => pick(c.id)}
              aria-pressed={active}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] motion-reduce:active:scale-100",
                active
                  ? "border-primary/60 bg-primary/[0.06] shadow-[0_0_40px_-22px_var(--primary)]"
                  : "border-border bg-card hover:border-foreground/20 hover:bg-muted/40",
              )}
            >
              <span className="relative size-11 shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-border">
                <Image src={c.image} alt="" fill sizes="44px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.9rem] font-semibold text-foreground">
                  {c.name}
                </span>
                <span className="block truncate text-[0.78rem] text-muted-foreground">
                  {c.handle} · {compact(c.subscribers)} subscribers
                </span>
              </span>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
              >
                {active ? <Check className="size-3" strokeWidth={3} /> : null}
              </span>
            </button>
          </Reveal>
        );
      })}

      {/* Start a new channel */}
      <Reveal delay={40 + DETECTED_CHANNELS.length * 45}>
        <button
          type="button"
          onClick={() => pick(NEW_CHANNEL_ID)}
          aria-pressed={state.selectedChannelId === NEW_CHANNEL_ID}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left transition-all duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            state.selectedChannelId === NEW_CHANNEL_ID
              ? "border-primary/60 bg-primary/[0.06]"
              : "border-border bg-card hover:border-foreground/20",
          )}
        >
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors",
              state.selectedChannelId === NEW_CHANNEL_ID
                ? "border-primary/40 bg-primary/12 text-primary"
                : "border-border bg-secondary text-muted-foreground",
            )}
          >
            <Plus className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.9rem] font-semibold text-foreground">
              Start a new channel
            </span>
            <span className="block text-[0.78rem] text-muted-foreground">
              No videos yet — you&apos;ll describe what it&apos;s about
            </span>
          </span>
        </button>
      </Reveal>
    </div>
  );
}

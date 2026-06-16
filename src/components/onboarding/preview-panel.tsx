"use client";
import Image from "next/image";
import { Sparkles, Users } from "lucide-react";
import { YouTubeIcon } from "@/components/icons";
import { Reveal } from "@/components/studio/reveal";
import { compact, getChannel } from "@/lib/studio";
import {
  buildAnalysis,
  DETECTED_CHANNELS,
  getCompetitor,
  type WizardStepId,
} from "@/lib/onboarding";
import { useOnboarding } from "./onboarding-context";
export function PreviewPanel({ step }: { step: WizardStepId }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(80% 60% at 50% 0%, oklch(0.617 0.243 26 / 0.12), transparent 70%)",
        }}
      />
      <div aria-hidden className="pipe-canvas pointer-events-none absolute inset-0" />
      <div className="relative flex items-center gap-2 px-7 pt-7">
        <span className="size-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Live preview
        </p>
      </div>
      <div className="relative flex flex-1 items-center justify-center p-7">
        <div
          key={step}
          className="w-full animate-in fade-in-0 zoom-in-95 duration-500 motion-reduce:animate-none"
        >
          {step === "connect" ? <ConnectPreview /> : null}
          {step === "channel" ? <ChannelPreview /> : null}
          {step === "competitors" ? <CompetitorsPreview /> : null}
        </div>
      </div>
    </div>
  );
}
/* -------------------------------------------------------------------------- */
function ChannelCard({
  avatar,
  name,
  meta,
}: {
  avatar: string;
  name: string;
  meta: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="relative h-20">
        {avatar ? (
          <Image src={avatar} alt="" fill sizes="400px" className="object-cover opacity-60" />
        ) : (
          <div className="size-full bg-white/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <div className="px-5 pb-5">
        <div className="-mt-8">
          <span className="relative block size-[60px] overflow-hidden rounded-full ring-4 ring-black/40">
            {avatar ? (
              <Image src={avatar} alt="" fill sizes="60px" className="object-cover" />
            ) : (
              <span className="block size-full bg-white/10" />
            )}
          </span>
        </div>
        <h3 className="mt-3 truncate text-xl font-bold tracking-tight text-white">
          {name}
        </h3>
        <p className="mt-0.5 truncate text-[0.82rem] text-white/55">{meta}</p>
      </div>
    </div>
  );
}
/* -------------------------------------------------------------------------- */
function ConnectPreview() {
  const { state, isNew } = useOnboarding();
  if (!state.connected) {
    return (
      <div className="mx-auto max-w-sm">
        <div className="flex items-center justify-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-black/40">
            <span className="text-lg font-bold text-white">b</span>
          </div>
          <div className="h-px w-16 bg-white/15" />
          <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-black/40">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white">
              <YouTubeIcon className="size-5 text-[#FF0000]" />
            </span>
          </div>
        </div>
        <p className="mt-6 text-center text-[0.88rem] text-white/55">
          Connect to import your channels
        </p>
      </div>
    );
  }
  if (!state.selectedChannelId) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <div className="flex justify-center -space-x-3">
          {DETECTED_CHANNELS.map((c) => (
            <span
              key={c.id}
              className="size-12 overflow-hidden rounded-full ring-2 ring-[oklch(0.06_0.01_25)]"
            >
              <Image src={c.image} alt="" width={48} height={48} className="size-full object-cover" />
            </span>
          ))}
        </div>
        <p className="mt-5 text-[0.88rem] text-white/55">
          {DETECTED_CHANNELS.length} channels found — choose one to run
        </p>
      </div>
    );
  }
  if (isNew) {
    return (
      <div className="mx-auto max-w-sm">
        <ChannelCard avatar="" name="New channel" meta="Starting from scratch" />
        <p className="mt-3 text-center text-[0.76rem] text-muted-foreground">
          You&apos;ll describe it on the next step.
        </p>
      </div>
    );
  }
  const channel = getChannel(state.selectedChannelId);
  return (
    <div className="mx-auto max-w-sm">
      <ChannelCard
        avatar={channel.image}
        name={channel.name}
        meta={`${channel.handle} · ${compact(channel.subscribers)} subscribers`}
      />
      <p className="mt-3 text-center text-[0.76rem] text-muted-foreground">
        blobgen will read this channel next.
      </p>
    </div>
  );
}
/* -------------------------------------------------------------------------- */
function ChannelPreview() {
  const { state, isNew } = useOnboarding();
  if (isNew) {
    const name = state.newName.trim() || "Your channel";
    return (
      <div className="mx-auto max-w-sm">
        <ChannelCard
          avatar={state.newAvatar}
          name={name}
          meta={`@${state.newHandle || "yourchannel"} · brand new`}
        />
        {state.newAbout.trim() ? (
          <p className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-[0.8rem] leading-relaxed text-white/70">
            {state.newAbout.trim()}
          </p>
        ) : (
          <p className="mt-3 text-center text-[0.76rem] text-muted-foreground">
            Describe it and watch the brief take shape.
          </p>
        )}
      </div>
    );
  }
  const channel = getChannel(state.selectedChannelId ?? "");
  const analysis = buildAnalysis(state.selectedChannelId ?? "");
  return (
    <div className="mx-auto max-w-sm">
      <ChannelCard
        avatar={channel.image}
        name={channel.name}
        meta={`${channel.handle} · ${compact(channel.subscribers)} subscribers`}
      />
      <Reveal delay={250} className="mt-4">
        <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/40">
          Content pillars
        </p>
        <div className="flex flex-wrap gap-1.5">
          {analysis.pillars.map((p, i) => (
            <span
              key={p}
              className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[0.72rem] font-medium text-primary animate-in fade-in-0 zoom-in-95 fill-mode-both"
              style={{ animationDelay: `${350 + i * 120}ms` }}
            >
              {p}
            </span>
          ))}
        </div>
      </Reveal>
      <Reveal delay={700} className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Audience" value={analysis.audienceAge} />
        <Stat label="Top region" value={analysis.topCountry.split(" ")[0]} />
        <Stat label="Shorts" value={`${analysis.shortsPct}%`} />
      </Reveal>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
      <p className="text-[0.62rem] font-medium uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[0.84rem] font-semibold text-white">{value}</p>
    </div>
  );
}
/* -------------------------------------------------------------------------- */
function CompetitorsPreview() {
  const { state } = useOnboarding();
  const selected = state.competitorIds
    .map((id) => getCompetitor(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const max = Math.max(1, ...selected.map((c) => c.subscribers));
  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-white">
          <Users className="size-4 text-primary" />
          <p className="text-[0.82rem] font-semibold">Your competitive set</p>
        </div>
        {selected.length ? (
          <div className="mt-4 space-y-2.5">
            {selected.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center gap-2.5">
                <span className="relative size-7 shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-white/15">
                  <Image src={c.avatar} alt="" fill sizes="28px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[0.78rem] font-medium text-white/85">
                      {c.name}
                    </span>
                    <span className="shrink-0 text-[0.68rem] tabular-nums text-white/45">
                      {compact(c.subscribers)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${Math.round((c.subscribers / max) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-[0.82rem] text-white/50">
            Pick a few channels to benchmark against.
          </p>
        )}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[0.76rem] text-muted-foreground">
        <Sparkles className="size-3 text-primary" />
        We&apos;ll surface gaps you can win.
      </p>
    </div>
  );
}

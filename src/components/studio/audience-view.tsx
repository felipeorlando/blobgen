"use client";

import Image from "next/image";
import {
  Calendar,
  ChevronDown,
  Clock,
  Globe,
  MonitorSmartphone,
  Repeat,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { compact, getAudience, signed } from "@/lib/studio";
import { StudioTopbar } from "./studio-topbar";
import { BarList } from "./bar-list";
import { AreaTrend } from "./area-trend";
import { useStudio } from "./studio-context";

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="card-surface rounded-lg border border-border p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-[1.7rem] font-bold leading-none tracking-tight tabular-nums">
        {value}
      </p>
      {sub ? <p className="mt-2 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function RatioDonut({ returning }: { returning: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const len = (returning / 100) * c;
  return (
    <div className="card-surface rounded-lg border border-border p-5">
      <div className="flex items-center gap-2">
        <Repeat className="size-4 text-muted-foreground" />
        <h2 className="text-base font-semibold tracking-tight">
          New vs returning
        </h2>
      </div>
      <div className="mt-2 flex items-center gap-5">
        <div className="relative size-[116px] shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="var(--muted)"
              strokeWidth={14}
            />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={`${len} ${c - len}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular-nums">{returning}%</span>
            <span className="text-[0.62rem] text-muted-foreground">
              Returning
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span className="size-2.5 rounded-full bg-primary" />
              Returning
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {returning}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span className="size-2.5 rounded-full bg-muted-foreground/40" />
              New
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {100 - returning}%
            </span>
          </div>
          <p className="pt-1 text-xs leading-relaxed text-muted-foreground">
            A steady base of viewers comes back for the next upload.
          </p>
        </div>
      </div>
    </div>
  );
}

const LEVEL: Record<number, string> = {
  0: "bg-muted",
  1: "bg-primary/25",
  2: "bg-primary/45",
  3: "bg-primary/70",
  4: "bg-primary",
};
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function OnlineTimes({ data }: { data: number[][] }) {
  return (
    <div className="card-surface rounded-lg border border-border p-5">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <h2 className="text-base font-semibold tracking-tight">
          When your viewers are online
        </h2>
      </div>

      <div className="mt-4 flex gap-2">
        <div className="flex flex-col justify-between py-0.5">
          {DAYS.map((d, i) => (
            <span
              key={i}
              className="font-mono text-[0.6rem] leading-none text-muted-foreground/70"
            >
              {d}
            </span>
          ))}
        </div>
        <div className="flex-1">
          <div className="grid grid-rows-7 gap-1.5">
            {data.map((row, ri) => (
              <div key={ri} className="grid grid-cols-12 gap-1.5">
                {row.map((lvl, ci) => (
                  <div
                    key={ci}
                    title={`${lvl} active`}
                    className={cn(
                      "aspect-square rounded-[3px] ring-1 ring-inset ring-black/5 dark:ring-white/5",
                      LEVEL[lvl],
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[0.58rem] text-muted-foreground/60">
            <span>12a</span>
            <span>6a</span>
            <span>12p</span>
            <span>6p</span>
            <span>11p</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AudienceView() {
  const { channel, channelId } = useStudio();
  const a = getAudience(channelId);

  return (
    <>
      <StudioTopbar title="Audience" subtitle={channel.handle}>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
        >
          <Calendar className="size-4 text-muted-foreground" />
          Last 28 days
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </StudioTopbar>

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8">
        {/* Identity */}
        <div className="mb-7 flex items-center gap-3.5">
          <Image
            src={channel.image}
            alt=""
            width={56}
            height={56}
            className="size-12 rounded-lg object-cover ring-1 ring-inset ring-black/10 sm:size-14 dark:ring-white/10"
          />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
              {channel.name}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {channel.handle} · {compact(channel.subscribers)} subscribers
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            label="Subscribers"
            value={compact(a.subscribers)}
            sub={
              <span className="text-emerald-600 dark:text-emerald-400">
                {signed(a.subsGained, "")} this month
              </span>
            }
          />
          <Stat
            label="Unique viewers"
            value={compact(a.uniqueViewers)}
            sub="Last 28 days"
          />
          <Stat
            label="Avg. view duration"
            value={a.avgViewLabel}
            sub="Per view"
          />
          <Stat
            label="Returning rate"
            value={`${a.returningRate}%`}
            sub="Viewers who came back"
          />
        </div>

        {/* Growth + split */}
        <div className="mt-5 grid items-start gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AreaTrend data={a.subscriberTrend} gained={a.subsGained} />
          </div>
          <RatioDonut returning={a.returningRate} />
        </div>

        {/* Demographics */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <BarList
            title="Age"
            icon={Users}
            rows={a.age.map((x) => ({ label: x.label, value: x.pct }))}
          />
          <BarList
            title="Top countries"
            icon={Globe}
            rows={a.countries.map((x) => ({ label: x.country, value: x.pct }))}
          />
          <BarList
            title="Devices"
            icon={MonitorSmartphone}
            rows={a.devices.map((x) => ({ label: x.label, value: x.pct }))}
          />
        </div>

        {/* Online times */}
        <div className="mt-4">
          <OnlineTimes data={a.online} />
        </div>
      </div>
    </>
  );
}

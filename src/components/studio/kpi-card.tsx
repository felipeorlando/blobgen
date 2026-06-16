"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { signed, type Kpi } from "@/lib/studio";

/** Lightweight inline sparkline. Inherits color from `currentColor`. */
export function Sparkline({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  const n = data.length;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map<[number, number]>((v, i) => [
    (i / (n - 1)) * 100,
    100 - ((v - min) / range) * 92 - 4,
  ]);
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function KpiCard({ kpi, index = 0 }: { kpi: Kpi; index?: number }) {
  const up = kpi.delta >= 0;
  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="card-surface animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500 rounded-lg border border-border p-4 motion-reduce:animate-none"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[0.68rem] font-semibold tabular-nums",
            up
              ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/12 text-rose-600 dark:text-rose-400",
          )}
        >
          {up ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {signed(kpi.delta)}
        </span>
      </div>
      <p className="mt-2 text-[1.7rem] font-bold leading-none tracking-tight tabular-nums">
        {kpi.value}
      </p>
      <div
        className={cn(
          "mt-3 h-8",
          up ? "text-emerald-500/70" : "text-rose-500/70",
        )}
      >
        <Sparkline data={kpi.spark} />
      </div>
    </div>
  );
}

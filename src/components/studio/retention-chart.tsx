"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

const PAD_TOP = 8;
const PAD_BOTTOM = 10;
const PLOT = 100 - PAD_TOP - PAD_BOTTOM;

/** value (0..100 %) -> y in the 0..100 viewBox space */
const toY = (v: number) => PAD_TOP + (1 - v / 100) * PLOT;
const toX = (i: number, n: number) => (i / (n - 1)) * 100;

/** Catmull-Rom -> cubic bezier; smooth curve passing through every point. */
function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return "";
  const d = [`M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(
      `C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`,
    );
  }
  return d.join(" ");
}

const GRID = [25, 50, 75, 100];

export function RetentionChart({
  curve,
  title,
  average,
}: {
  curve: number[];
  title: string;
  average: number;
}) {
  const gradientId = useId();
  const n = curve.length;
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus the scrubber on the steepest drop-off: the most actionable moment.
  const focusIndex = useMemo(() => {
    let idx = Math.min(1, curve.length - 1);
    let worst = -Infinity;
    for (let i = 1; i < curve.length; i++) {
      const drop = curve[i - 1] - curve[i];
      if (drop > worst) {
        worst = drop;
        idx = i;
      }
    }
    return idx;
  }, [curve]);
  const [hover, setHover] = useState<number>(focusIndex);

  // Reset the scrubber whenever the curve changes (video switch).
  useEffect(() => setHover(focusIndex), [focusIndex]);

  const { linePath, areaPath } = useMemo(() => {
    const points = curve.map<[number, number]>((v, i) => [toX(i, n), toY(v)]);
    const line = smoothPath(points);
    const area = `${line} L 100 ${toY(0)} L 0 ${toY(0)} Z`;
    return { linePath: line, areaPath: area };
  }, [curve, n]);

  function onMove(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    setHover(Math.round(ratio * (n - 1)));
  }

  const hx = toX(hover, n);
  const hy = toY(curve[hover]);
  const lowRetention = curve[hover] < 40;

  return (
    <div className="card-surface rounded-lg border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h2 className="text-base font-semibold tracking-tight">
              Audience retention
            </h2>
          </div>
          <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
            {title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums">
            Avg{" "}
            <span className="font-semibold text-foreground">{average}%</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[0.68rem] font-semibold text-amber-600 dark:text-amber-400">
            Simulated
          </span>
        </div>
      </div>

      {/* Plot */}
      <div
        ref={containerRef}
        className="relative mt-4 h-[230px] w-full touch-none select-none sm:h-[280px]"
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerDown={(e) => onMove(e.clientX)}
        role="img"
        aria-label={`Retention curve, average ${average} percent`}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.34 }} />
              <stop offset="60%" style={{ stopColor: "var(--primary)", stopOpacity: 0.08 }} />
              <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {/* gridlines */}
          {GRID.map((g) => (
            <line
              key={g}
              x1={0}
              x2={100}
              y1={toY(g)}
              y2={toY(g)}
              stroke="var(--border)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* area + line */}
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path
            d={linePath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* hover guide */}
          <line
            x1={hx}
            x2={hx}
            y1={PAD_TOP}
            y2={toY(0)}
            stroke="var(--primary)"
            strokeWidth={1}
            strokeDasharray="3 3"
            strokeOpacity={0.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Y axis labels */}
        <div className="pointer-events-none absolute inset-0">
          {GRID.map((g) => (
            <span
              key={g}
              style={{ top: `${toY(g)}%` }}
              className="absolute left-0 -translate-y-1/2 bg-card/70 pr-1 font-mono text-[0.6rem] text-muted-foreground/70"
            >
              {g}%
            </span>
          ))}
        </div>

        {/* hover dot */}
        <div
          style={{ left: `${hx}%`, top: `${hy}%` }}
          className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_22%,transparent)]"
        />

        {/* tooltip */}
        <div
          style={{ left: `${clamp(hx, 12, 88)}%`, top: `${hy}%` }}
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap rounded-md border border-border bg-popover px-3 py-2 text-center shadow-md"
        >
          <p className="text-sm font-bold tabular-nums text-foreground">
            {curve[hover]}%
          </p>
          <p className="font-mono text-[0.62rem] text-muted-foreground tabular-nums">
            at {Math.round((hover / (n - 1)) * 100)}% watched
          </p>
        </div>
      </div>

      {/* X axis */}
      <div className="mt-2 flex justify-between px-1 font-mono text-[0.62rem] text-muted-foreground/70">
        {[0, 25, 50, 75, 100].map((t) => (
          <span key={t}>{t}%</span>
        ))}
      </div>

      <p
        className={cn(
          "mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs",
          lowRetention
            ? "bg-rose-500/8 text-rose-600 dark:text-rose-400"
            : "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400",
        )}
      >
        <span className="font-semibold">
          {lowRetention ? "Drop-off point" : "Healthy retention"}
        </span>
        <span className="text-muted-foreground">
          {lowRetention
            ? `Viewers are leaving around ${Math.round((hover / (n - 1)) * 100)}% watched.`
            : `Holding ${curve[hover]}% of viewers at this point.`}
        </span>
      </p>
    </div>
  );
}

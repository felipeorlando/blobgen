import { useId } from "react";
import { TrendingUp } from "lucide-react";
import { compact } from "@/lib/studio";

const PAD = 8;

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

/** Subscriber-growth area chart. Brand red, no scrubber — quiet and legible. */
export function AreaTrend({
  data,
  gained,
}: {
  data: number[];
  gained: number;
}) {
  const gid = useId();
  const n = data.length;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const toX = (i: number) => (i / (n - 1)) * 100;
  const toY = (v: number) => PAD + (1 - (v - min) / range) * (100 - PAD * 2);

  const points = data.map<[number, number]>((v, i) => [toX(i), toY(v)]);
  const line = smoothPath(points);
  const area = `${line} L 100 100 L 0 100 Z`;
  const last = points[points.length - 1];

  return (
    <div className="card-surface rounded-lg border border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <h2 className="text-base font-semibold tracking-tight">
            Subscriber growth
          </h2>
        </div>
        <span className="rounded-md bg-emerald-500/12 px-2 py-1 text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          +{compact(gained)} this month
        </span>
      </div>

      <div className="relative mt-4 h-[180px] w-full sm:h-[200px]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.28 }} />
              <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gid})`} />
          <path
            d={line}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          style={{ left: `${last[0]}%`, top: `${last[1]}%` }}
          className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary"
        />
      </div>
    </div>
  );
}

import { PieChart } from "lucide-react";

export function FormatSplit({
  shorts,
  long,
}: {
  shorts: number;
  long: number;
}) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const shortsLen = (shorts / 100) * c;

  return (
    <div className="card-surface rounded-lg border border-border p-5">
      <div className="flex items-center gap-2">
        <PieChart className="size-4 text-muted-foreground" />
        <h2 className="text-base font-semibold tracking-tight">Format mix</h2>
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
              strokeDasharray={`${shortsLen} ${c - shortsLen}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular-nums">{shorts}%</span>
            <span className="text-[0.62rem] text-muted-foreground">Shorts</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <span className="size-2.5 rounded-full bg-primary" />
              Shorts
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {shorts}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <span className="size-2.5 rounded-full bg-muted-foreground/40" />
              Long-form
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {long}%
            </span>
          </div>
          <p className="pt-1 text-xs leading-relaxed text-muted-foreground">
            Shorts drive most of your reach. Long-form keeps watch time
            climbing.
          </p>
        </div>
      </div>
    </div>
  );
}

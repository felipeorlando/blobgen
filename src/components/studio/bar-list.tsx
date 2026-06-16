import type { LucideIcon } from "lucide-react";

export type BarRow = { label: string; value: number };

/**
 * Compact horizontal bar list for demographic breakdowns. Bars are monochrome
 * so the brand red stays reserved for the page's few real highlights.
 */
export function BarList({
  title,
  icon: Icon,
  rows,
  suffix = "%",
}: {
  title: string;
  icon: LucideIcon;
  rows: BarRow[];
  suffix?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="card-surface rounded-lg border border-border p-5">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="truncate text-foreground">{r.label}</span>
              <span className="ml-3 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                {r.value}
                {suffix}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/70"
                style={{ width: `${(r.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

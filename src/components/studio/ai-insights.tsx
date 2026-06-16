import { Lightbulb, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChannelAnalytics } from "@/lib/studio";

const SENTIMENT: Record<
  ChannelAnalytics["insight"]["sentiment"],
  string
> = {
  Excellent: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  Strong: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  Watch: "bg-amber-500/14 text-amber-600 dark:text-amber-400",
};

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function AiInsights({ analytics }: { analytics: ChannelAnalytics }) {
  const { insight, grade } = analytics;
  return (
    <div className="card-surface rounded-lg border border-border p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            <Sparkles className="size-4 text-primary" />
          </span>
          <h2 className="text-base font-semibold tracking-tight">AI insights</h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[0.68rem] font-semibold text-amber-600 dark:text-amber-400">
          Simulated
        </span>
      </div>

      <h3 className="relative mt-4 text-[0.95rem] font-semibold leading-snug text-foreground">
        {insight.headline}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
        {insight.body}
      </p>

      <div className="relative mt-3 divide-y divide-border/70">
        <Row label="Overall performance">
          <span
            className={cn(
              "rounded-md px-2.5 py-0.5 text-xs font-semibold",
              SENTIMENT[insight.sentiment],
            )}
          >
            {insight.sentiment}
          </span>
        </Row>
        <Row label="Best element">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Lightbulb className="size-3" />
            {insight.bestElement}
          </span>
        </Row>
        <Row label="Recommended action">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
            <Target className="size-3" />
            {insight.action}
          </span>
        </Row>
        <Row label="Overall grade">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/15 font-mono text-sm font-bold text-primary">
            {grade}
          </span>
        </Row>
      </div>
    </div>
  );
}

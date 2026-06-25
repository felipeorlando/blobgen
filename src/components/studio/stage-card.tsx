"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Lock,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { approveStageAction, rejectStageAction } from "@/server/actions/pipeline";
import type { AssetView, StageRunView } from "@/hooks/use-project-poll";
import { CutsOutput } from "./cuts-output";
import { DistributionOutput } from "./distribution-output";
import { ProductionOutput } from "./production-output";
import { ResearchOutput } from "./research-output";
import { ScriptOutput } from "./script-output";

const STATUS: Record<
  string,
  { label: string; cls: string; icon: typeof Clock; spin?: boolean }
> = {
  pending: { label: "Pending", cls: "bg-muted text-muted-foreground", icon: Clock },
  queued: {
    label: "Queued",
    cls: "bg-amber-500/14 text-amber-600 dark:text-amber-400",
    icon: Loader2,
    spin: true,
  },
  running: {
    label: "Running",
    cls: "bg-amber-500/14 text-amber-600 dark:text-amber-400",
    icon: Loader2,
    spin: true,
  },
  awaiting_approval: {
    label: "Needs review",
    cls: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
    icon: Eye,
  },
  done: {
    label: "Done",
    cls: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    cls: "bg-destructive/12 text-destructive",
    icon: X,
  },
};

interface MaterialsData {
  materials?: { url?: string; thumb?: string; meta?: { alt?: string } }[];
}
interface StoryboardData {
  shots?: { timecode?: string; line?: string; materialThumb?: string }[];
}

function StageOutput({
  stage,
  asset,
}: {
  stage: StageRunView;
  asset?: AssetView;
}) {
  const stub = (stage.output as { stub?: boolean } | null)?.stub;
  if (stub) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="size-3.5" />
        Not implemented yet — approve to continue down the pipeline.
      </p>
    );
  }
  if (stage.status === "pending" || stage.status === "queued" || stage.status === "running") {
    return (
      <p className="text-sm text-muted-foreground">
        {stage.status === "pending" ? "Waiting for earlier stages…" : "Working…"}
      </p>
    );
  }
  // Production and Distribution render from their aggregate stage.output (not a single asset).
  if (stage.stageKey === "production") {
    return <ProductionOutput output={stage.output} />;
  }
  if (stage.stageKey === "distribution") {
    return <DistributionOutput output={stage.output} />;
  }
  if (!asset) return null;

  switch (stage.stageKey) {
    case "research":
      return <ResearchOutput data={asset.data} />;
    case "script":
      return <ScriptOutput data={asset.data} />;
    case "cuts":
      return <CutsOutput data={asset.data} />;
    case "materials": {
      const items = (asset.data as MaterialsData)?.materials ?? [];
      return (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.slice(0, 8).map((m, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={m.thumb || m.url}
              alt={m.meta?.alt ?? ""}
              className="aspect-video w-full rounded-md border border-border object-cover"
            />
          ))}
        </div>
      );
    }
    case "storyboard": {
      const shots = (asset.data as StoryboardData)?.shots ?? [];
      return (
        <ol className="space-y-2">
          {shots.map((s, i) => (
            <li key={i} className="flex items-center gap-3">
              {s.materialThumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.materialThumb}
                  alt=""
                  className="size-12 shrink-0 rounded-md border border-border object-cover"
                />
              ) : (
                <div className="size-12 shrink-0 rounded-md border border-dashed border-border" />
              )}
              <div className="min-w-0">
                <p className="font-mono text-[0.7rem] text-muted-foreground">
                  {s.timecode}
                </p>
                <p className="truncate text-sm text-foreground/90">{s.line}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    }
    default:
      return null;
  }
}

export function StageCard({
  stage,
  label,
  index,
  asset,
  onChanged,
}: {
  stage: StageRunView;
  label: string;
  index: number;
  asset?: AssetView;
  onChanged: () => void;
}) {
  const [pending, setPending] = useState<null | string>(null);
  const meta = STATUS[stage.status] ?? STATUS.pending;
  const stub = (stage.output as { stub?: boolean } | null)?.stub === true;

  async function act(
    kind: "approve" | "reject" | "retry",
    fn: () => Promise<unknown>,
  ) {
    setPending(kind);
    await fn();
    setPending(null);
    onChanged();
  }

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-xs font-bold text-muted-foreground">
          {index + 1}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.68rem] font-semibold",
            meta.cls,
          )}
        >
          <meta.icon
            className={cn("size-3", meta.spin && "animate-spin motion-reduce:animate-none")}
          />
          {meta.label}
          {stage.attempt > 0 ? (
            <span className="opacity-70">· try {stage.attempt + 1}</span>
          ) : null}
        </span>
      </div>

      {(asset || stub || stage.status !== "pending") &&
      stage.status !== "failed" ? (
        <div className="mt-3 border-t border-border/60 pt-3">
          <StageOutput stage={stage} asset={asset} />
        </div>
      ) : null}

      {stage.status === "failed" ? (
        <p className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {stage.error?.message ?? "Stage failed."}
        </p>
      ) : null}

      {stage.status === "awaiting_approval" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!!pending}
            onClick={() => act("approve", () => approveStageAction(stage.id))}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[0.8rem] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {pending === "approve" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" strokeWidth={3} />
            )}
            {stub ? "Continue" : "Approve"}
          </button>

          {!stub ? (
            <>
              <button
                type="button"
                disabled={!!pending}
                onClick={() =>
                  act("retry", () => rejectStageAction(stage.id, { retry: true }))
                }
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-[0.8rem] font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {pending === "retry" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="size-3.5" />
                )}
                Regenerate
              </button>
              <button
                type="button"
                disabled={!!pending}
                onClick={() => act("reject", () => rejectStageAction(stage.id))}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-60"
              >
                <X className="size-3.5" />
                Reject
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {stage.status === "done" && stage.actualCredits > 0 ? (
        <p className="mt-2 text-[0.7rem] text-muted-foreground">
          {stage.actualCredits} credits used
        </p>
      ) : null}
    </li>
  );
}

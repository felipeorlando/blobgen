"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  useProjectPoll,
  type AssetView,
  type ProjectDetailView as DetailData,
} from "@/hooks/use-project-poll";
import { CreditBadge } from "./credit-badge";
import { StageCard } from "./stage-card";
import { StudioTopbar } from "./studio-topbar";

const STAGE_LABELS: Record<string, string> = {
  research: "Research",
  script: "Script",
  materials: "Materials",
  storyboard: "Storyboard",
  production: "Production · sound + video",
  cuts: "Cuts · final video",
  distribution: "Distribution · thumbnail + publish",
};

function assetForStage(
  assets: AssetView[],
  stageRunId: string,
): AssetView | undefined {
  return assets.find((a) => a.stageRunId === stageRunId);
}

export function ProjectDetailView({
  projectId,
  initial,
}: {
  projectId: string;
  initial: DetailData;
}) {
  const { data, refresh } = useProjectPoll(projectId, initial);
  const [creditNonce, setCreditNonce] = useState(0);
  const detail = data ?? initial;

  const onChanged = () => {
    refresh();
    setCreditNonce((n) => n + 1);
  };

  return (
    <>
      <StudioTopbar title={detail.project.title} subtitle="Project pipeline">
        <CreditBadge refreshKey={creditNonce} />
      </StudioTopbar>

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          New idea
        </Link>

        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
          {detail.project.prompt}
        </p>

        <ol className="mt-6 space-y-3">
          {detail.stages.map((stage, i) => (
            <StageCard
              key={stage.id}
              index={i}
              stage={stage}
              label={STAGE_LABELS[stage.stageKey] ?? stage.stageKey}
              asset={assetForStage(detail.assets, stage.id)}
              onChanged={onChanged}
            />
          ))}
        </ol>
      </div>
    </>
  );
}

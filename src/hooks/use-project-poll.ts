"use client";

import { useCallback, useEffect, useState } from "react";

export interface StageRunView {
  id: string;
  stageKey: string;
  ord: number;
  status: string;
  attempt: number;
  output: unknown;
  error: { message: string } | null;
  estimatedCredits: number;
  actualCredits: number;
}

export interface AssetView {
  id: string;
  stageRunId: string | null;
  kind: string;
  title: string;
  data: unknown;
  storageRef: string | null;
  meta: Record<string, unknown>;
  visual: boolean;
}

export interface ProjectView {
  id: string;
  title: string;
  prompt: string;
  status: string;
  channelId: string;
  thumb: string;
  currentStageKey: string | null;
  formats: string[];
  duration: string;
}

export interface ProjectDetailView {
  project: ProjectView;
  stages: StageRunView[];
  assets: AssetView[];
}

const ACTIVE = new Set(["queued", "running"]);

/** Polls the project detail while any stage is in flight; `refresh()` re-arms it. */
export function useProjectPoll(projectId: string, initial?: ProjectDetailView) {
  const [data, setData] = useState<ProjectDetailView | undefined>(initial);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          cache: "no-store",
        });
        if (!res.ok || !active) return;
        const json = (await res.json()) as ProjectDetailView;
        if (!active) return;
        setData(json);
        if (json.stages.some((s) => ACTIVE.has(s.status))) {
          timer = setTimeout(poll, 1500);
        }
      } catch {
        /* transient — let the next refresh retry */
      }
    };

    poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [projectId, nonce]);

  return { data, refresh };
}

/**
 * The mirror writer: turns the eve agent's progress callbacks into blobgen's
 * productized projection (stage_runs + assets), settles/reserves credits, and
 * translates approvals into an eve resume. eve owns the durable creative run;
 * blobgen's stage_runs is the read-model the Studio + gates + metering use.
 *
 * NOTE (wiring): this is dormant behind EVE_ENABLED until the final step swaps
 * the registry to the eve-proxy stages and re-keys StageKey to the OpenMontage
 * stages below. Until then the existing in-process pipeline runs unchanged. The
 * single `asStageKey` cast marks that boundary.
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  assets,
  projects,
  stageRuns,
  type AssetKind,
  type StageKey,
} from "@/db/schema";
import * as credits from "@/server/credits/service";
import { usdToCredits } from "@/server/credits/costs";
import { resumeSession } from "./client";

/** OpenMontage's creative stages, in order (distribution stays blobgen-owned). */
export const EVE_STAGES = [
  "idea",
  "script",
  "scene_plan",
  "assets",
  "edit",
  "compose",
] as const;
export type EveStage = (typeof EVE_STAGES)[number];

/** Pre-paid-spend defaults; actual cost settles from the reported ToolResult USD. */
const DEFAULT_ESTIMATE: Record<EveStage, number> = {
  idea: 4,
  script: 6,
  scene_plan: 4,
  assets: 20,
  edit: 8,
  compose: 10,
};

function isEveStage(s: string): s is EveStage {
  return (EVE_STAGES as readonly string[]).includes(s);
}
/** Boundary cast: once the registry is re-keyed these strings ARE StageKeys. */
function asStageKey(s: string): StageKey {
  return s as StageKey;
}

export type EveEventKind =
  | "stage_started"
  | "stage_artifact"
  | "checkpoint"
  | "stage_completed"
  | "awaiting_human"
  | "stage_failed"
  | "session_completed";

export interface EveEvent {
  projectId: string;
  stage: string;
  kind: EveEventKind;
  payload?: {
    artifact?: unknown;
    data?: unknown;
    error?: string | null;
    costUsd?: number;
    continuationToken?: string;
    assetRef?: string;
    assetKind?: string;
  };
}

function runFor(projectId: string, stage: string) {
  return db.query.stageRuns.findFirst({
    where: and(
      eq(stageRuns.projectId, projectId),
      eq(stageRuns.stageKey, asStageKey(stage)),
    ),
  });
}

async function projectUserId(projectId: string): Promise<string | null> {
  const p = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  return p?.userId ?? null;
}

function nextStage(stage: EveStage): EveStage | null {
  const i = EVE_STAGES.indexOf(stage);
  return i >= 0 && i < EVE_STAGES.length - 1 ? EVE_STAGES[i + 1] : null;
}

/** Apply one progress event from the eve agent to the blobgen projection. */
export async function mirrorEvent(ev: EveEvent): Promise<void> {
  if (ev.kind === "session_completed") {
    await db
      .update(projects)
      .set({ status: "Rendering", updatedAt: new Date() })
      .where(eq(projects.id, ev.projectId));
    return;
  }
  if (!isEveStage(ev.stage)) return;
  const run = await runFor(ev.projectId, ev.stage);
  if (!run) return;
  const p = ev.payload ?? {};

  switch (ev.kind) {
    case "stage_started":
      await db
        .update(stageRuns)
        .set({ status: "running", startedAt: run.startedAt ?? new Date() })
        .where(eq(stageRuns.id, run.id));
      await db
        .update(projects)
        .set({
          status: "Rendering",
          currentStageKey: asStageKey(ev.stage),
          updatedAt: new Date(),
        })
        .where(eq(projects.id, ev.projectId));
      break;

    case "stage_artifact":
    case "checkpoint": {
      if (p.assetRef) {
        await db.insert(assets).values({
          projectId: ev.projectId,
          stageRunId: run.id,
          kind: (p.assetKind as AssetKind) ?? "Image",
          title: ev.stage,
          storageRef: p.assetRef,
          meta: {},
          visual: true,
          status: "Draft",
        });
      }
      await db
        .update(stageRuns)
        .set({ output: p.artifact ?? p.data ?? run.output ?? null })
        .where(eq(stageRuns.id, run.id));
      break;
    }

    case "stage_completed": {
      const uid = await projectUserId(ev.projectId);
      const actual = usdToCredits(p.costUsd ?? 0);
      if (uid) {
        await credits.settle(uid, run.estimatedCredits, actual, {
          projectId: ev.projectId,
          stageRunId: run.id,
        });
      }
      await db
        .update(stageRuns)
        .set({ status: "done", actualCredits: actual, finishedAt: new Date() })
        .where(eq(stageRuns.id, run.id));
      const next = nextStage(ev.stage);
      if (next) await reserveNext(ev.projectId, next);
      break;
    }

    case "awaiting_human": {
      const prev = (run.input as Record<string, unknown>) ?? {};
      await db
        .update(stageRuns)
        .set({
          status: "awaiting_approval",
          input: { ...prev, eveContinuationToken: p.continuationToken },
          finishedAt: new Date(),
        })
        .where(eq(stageRuns.id, run.id));
      await db
        .update(projects)
        .set({ status: "Draft", updatedAt: new Date() })
        .where(eq(projects.id, ev.projectId));
      break;
    }

    case "stage_failed": {
      const uid = await projectUserId(ev.projectId);
      if (uid && run.estimatedCredits > 0) {
        await credits.refund(uid, run.estimatedCredits, {
          projectId: ev.projectId,
          stageRunId: run.id,
        });
      }
      await db
        .update(stageRuns)
        .set({
          status: "failed",
          error: { message: p.error ?? "stage failed" },
          finishedAt: new Date(),
        })
        .where(eq(stageRuns.id, run.id));
      await db
        .update(projects)
        .set({ status: "Failed", updatedAt: new Date() })
        .where(eq(projects.id, ev.projectId));
      break;
    }
  }
}

/** Reserve credits for the next stage WITHOUT enqueuing a job — eve executes it. */
export async function reserveNext(
  projectId: string,
  stage: EveStage,
): Promise<void> {
  const run = await runFor(projectId, stage);
  if (!run || run.status !== "pending") return;
  const uid = await projectUserId(projectId);
  if (!uid) return;
  const estimate = DEFAULT_ESTIMATE[stage];
  try {
    const { txnId } = await credits.reserve(uid, estimate, {
      projectId,
      stageRunId: run.id,
    });
    await db
      .update(stageRuns)
      .set({ status: "queued", estimatedCredits: estimate, creditTxnId: txnId })
      .where(eq(stageRuns.id, run.id));
  } catch {
    // insufficient credits → pause for the user
    await db
      .update(stageRuns)
      .set({ status: "awaiting_approval" })
      .where(eq(stageRuns.id, run.id));
    await db
      .update(projects)
      .set({ status: "Draft", updatedAt: new Date() })
      .where(eq(projects.id, projectId));
  }
}

/** Resume a paused eve session after a Studio approve/reject. */
export async function resumeEve(
  projectId: string,
  decision: "approve" | "revise" | "reject",
  notes?: string,
): Promise<void> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  if (!project?.eveSessionId) return;
  const awaiting = await db.query.stageRuns.findFirst({
    where: and(
      eq(stageRuns.projectId, projectId),
      eq(stageRuns.status, "awaiting_approval"),
    ),
  });
  const token = (
    awaiting?.input as { eveContinuationToken?: string } | null
  )?.eveContinuationToken;
  await resumeSession(project.eveSessionId, {
    continuationToken: token,
    decision,
    notes,
  });
}

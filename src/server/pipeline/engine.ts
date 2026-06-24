import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  apiUsage,
  assets,
  channelConfigs,
  channels,
  projects,
  stageRuns,
  type GateMode,
  type Project,
  type StageKey,
  type StageRun,
} from "@/db/schema";
import { creditsForTokens } from "@/server/credits/costs";
import * as credits from "@/server/credits/service";
import { InsufficientCredits } from "@/server/credits/service";
import { getOrchestrator } from "@/server/jobs";
import { llm, media, search, stock, youtube } from "@/server/providers";
import { storage } from "@/server/storage";
import { evaluateOutput } from "./evaluator";
import { getStage, orderedStages } from "./registry";
import type { ApiUsageInput, StageContext, StageProviders } from "./types";

const MAX_AI_REVISIONS = 2;

function buildProviders(): StageProviders {
  return {
    llm: llm(),
    search: search(),
    youtube: youtube(),
    stock: stock(),
    media: media(),
  };
}

async function buildContext(
  project: Project,
  run: StageRun,
): Promise<StageContext> {
  const channel = await db.query.channels.findFirst({
    where: eq(channels.id, project.channelId),
  });
  if (!channel) throw new Error(`Channel ${project.channelId} not found`);

  const config =
    (await db.query.channelConfigs.findFirst({
      where: eq(channelConfigs.channelId, project.channelId),
    })) ?? null;

  const doneRuns = await db.query.stageRuns.findMany({
    where: and(
      eq(stageRuns.projectId, project.id),
      eq(stageRuns.status, "done"),
    ),
  });
  const priorOutputs: Partial<Record<StageKey, unknown>> = {};
  for (const r of doneRuns) priorOutputs[r.stageKey] = r.output;

  const revisionNotes = (run.input as { revisionNotes?: string } | null)
    ?.revisionNotes;

  const recordUsage = async (u: ApiUsageInput) => {
    await db.insert(apiUsage).values({
      projectId: project.id,
      stageRunId: run.id,
      provider: u.provider,
      model: u.model ?? null,
      requestKind: u.requestKind ?? null,
      inputTokens: u.inputTokens ?? 0,
      outputTokens: u.outputTokens ?? 0,
      costUsd: String(u.costUsd ?? 0),
      latencyMs: u.latencyMs ?? null,
      raw: u.raw ?? null,
    });
  };

  return {
    project,
    channel,
    config,
    priorOutputs,
    revisionNotes,
    providers: buildProviders(),
    storage: storage(),
    recordUsage,
    logger: (msg, meta) =>
      console.log(`[stage:${run.stageKey}] ${msg}`, meta ?? ""),
  };
}

function gateFor(
  config: StageContext["config"],
  stageKey: StageKey,
): GateMode {
  return (config?.gates?.[stageKey] as GateMode | undefined) ?? "manual";
}

/** Create one stage_run per registered stage, then kick the first. */
export async function initProject(projectId: string): Promise<void> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  if (!project) throw new Error(`Project ${projectId} not found`);

  const stages = orderedStages();
  await db
    .insert(stageRuns)
    .values(
      stages.map((s, ord) => ({
        projectId,
        stageKey: s.key,
        ord,
        status: "pending" as const,
      })),
    )
    .onConflictDoNothing();

  await db
    .update(projects)
    .set({ currentStageKey: stages[0].key, status: "Rendering", updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  await advance(projectId);
}

/** Move to the next pending stage: reserve credits + enqueue, or pause at a stub. */
export async function advance(projectId: string): Promise<void> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  if (!project) return;

  const next = await db.query.stageRuns.findFirst({
    where: and(
      eq(stageRuns.projectId, projectId),
      eq(stageRuns.status, "pending"),
    ),
    orderBy: [asc(stageRuns.ord)],
  });

  if (!next) {
    // No pending stages — the pipeline is idle/complete.
    await db
      .update(projects)
      .set({ currentStageKey: null, updatedAt: new Date() })
      .where(eq(projects.id, projectId));
    return;
  }

  const stage = getStage(next.stageKey);
  await db
    .update(projects)
    .set({ currentStageKey: next.stageKey, updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  // Stub stage: pause for manual approval, no work, no credits.
  if (!stage || !stage.implemented) {
    await db
      .update(stageRuns)
      .set({
        status: "awaiting_approval",
        estimatedCredits: 0,
        output: {
          stub: true,
          message: `${stage?.label ?? next.stageKey} is not implemented yet — approve to continue.`,
        },
      })
      .where(eq(stageRuns.id, next.id));
    await db
      .update(projects)
      .set({ status: "Draft", updatedAt: new Date() })
      .where(eq(projects.id, projectId));
    return;
  }

  const ctx = await buildContext(project, next);
  const estimate = Math.max(0, Math.round(stage.estimateCredits(ctx)));

  try {
    let txnId: string | null = null;
    if (estimate > 0) {
      const reserved = await credits.reserve(project.userId, estimate, {
        projectId,
        stageRunId: next.id,
      });
      txnId = reserved.txnId;
    }
    await db
      .update(stageRuns)
      .set({ status: "queued", estimatedCredits: estimate, creditTxnId: txnId })
      .where(eq(stageRuns.id, next.id));
    await db
      .update(projects)
      .set({ status: "Rendering", updatedAt: new Date() })
      .where(eq(projects.id, projectId));
    await getOrchestrator().enqueueStage(next.id);
  } catch (err) {
    if (err instanceof InsufficientCredits) {
      await db
        .update(stageRuns)
        .set({
          status: "failed",
          error: { message: err.message },
          finishedAt: new Date(),
        })
        .where(eq(stageRuns.id, next.id));
      await db
        .update(projects)
        .set({ status: "Failed", updatedAt: new Date() })
        .where(eq(projects.id, projectId));
      return;
    }
    throw err;
  }
}

/** Re-reserve + re-queue a stage for another attempt with critic/user notes. */
async function regenerate(
  project: Project,
  run: StageRun,
  notes: string,
): Promise<void> {
  const stage = getStage(run.stageKey);
  if (!stage?.implemented) return;
  const ctx = await buildContext(project, run);
  const estimate = Math.max(0, Math.round(stage.estimateCredits(ctx)));
  try {
    let txnId: string | null = null;
    if (estimate > 0) {
      const reserved = await credits.reserve(project.userId, estimate, {
        projectId: project.id,
        stageRunId: run.id,
      });
      txnId = reserved.txnId;
    }
    await db
      .update(stageRuns)
      .set({
        status: "queued",
        attempt: run.attempt + 1,
        estimatedCredits: estimate,
        creditTxnId: txnId,
        input: { revisionNotes: notes },
        startedAt: null,
        finishedAt: null,
      })
      .where(eq(stageRuns.id, run.id));
    await db
      .update(projects)
      .set({ status: "Rendering", updatedAt: new Date() })
      .where(eq(projects.id, project.id));
    await getOrchestrator().enqueueStage(run.id);
  } catch (err) {
    if (err instanceof InsufficientCredits) {
      await db
        .update(stageRuns)
        .set({ status: "awaiting_approval" })
        .where(eq(stageRuns.id, run.id));
      return;
    }
    throw err;
  }
}

/** The job target: run one queued stage, persist, settle credits, apply the gate. */
export async function processStageRun(stageRunId: string): Promise<void> {
  const run = await db.query.stageRuns.findFirst({
    where: eq(stageRuns.id, stageRunId),
  });
  if (!run || run.status !== "queued") return;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, run.projectId),
  });
  if (!project) return;

  const stage = getStage(run.stageKey);
  if (!stage || !stage.implemented) {
    await db
      .update(stageRuns)
      .set({ status: "awaiting_approval" })
      .where(eq(stageRuns.id, run.id));
    return;
  }

  await db
    .update(stageRuns)
    .set({ status: "running", startedAt: new Date() })
    .where(eq(stageRuns.id, run.id));

  const ctx = await buildContext(project, run);

  try {
    const result = await stage.run(ctx);

    if (result.assets.length) {
      await db.insert(assets).values(
        result.assets.map((a) => ({
          projectId: project.id,
          stageRunId: run.id,
          kind: a.kind,
          title: a.title ?? "",
          data: a.data ?? null,
          storageRef: a.storageRef ?? null,
          meta: a.meta ?? {},
          visual: a.visual ?? false,
          status: "Draft" as const,
        })),
      );
    }

    if (result.projectPatch && Object.keys(result.projectPatch).length) {
      await db
        .update(projects)
        .set({ ...result.projectPatch, updatedAt: new Date() })
        .where(eq(projects.id, project.id));
    }

    const gate = gateFor(ctx.config, run.stageKey);
    let actual = Math.max(0, Math.round(result.actualCredits));
    let verdict: "pass" | "revise" | "reject" | null = null;
    let notes = "";

    if (gate === "ai_review") {
      const ev = await evaluateOutput({
        llm: ctx.providers.llm,
        stageKey: run.stageKey,
        output: result.output,
        recordUsage: ctx.recordUsage,
      });
      actual += creditsForTokens(ev.inputTokens, ev.outputTokens);
      verdict = ev.verdict;
      notes = ev.notes;
    }

    await credits.settle(project.userId, run.estimatedCredits, actual, {
      projectId: project.id,
      stageRunId: run.id,
    });
    await db
      .update(stageRuns)
      .set({ output: result.output ?? null, actualCredits: actual })
      .where(eq(stageRuns.id, run.id));

    if (gate === "auto" || (gate === "ai_review" && verdict === "pass")) {
      await db
        .update(stageRuns)
        .set({ status: "done", finishedAt: new Date() })
        .where(eq(stageRuns.id, run.id));
      await advance(project.id);
    } else if (
      gate === "ai_review" &&
      verdict === "revise" &&
      run.attempt < MAX_AI_REVISIONS
    ) {
      await regenerate(project, run, notes || "Improve quality and coherence.");
    } else {
      await db
        .update(stageRuns)
        .set({ status: "awaiting_approval", finishedAt: new Date() })
        .where(eq(stageRuns.id, run.id));
      await db
        .update(projects)
        .set({ status: "Draft", updatedAt: new Date() })
        .where(eq(projects.id, project.id));
    }
  } catch (err) {
    const e = err as Error;
    ctx.logger("failed", e.message);
    await db
      .update(stageRuns)
      .set({
        status: "failed",
        error: { message: e.message, stack: e.stack },
        finishedAt: new Date(),
      })
      .where(eq(stageRuns.id, run.id));
    if (run.estimatedCredits > 0) {
      await credits.refund(project.userId, run.estimatedCredits, {
        projectId: project.id,
        stageRunId: run.id,
      });
    }
    await db
      .update(projects)
      .set({ status: "Failed", updatedAt: new Date() })
      .where(eq(projects.id, project.id));
  }
}

/** Approve a gated stage and advance to the next. */
export async function approveStage(stageRunId: string): Promise<void> {
  const run = await db.query.stageRuns.findFirst({
    where: eq(stageRuns.id, stageRunId),
  });
  if (!run || run.status !== "awaiting_approval") return;
  await db
    .update(stageRuns)
    .set({ status: "done", finishedAt: new Date() })
    .where(eq(stageRuns.id, run.id));
  await advance(run.projectId);
}

/** Reject a gated stage: regenerate (retry) or fail it. */
export async function rejectStage(
  stageRunId: string,
  opts?: { retry?: boolean; notes?: string },
): Promise<void> {
  const run = await db.query.stageRuns.findFirst({
    where: eq(stageRuns.id, stageRunId),
  });
  if (!run || run.status !== "awaiting_approval") return;
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, run.projectId),
  });
  if (!project) return;

  const stage = getStage(run.stageKey);
  if (opts?.retry && stage?.implemented) {
    await regenerate(
      project,
      run,
      opts.notes ?? "User requested a regeneration.",
    );
    return;
  }

  await db
    .update(stageRuns)
    .set({
      status: "failed",
      error: { message: "Rejected by user" },
      finishedAt: new Date(),
    })
    .where(eq(stageRuns.id, run.id));
  await db
    .update(projects)
    .set({ status: "Draft", updatedAt: new Date() })
    .where(eq(projects.id, project.id));
}

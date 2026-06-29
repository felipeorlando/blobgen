"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, stageRuns } from "@/db/schema";
import { auth } from "@/server/auth";
import { approveStage, rejectStage } from "@/server/pipeline/engine";
import type { ActionResult } from "./projects";

async function ownsStage(stageRunId: string, userId: string): Promise<boolean> {
  const run = await db.query.stageRuns.findFirst({
    where: eq(stageRuns.id, stageRunId),
  });
  if (!run) return false;
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, run.projectId),
  });
  return project?.userId === userId;
}

export async function approveStageAction(
  stageRunId: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  if (!(await ownsStage(stageRunId, session.user.id)))
    return { ok: false, error: "Forbidden." };
  await approveStage(stageRunId);
  return { ok: true };
}

export async function rejectStageAction(
  stageRunId: string,
  opts?: { retry?: boolean; notes?: string },
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  if (!(await ownsStage(stageRunId, session.user.id)))
    return { ok: false, error: "Forbidden." };
  await rejectStage(stageRunId, opts);
  return { ok: true };
}

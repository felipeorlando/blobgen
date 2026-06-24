import { and, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { stageRuns } from "@/db/schema";
import { getOrchestrator } from "./index";

/**
 * Re-queue stage runs stuck in `running` (e.g. a crash mid-stage). Gives the
 * in-process driver at-least-once semantics without a daemon.
 */
export async function recoverStaleRuns(olderThanMs = 5 * 60_000): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanMs);
  const stale = await db
    .select()
    .from(stageRuns)
    .where(and(eq(stageRuns.status, "running"), lt(stageRuns.startedAt, cutoff)));

  for (const run of stale) {
    await db
      .update(stageRuns)
      .set({ status: "queued" })
      .where(eq(stageRuns.id, run.id));
    await getOrchestrator().enqueueStage(run.id);
  }
  return stale.length;
}

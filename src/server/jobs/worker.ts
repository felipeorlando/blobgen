/**
 * BullMQ worker entry — run alongside `next dev` when JOB_DRIVER=bullmq:
 *   bun run worker
 */
import { Worker } from "bullmq";
import { processStageRun } from "../pipeline/engine";
import { redisConnection, STAGE_QUEUE } from "./bullmq";

const worker = new Worker(
  STAGE_QUEUE,
  async (job) => {
    const { stageRunId } = job.data as { stageRunId: string };
    await processStageRun(stageRunId);
  },
  { connection: redisConnection(), concurrency: 4 },
);

worker.on("completed", (job) => console.log(`✓ stage job ${job.id} done`));
worker.on("failed", (job, err) =>
  console.error(`✗ stage job ${job?.id} failed:`, err),
);

console.log(`[worker] listening on "${STAGE_QUEUE}"`);

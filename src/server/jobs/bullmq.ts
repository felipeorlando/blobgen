import { Queue, type ConnectionOptions } from "bullmq";
import { env } from "@/env";
import type { Orchestrator } from "./types";

export const STAGE_QUEUE = "blobgen-stages";

/** Plain RedisOptions parsed from REDIS_URL (avoids ioredis instance type clashes). */
export function redisConnection(): ConnectionOptions {
  const u = new URL(env.REDIS_URL);
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 6379,
    username: u.username || undefined,
    password: u.password || undefined,
    db: u.pathname && u.pathname !== "/" ? Number(u.pathname.slice(1)) : undefined,
    maxRetriesPerRequest: null,
  };
}

let queue: Queue | undefined;

export function stageQueue(): Queue {
  if (!queue) {
    queue = new Queue(STAGE_QUEUE, { connection: redisConnection() });
  }
  return queue;
}

/** Durable Redis-backed driver. Requires a running `bun run worker` process. */
export class BullMQOrchestrator implements Orchestrator {
  readonly name = "bullmq";

  async enqueueStage(stageRunId: string): Promise<void> {
    await stageQueue().add(
      "stage",
      { stageRunId },
      { attempts: 1, removeOnComplete: true, removeOnFail: 200 },
    );
  }
}

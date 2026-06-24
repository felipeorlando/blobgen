import { env } from "@/env";
import { BullMQOrchestrator } from "./bullmq";
import { InProcessOrchestrator } from "./inprocess";
import type { Orchestrator } from "./types";

export type { Orchestrator } from "./types";

let instance: Orchestrator | undefined;

/** The configured orchestrator (in-process by default, BullMQ when JOB_DRIVER=bullmq). */
export function getOrchestrator(): Orchestrator {
  if (instance) return instance;
  instance =
    env.JOB_DRIVER === "bullmq"
      ? new BullMQOrchestrator()
      : new InProcessOrchestrator();
  return instance;
}

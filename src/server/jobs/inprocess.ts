import type { Orchestrator } from "./types";

/**
 * Zero-infra driver: runs the stage on the next tick in the same process.
 * Dynamic import of the engine avoids a static import cycle (engine → jobs → engine).
 */
export class InProcessOrchestrator implements Orchestrator {
  readonly name = "inprocess";

  async enqueueStage(stageRunId: string): Promise<void> {
    queueMicrotask(() => {
      void (async () => {
        try {
          const { processStageRun } = await import("../pipeline/engine");
          await processStageRun(stageRunId);
        } catch (err) {
          console.error("[inprocess] stage run failed:", err);
        }
      })();
    });
  }
}

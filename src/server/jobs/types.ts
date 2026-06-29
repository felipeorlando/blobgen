/** Drives stage execution. DB `stage_runs` is the source of truth, so any driver works. */
export interface Orchestrator {
  readonly name: string;
  enqueueStage(stageRunId: string): Promise<void>;
}

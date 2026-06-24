import type { Stage, StageResult } from "../types";

/**
 * Future-wave stages. `implemented: false` makes the engine pause at them
 * (awaiting_approval) instead of running them — proving the chain reaches the
 * end without doing the expensive work yet. Implementing one = fill in `run`.
 */
function stub(key: Stage["key"], label: string): Stage {
  return {
    key,
    label,
    implemented: false,
    estimateCredits() {
      return 0;
    },
    async run(): Promise<StageResult> {
      // Not invoked by the engine while implemented=false; here for safety.
      return {
        output: { stub: true, message: `${label} is not implemented yet.` },
        assets: [],
        actualCredits: 0,
      };
    },
  };
}

export const distributionStage = stub(
  "distribution",
  "Distribution (thumbnail + publish)",
);

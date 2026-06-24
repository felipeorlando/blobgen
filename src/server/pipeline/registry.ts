import type { StageKey } from "@/db/schema";
import { materialsStage } from "./stages/materials";
import { researchStage } from "./stages/research";
import { scriptStage } from "./stages/script";
import { storyboardStage } from "./stages/storyboard";
import { productionStage } from "./stages/production";
import { distributionStage } from "./stages/stubs";
import type { Stage } from "./types";

/** The ordered pipeline. Add a future real stage = implement Stage + list it here. */
export const STAGES: Stage[] = [
  researchStage,
  scriptStage,
  materialsStage,
  storyboardStage,
  productionStage,
  distributionStage,
];

export function orderedStages(): Stage[] {
  return STAGES;
}

export function getStage(key: StageKey): Stage | undefined {
  return STAGES.find((s) => s.key === key);
}

export function stageOrdinal(key: StageKey): number {
  return STAGES.findIndex((s) => s.key === key);
}

export function nextStageKey(key: StageKey): StageKey | undefined {
  const i = STAGES.findIndex((s) => s.key === key);
  return i >= 0 ? STAGES[i + 1]?.key : undefined;
}

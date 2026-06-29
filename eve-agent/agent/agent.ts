import { defineAgent } from "eve";

/**
 * The orchestrator. Drives OpenMontage's per-pipeline state machine durably.
 * The model is configurable — a mid-tier model is plenty here since the heavy
 * lifting is OpenMontage's tools, not token generation.
 */
export default defineAgent({
  model: "anthropic/claude-sonnet-4.6",
});

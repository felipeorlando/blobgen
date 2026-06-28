import { defineTool } from "eve/tools";
import { z } from "zod";
import { postProgress } from "../lib/blobgen-callback.js";

export default defineTool({
  description:
    "Report a pipeline lifecycle event to blobgen (the productization shell) so the Studio UI, credits and approval gates stay in sync. Send `awaiting_human` before a manual approval (then stop), and `session_completed` when the final video is ready to publish.",
  inputSchema: z.object({
    projectId: z.string(),
    stage: z.string(),
    kind: z.enum([
      "stage_started",
      "stage_artifact",
      "checkpoint",
      "stage_completed",
      "awaiting_human",
      "stage_failed",
      "session_completed",
    ]),
    payload: z.record(z.string(), z.unknown()).optional(),
  }),
  async execute(input) {
    const ok = await postProgress(input);
    return { reported: ok };
  },
});

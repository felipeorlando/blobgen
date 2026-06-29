import { defineTool } from "eve/tools";
import { z } from "zod";
import { runTool } from "../lib/openmontage.js";
import { postProgress } from "../lib/blobgen-callback.js";

export default defineTool({
  description:
    "Execute one OpenMontage tool for the current pipeline stage and checkpoint the result back to blobgen. Use the stage-director skill to choose the tool and params. Returns the ToolResult (success, data, error) including any reported cost.",
  inputSchema: z.object({
    projectId: z.string(),
    stage: z.enum(["idea", "script", "scene_plan", "assets", "edit", "compose"]),
    tool: z.string().describe("OpenMontage tool/class name, e.g. VideoCompose"),
    params: z.record(z.string(), z.unknown()).default({}),
    artifact: z
      .unknown()
      .optional()
      .describe("Canonical stage artifact to checkpoint (brief/script/scene_plan/…)"),
  }),
  async execute({ projectId, stage, tool, params, artifact }) {
    await postProgress({ projectId, stage, kind: "stage_started" });
    const res = await runTool(tool, params as Record<string, unknown>);
    await postProgress({
      projectId,
      stage,
      kind: res.success ? "checkpoint" : "stage_failed",
      payload: { artifact, data: res.data, error: res.error ?? null },
    });
    return res;
  },
});

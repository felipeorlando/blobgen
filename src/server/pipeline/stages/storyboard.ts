import type { StockItem } from "@/server/providers";
import type { Stage, StageContext, StageResult } from "../types";
import { ScriptSchema } from "./script";

interface Shot {
  index: number;
  timecode: string;
  heading: string;
  line: string;
  materialUrl?: string;
  materialThumb?: string;
}

/** Assembles script beats + chosen materials into a shot list. No generation. */
export const storyboardStage: Stage = {
  key: "storyboard",
  label: "Storyboard",
  implemented: true,

  estimateCredits() {
    return 1;
  },

  async run(ctx: StageContext): Promise<StageResult> {
    const { project } = ctx;
    const script = ScriptSchema.safeParse(ctx.priorOutputs.script);
    const materialsOut = ctx.priorOutputs.materials as
      | { materials?: StockItem[] }
      | undefined;
    const materials = materialsOut?.materials ?? [];

    const shots: Shot[] = [];
    let i = 0;
    if (script.success) {
      for (const section of script.data.sections) {
        for (const beat of section.beats) {
          const m = materials[i % Math.max(materials.length, 1)];
          shots.push({
            index: i,
            timecode: section.timecode || `${i * 3}s`,
            heading: section.heading,
            line: beat,
            materialUrl: m?.url,
            materialThumb: m?.thumb,
          });
          i++;
        }
      }
    }

    const { ref } = await ctx.storage.put(
      `projects/${project.id}/storyboard.json`,
      JSON.stringify({ shots }, null, 2),
      "application/json",
    );

    return {
      output: { shots },
      assets: [
        {
          kind: "Storyboard",
          title: `Storyboard — ${shots.length} shots`,
          data: { shots },
          storageRef: ref,
          meta: { shots: shots.length },
          visual: true,
        },
      ],
      actualCredits: 1,
    };
  },
};

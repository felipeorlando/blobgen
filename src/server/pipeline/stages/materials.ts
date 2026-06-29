import { creditsForCalls } from "@/server/credits/costs";
import type { StockItem } from "@/server/providers";
import type { Stage, StageContext, StageResult } from "../types";
import { ScriptSchema } from "./script";

/** Sources stock materials for the script. No pricey generation (that's Production). */
export const materialsStage: Stage = {
  key: "materials",
  label: "Materials",
  implemented: true,

  estimateCredits() {
    return creditsForCalls({ search: 3 });
  },

  async run(ctx: StageContext): Promise<StageResult> {
    const { project, channel, providers } = ctx;
    const script = ScriptSchema.safeParse(ctx.priorOutputs.script);

    // Build a few visual search terms from the topic + script beats.
    const terms = new Set<string>([project.prompt, channel.niche]);
    if (script.success) {
      for (const s of script.data.sections) {
        if (s.beats[0]) terms.add(s.beats[0]);
      }
    }
    const queries = [...terms].slice(0, 3);

    const items: StockItem[] = [];
    let calls = 0;
    for (const q of queries) {
      const found = await providers.stock.searchImages(q, 3);
      calls++;
      items.push(...found);
    }
    await ctx.recordUsage({
      provider: providers.stock.name,
      requestKind: "stock-search",
      raw: { queries },
    });

    // Dedupe by url.
    const seen = new Set<string>();
    const materials = items.filter((it) =>
      it.url && !seen.has(it.url) ? (seen.add(it.url), true) : false,
    );

    return {
      output: { materials, queries },
      assets: [
        {
          kind: "Materials",
          title: `Materials — ${materials.length} clips`,
          data: { materials, queries },
          meta: { count: materials.length, provider: providers.stock.name },
          visual: true,
        },
      ],
      actualCredits: Math.max(1, creditsForCalls({ search: calls })),
    };
  },
};

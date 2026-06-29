import { defineTool } from "eve/tools";
import { z } from "zod";
import { searchBank, saveToBank, markBankUsed } from "../lib/bank-client.js";
import { runTool, isOpenMontageConfigured } from "../lib/openmontage.js";

export default defineTool({
  description:
    "Gather a visual asset for a shot. Checks the brand Image Bank FIRST (reuse = brand consistency + 0 generation cost); only sources stock or generates when nothing fits, then saves the new asset back to the bank for next time.",
  inputSchema: z.object({
    projectId: z.string(),
    channelId: z.string(),
    userId: z.string(),
    beat: z.string().describe("What the shot needs to show"),
    tags: z.array(z.string()).default([]),
    allowGenerate: z
      .boolean()
      .default(false)
      .describe("Permit paid generation when no bank/stock match (requires prior budget approval)"),
  }),
  async execute({ channelId, userId, beat, tags, allowGenerate }) {
    // 1) Reuse-first: the brand library.
    const matches = await searchBank({ channelId, tags, query: beat, limit: 1 });
    if (matches.length > 0) {
      await markBankUsed(matches[0].id);
      return { source: "bank", reused: true, asset: matches[0], creditsSaved: true };
    }

    // 2) Source / generate via OpenMontage, then save back to the bank.
    if (!isOpenMontageConfigured()) {
      return {
        source: "none",
        reused: false,
        note: "No bank match and OpenMontage is not configured.",
      };
    }
    const tool = allowGenerate ? "ImageGen" : "StockSearch";
    const res = await runTool(tool, { query: beat, count: 1 });
    if (res.success && res.data) {
      const data = res.data as { storageRef?: string; url?: string };
      const saved = await saveToBank({
        channelId,
        userId,
        source: allowGenerate ? "generated" : "stock",
        query: beat,
        tags,
        storageRef: data.storageRef,
        url: data.url,
      });
      return {
        source: allowGenerate ? "generated" : "stock",
        reused: false,
        asset: res.data,
        savedId: saved?.id ?? null,
      };
    }
    return { source: "none", reused: false, error: res.error ?? "asset lookup failed" };
  },
});

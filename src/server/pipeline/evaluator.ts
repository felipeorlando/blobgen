import { z } from "zod";
import type { StageKey } from "@/db/schema";
import type { LLMProvider } from "@/server/providers";
import { tryExtractJson } from "./json";
import type { ApiUsageInput } from "./types";

export const VerdictSchema = z.object({
  verdict: z.enum(["pass", "revise", "reject"]),
  score: z.number().min(0).max(10).default(5),
  notes: z.string().default(""),
});
export type Verdict = z.infer<typeof VerdictSchema>;

export interface EvaluationResult extends Verdict {
  inputTokens: number;
  outputTokens: number;
}

/**
 * The AI critic for `ai_review` gates: decides pass / revise / reject.
 * Returns its token usage so the engine can fold it into credit settlement.
 */
export async function evaluateOutput(args: {
  llm: LLMProvider;
  stageKey: StageKey;
  output: unknown;
  recordUsage: (u: ApiUsageInput) => Promise<void>;
}): Promise<EvaluationResult> {
  const sample: Verdict = {
    verdict: "pass",
    score: 8,
    notes: "Coherent and on-brief.",
  };
  const res = await args.llm.complete({
    system: [
      `You are a strict QA critic for an automated video pipeline.`,
      `Judge the "${args.stageKey}" stage output for quality, coherence, and usefulness.`,
      `Respond with ONLY JSON: { "verdict": "pass" | "revise" | "reject", "score": 0-10, "notes": string }.`,
      `Use "pass" only if it is genuinely good. Use "revise" with specific, actionable notes if it needs another attempt. Use "reject" if fundamentally unusable.`,
    ].join("\n"),
    messages: [
      {
        role: "user",
        content: JSON.stringify(args.output).slice(0, 6000),
      },
    ],
    responseFormat: "json",
    sample,
  });
  await args.recordUsage({
    provider: args.llm.name,
    model: res.model,
    requestKind: `evaluate-${args.stageKey}`,
    inputTokens: res.usage.inputTokens,
    outputTokens: res.usage.outputTokens,
    raw: res.raw,
  });
  const parsed = VerdictSchema.safeParse(tryExtractJson(res.text));
  const verdict = parsed.success ? parsed.data : sample;
  return {
    ...verdict,
    inputTokens: res.usage.inputTokens,
    outputTokens: res.usage.outputTokens,
  };
}

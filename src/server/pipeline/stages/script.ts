import { z } from "zod";
import { creditsForTokens } from "@/server/credits/costs";
import { tryExtractJson } from "../json";
import { buildScriptPrompt } from "../prompts/script";
import type { Stage, StageContext, StageResult } from "../types";
import { ResearchBriefSchema } from "./research";

export const ScriptSchema = z.object({
  title: z.string(),
  hook: z.string(),
  sections: z
    .array(
      z.object({
        heading: z.string(),
        beats: z.array(z.string()).default([]),
        timecode: z.string().default(""),
      }),
    )
    .default([]),
  cta: z.string().default(""),
  estimatedDurationSec: z.number().default(30),
  wordCount: z.number().default(0),
});
export type Script = z.infer<typeof ScriptSchema>;

function sampleScript(topic: string): Script {
  return {
    title: `${topic}`.slice(0, 70) || "Untitled",
    hook: `Here's what nobody tells you about ${topic}.`,
    sections: [
      {
        heading: "HOOK (0–2s)",
        beats: [`Open with a bold claim about ${topic}.`],
        timecode: "0:00",
      },
      {
        heading: "MAIN (2–25s)",
        beats: [
          "Point one, with a concrete example.",
          "Point two, the surprising bit.",
          "Point three, the actionable takeaway.",
        ],
        timecode: "0:02",
      },
      {
        heading: "CTA (25–30s)",
        beats: ["Tell viewers to follow for more."],
        timecode: "0:25",
      },
    ],
    cta: "Follow for more.",
    estimatedDurationSec: 30,
    wordCount: 90,
  };
}

function renderMarkdown(script: Script): string {
  const blocks = script.sections
    .map(
      (s) =>
        `### ${s.heading}${s.timecode ? ` _(${s.timecode})_` : ""}\n${s.beats
          .map((b) => `- ${b}`)
          .join("\n")}`,
    )
    .join("\n\n");
  return [
    `# ${script.title}`,
    `\n**Hook:** ${script.hook}`,
    `\n${blocks}`,
    `\n**CTA:** ${script.cta}`,
    `\n_~${script.estimatedDurationSec}s · ${script.wordCount} words_`,
  ].join("\n");
}

export const scriptStage: Stage = {
  key: "script",
  label: "Script",
  implemented: true,

  estimateCredits() {
    return creditsForTokens(2000, 1200);
  },

  async run(ctx: StageContext): Promise<StageResult> {
    const { project, channel, providers } = ctx;

    const parsedBrief = ResearchBriefSchema.safeParse(ctx.priorOutputs.research);
    const brief = parsedBrief.success
      ? parsedBrief.data
      : {
          summary: project.prompt,
          keyPoints: [],
          angles: [],
          suggestedTitles: [],
        };

    const format = project.formats.includes("long") ? "Long-form video" : "Short";
    const { system, user } = buildScriptPrompt({
      prompt: project.prompt,
      channelName: channel.name,
      niche: channel.niche,
      voice: project.voice,
      format,
      duration: project.duration,
      brief: {
        summary: brief.summary,
        keyPoints: brief.keyPoints,
        angles: brief.angles,
        suggestedTitles: brief.suggestedTitles,
      },
      revisionNotes: ctx.revisionNotes,
    });

    const sample = sampleScript(project.prompt);
    let inTok = 0;
    let outTok = 0;

    const main = await providers.llm.complete({
      system,
      messages: [{ role: "user", content: user }],
      responseFormat: "json",
      sample,
    });
    inTok += main.usage.inputTokens;
    outTok += main.usage.outputTokens;
    await ctx.recordUsage({
      provider: providers.llm.name,
      model: main.model,
      requestKind: "script-generation",
      inputTokens: main.usage.inputTokens,
      outputTokens: main.usage.outputTokens,
      raw: main.raw,
    });

    let script: Script;
    const parsed = ScriptSchema.safeParse(tryExtractJson(main.text));
    if (parsed.success) {
      script = parsed.data;
    } else {
      ctx.logger("script: JSON parse failed, attempting repair");
      const repair = await providers.llm.complete({
        system:
          "Convert the following into valid JSON for the script schema. Return ONLY the JSON object.",
        messages: [{ role: "user", content: main.text.slice(0, 4000) }],
        responseFormat: "json",
        sample,
      });
      inTok += repair.usage.inputTokens;
      outTok += repair.usage.outputTokens;
      const reparsed = ScriptSchema.safeParse(tryExtractJson(repair.text));
      script = reparsed.success ? reparsed.data : sample;
    }

    const md = renderMarkdown(script);
    const { ref } = await ctx.storage.put(
      `projects/${project.id}/script.md`,
      md,
      "text/markdown",
    );

    return {
      output: script,
      assets: [
        {
          kind: "Script",
          title: script.title,
          data: script,
          storageRef: ref,
          meta: { wordCount: script.wordCount, sections: script.sections.length },
          visual: false,
        },
      ],
      actualCredits: Math.max(1, creditsForTokens(inTok, outTok)),
      projectPatch: { title: script.title.slice(0, 120) },
    };
  },
};

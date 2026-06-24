import { z } from "zod";
import { creditsForCalls, creditsForTokens } from "@/server/credits/costs";
import { tryExtractJson } from "../json";
import { buildResearchPrompt } from "../prompts/research";
import type { Stage, StageContext, StageResult } from "../types";

export const ResearchBriefSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()).default([]),
  angles: z.array(z.string()).default([]),
  audienceNotes: z.string().default(""),
  competitorGaps: z.array(z.string()).default([]),
  sources: z
    .array(z.object({ title: z.string(), url: z.string() }))
    .default([]),
  suggestedTitles: z.array(z.string()).default([]),
});
export type ResearchBrief = z.infer<typeof ResearchBriefSchema>;

function sampleBrief(topic: string, niche: string): ResearchBrief {
  return {
    summary: `A focused overview of "${topic}" for a ${niche} audience, covering the most compelling, share-worthy angles.`,
    keyPoints: [
      `Why "${topic}" matters right now`,
      "A surprising fact most people get wrong",
      "A concrete, actionable takeaway",
    ],
    angles: ["Myth-busting", "Beginner-friendly explainer", "Contrarian take"],
    audienceNotes: `Skews toward viewers interested in ${niche}; respond to curiosity gaps.`,
    competitorGaps: ["Most coverage is shallow — go one level deeper"],
    sources: [],
    suggestedTitles: [
      `The truth about ${topic}`,
      `${topic}, explained in 60 seconds`,
    ],
  };
}

function renderMarkdown(brief: ResearchBrief, channel: string): string {
  const list = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");
  return [
    `# Research brief — ${channel}`,
    `\n## Summary\n${brief.summary}`,
    `\n## Key points\n${list(brief.keyPoints)}`,
    `\n## Angles\n${list(brief.angles)}`,
    `\n## Audience\n${brief.audienceNotes}`,
    `\n## Competitor gaps\n${list(brief.competitorGaps)}`,
    `\n## Suggested titles\n${list(brief.suggestedTitles)}`,
    `\n## Sources\n${brief.sources.map((s) => `- [${s.title}](${s.url})`).join("\n")}`,
  ].join("\n");
}

export const researchStage: Stage = {
  key: "research",
  label: "Research",
  implemented: true,

  estimateCredits() {
    return (
      creditsForCalls({ search: 2, youtube: 1 }) + creditsForTokens(1800, 800)
    );
  },

  async run(ctx: StageContext): Promise<StageResult> {
    const { project, channel, providers } = ctx;
    const queries = [project.prompt, `${project.prompt} — ${channel.niche}`];

    const web: { title: string; url: string; snippet: string }[] = [];
    let searchCalls = 0;
    for (const q of queries) {
      const results = await providers.search.search(q, { numResults: 5 });
      searchCalls++;
      web.push(
        ...results.map((r) => ({
          title: r.title,
          url: r.url,
          snippet: r.snippet,
        })),
      );
    }
    await ctx.recordUsage({
      provider: providers.search.name,
      requestKind: "search",
      raw: { queries },
    });

    const ytVideos = await providers.youtube.searchVideos(project.prompt, 6);
    await ctx.recordUsage({
      provider: providers.youtube.name,
      requestKind: "search",
      raw: { q: project.prompt },
    });

    const videoTitles = (channel.meta?.videoTitles ?? []) as string[];
    const { system, user } = buildResearchPrompt({
      prompt: project.prompt,
      channelName: channel.name,
      niche: channel.niche,
      voice: project.voice,
      videoTitles,
      competitors: [],
      web: web.slice(0, 8),
      youtube: ytVideos.map((v) => ({
        title: v.title,
        channelTitle: v.channelTitle,
      })),
      revisionNotes: ctx.revisionNotes,
    });

    const sample = sampleBrief(project.prompt, channel.niche);
    sample.sources = web.slice(0, 5).map((w) => ({ title: w.title, url: w.url }));

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
      requestKind: "research-synthesis",
      inputTokens: main.usage.inputTokens,
      outputTokens: main.usage.outputTokens,
      raw: main.raw,
    });

    let brief: ResearchBrief;
    const parsed = ResearchBriefSchema.safeParse(tryExtractJson(main.text));
    if (parsed.success) {
      brief = parsed.data;
    } else {
      ctx.logger("research: JSON parse failed, attempting repair");
      const repair = await providers.llm.complete({
        system:
          "Convert the following into valid JSON for the research brief schema. Return ONLY the JSON object.",
        messages: [{ role: "user", content: main.text.slice(0, 4000) }],
        responseFormat: "json",
        sample,
      });
      inTok += repair.usage.inputTokens;
      outTok += repair.usage.outputTokens;
      const reparsed = ResearchBriefSchema.safeParse(tryExtractJson(repair.text));
      brief = reparsed.success ? reparsed.data : sample;
    }

    if (brief.sources.length === 0) {
      brief.sources = web.slice(0, 5).map((w) => ({ title: w.title, url: w.url }));
    }

    const md = renderMarkdown(brief, channel.name);
    const { ref } = await ctx.storage.put(
      `projects/${project.id}/research-brief.md`,
      md,
      "text/markdown",
    );

    const actualCredits = Math.max(
      1,
      creditsForCalls({ search: searchCalls, youtube: 1 }) +
        creditsForTokens(inTok, outTok),
    );

    return {
      output: brief,
      assets: [
        {
          kind: "ResearchBrief",
          title: `Research — ${project.prompt}`.slice(0, 80),
          data: brief,
          storageRef: ref,
          meta: {
            sources: brief.sources.length,
            keyPoints: brief.keyPoints.length,
          },
          visual: false,
        },
      ],
      actualCredits,
    };
  },
};

export interface ResearchPromptArgs {
  prompt: string;
  channelName: string;
  niche: string;
  voice: string;
  videoTitles: string[];
  competitors: string[];
  web: { title: string; url: string; snippet: string }[];
  youtube: { title: string; channelTitle: string }[];
  revisionNotes?: string;
}

export function buildResearchPrompt(args: ResearchPromptArgs): {
  system: string;
  user: string;
} {
  const system = [
    "You are a sharp content researcher for a faceless YouTube channel.",
    `Channel: ${args.channelName} — niche: ${args.niche}; voice: ${args.voice}.`,
    "Synthesize the supplied web + YouTube findings into a tight research brief.",
    "Respond with ONLY a JSON object matching this shape:",
    `{
  "summary": string,
  "keyPoints": string[],
  "angles": string[],
  "audienceNotes": string,
  "competitorGaps": string[],
  "sources": { "title": string, "url": string }[],
  "suggestedTitles": string[]
}`,
    "Be specific and grounded in the findings; prefer concrete facts over fluff.",
  ].join("\n");

  const web = args.web
    .map((w, i) => `[W${i + 1}] ${w.title} — ${w.url}\n${w.snippet}`)
    .join("\n\n");
  const yt = args.youtube
    .map((v, i) => `[Y${i + 1}] ${v.title} (by ${v.channelTitle})`)
    .join("\n");

  const user = [
    `TOPIC: ${args.prompt}`,
    args.videoTitles.length
      ? `EXISTING CHANNEL VIDEOS:\n- ${args.videoTitles.slice(0, 8).join("\n- ")}`
      : "",
    args.competitors.length
      ? `COMPETITORS: ${args.competitors.join(", ")}`
      : "",
    web ? `WEB FINDINGS:\n${web}` : "",
    yt ? `YOUTUBE FINDINGS:\n${yt}` : "",
    args.revisionNotes
      ? `REVISION NOTES (address these):\n${args.revisionNotes}`
      : "",
    "Produce the research brief JSON now.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { system, user };
}

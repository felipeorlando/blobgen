export interface ScriptPromptArgs {
  prompt: string;
  channelName: string;
  niche: string;
  voice: string;
  format: string;
  duration: string;
  brief: {
    summary: string;
    keyPoints: string[];
    angles: string[];
    suggestedTitles: string[];
  };
  revisionNotes?: string;
}

export function buildScriptPrompt(args: ScriptPromptArgs): {
  system: string;
  user: string;
} {
  const system = [
    "You are a world-class short-form video scriptwriter.",
    `Channel: ${args.channelName} (${args.niche}). Narration voice: ${args.voice}.`,
    `Target format: ${args.format}, duration ~${args.duration}.`,
    "Write a tight, retention-optimized script grounded in the research brief.",
    "Open with a 0–2s hook. Respond with ONLY a JSON object of this shape:",
    `{
  "title": string,
  "hook": string,
  "sections": { "heading": string, "beats": string[], "timecode": string }[],
  "cta": string,
  "estimatedDurationSec": number,
  "wordCount": number
}`,
  ].join("\n");

  const user = [
    `TOPIC: ${args.prompt}`,
    `RESEARCH SUMMARY: ${args.brief.summary}`,
    args.brief.keyPoints.length
      ? `KEY POINTS:\n- ${args.brief.keyPoints.join("\n- ")}`
      : "",
    args.brief.angles.length
      ? `ANGLES TO CONSIDER: ${args.brief.angles.join("; ")}`
      : "",
    args.brief.suggestedTitles.length
      ? `TITLE IDEAS: ${args.brief.suggestedTitles.join(" | ")}`
      : "",
    args.revisionNotes
      ? `REVISION NOTES (address these):\n${args.revisionNotes}`
      : "",
    "Write the script JSON now.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { system, user };
}

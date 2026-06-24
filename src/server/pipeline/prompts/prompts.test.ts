import { describe, expect, test } from "bun:test";
import { buildResearchPrompt } from "./research";
import { buildScriptPrompt } from "./script";

describe("prompt builders", () => {
  test("research prompt embeds topic, findings, and channel", () => {
    const { system, user } = buildResearchPrompt({
      prompt: "morning routines",
      channelName: "Stoic Mornings",
      niche: "discipline",
      voice: "calm",
      videoTitles: ["The 5am rule"],
      competitors: ["Daily Discipline"],
      web: [{ title: "Why 5am", url: "https://x.com", snippet: "early" }],
      youtube: [{ title: "5am routine", channelTitle: "Creator" }],
    });
    expect(user).toContain("morning routines");
    expect(user).toContain("Why 5am");
    expect(user).toContain("The 5am rule");
    expect(system).toContain("Stoic Mornings");
  });

  test("script prompt embeds the research brief and format", () => {
    const { system, user } = buildScriptPrompt({
      prompt: "compound interest",
      channelName: "Ledger",
      niche: "finance",
      voice: "calm",
      format: "Short",
      duration: "30s",
      brief: {
        summary: "Money grows exponentially",
        keyPoints: ["Start early"],
        angles: ["Myth-busting"],
        suggestedTitles: ["Compound interest is insane"],
      },
    });
    expect(user).toContain("Money grows exponentially");
    expect(user).toContain("Start early");
    expect(system).toContain("Short");
  });

  test("revision notes are included when present", () => {
    const { user } = buildScriptPrompt({
      prompt: "p",
      channelName: "c",
      niche: "n",
      voice: "calm",
      format: "Short",
      duration: "30s",
      brief: { summary: "s", keyPoints: [], angles: [], suggestedTitles: [] },
      revisionNotes: "Make the hook punchier",
    });
    expect(user).toContain("Make the hook punchier");
  });
});

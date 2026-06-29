/** Best-effort extraction of a JSON object from an LLM response (handles ```json fences). */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    // Fall back to the outermost {...} span.
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error("No JSON object found in LLM response");
  }
}

/** Like extractJson but returns undefined instead of throwing. */
export function tryExtractJson(text: string): unknown {
  try {
    return extractJson(text);
  } catch {
    return undefined;
  }
}

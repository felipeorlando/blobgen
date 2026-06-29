/**
 * Credits are an integer abstraction over provider spend. One place to tune the
 * conversion so estimates and settlement always agree.
 */
export const CREDIT_RATES = {
  perKInputTokens: 1,
  perKOutputTokens: 3,
  perSearchCall: 2,
  perYouTubeCall: 1,
  // Media generation (Replicate).
  perVoiceover: 10,
  perImageGen: 8,
  perReplicateSecond: 1,
  // Local ffmpeg video assembly (Cuts).
  perVideoRender: 5,
  // Publish/schedule to a platform (Distribution).
  perPublish: 5,
  // USD→credits conversion for metered provider spend (OpenMontage ToolResult costs).
  perUsd: 100,
} as const;

/** Credits for an LLM call given token counts. */
export function creditsForTokens(inputTokens: number, outputTokens: number): number {
  return Math.ceil(
    (inputTokens / 1000) * CREDIT_RATES.perKInputTokens +
      (outputTokens / 1000) * CREDIT_RATES.perKOutputTokens,
  );
}

/** Credits for external calls (search/youtube) by count. */
export function creditsForCalls(opts: {
  search?: number;
  youtube?: number;
}): number {
  return (
    (opts.search ?? 0) * CREDIT_RATES.perSearchCall +
    (opts.youtube ?? 0) * CREDIT_RATES.perYouTubeCall
  );
}

/**
 * Credits for media generation. Prefer measured Replicate seconds when known;
 * otherwise fall back to flat per-asset rates (used for estimates).
 */
export function creditsForMedia(opts: {
  voiceovers?: number;
  images?: number;
  seconds?: number;
}): number {
  if (opts.seconds && opts.seconds > 0) {
    return Math.ceil(opts.seconds * CREDIT_RATES.perReplicateSecond);
  }
  return (
    (opts.voiceovers ?? 0) * CREDIT_RATES.perVoiceover +
    (opts.images ?? 0) * CREDIT_RATES.perImageGen
  );
}

/** Flat credits for a local ffmpeg video render (Cuts). */
export function creditsForRender(): number {
  return CREDIT_RATES.perVideoRender;
}

/** Flat credits for publishing/scheduling to a platform (Distribution). */
export function creditsForPublish(): number {
  return CREDIT_RATES.perPublish;
}

/** Convert metered USD provider spend (OpenMontage ToolResult costs) to credits. */
export function usdToCredits(usd: number): number {
  return Math.ceil(Math.max(0, usd) * CREDIT_RATES.perUsd);
}

/** Sum reported tool costs (USD) into credits, plus optional render seconds. */
export function creditsFromToolResults(
  results: { costUsd?: number }[],
  extras?: { renderSeconds?: number },
): number {
  const usd = results.reduce((sum, r) => sum + (r.costUsd ?? 0), 0);
  let credits = usdToCredits(usd);
  if (extras?.renderSeconds && extras.renderSeconds > 0) {
    credits += Math.ceil(extras.renderSeconds * CREDIT_RATES.perReplicateSecond);
  }
  return credits;
}

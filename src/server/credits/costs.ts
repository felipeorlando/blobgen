/**
 * Credits are an integer abstraction over provider spend. One place to tune the
 * conversion so estimates and settlement always agree.
 */
export const CREDIT_RATES = {
  perKInputTokens: 1,
  perKOutputTokens: 3,
  perSearchCall: 2,
  perYouTubeCall: 1,
  // Wave 2: perReplicateSecond, perImageGen, etc.
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

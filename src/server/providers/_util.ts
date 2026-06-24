import { env } from "@/env";

/** Mock fallbacks are allowed outside production, so dev runs without keys. */
export const allowMock = () => env.NODE_ENV !== "production";

const warned = new Set<string>();

export function warnMockOnce(provider: string, envVar: string) {
  if (warned.has(provider)) return;
  warned.add(provider);
  console.warn(
    `[blobgen] ${provider} not configured (${envVar}) — using MOCK provider. ` +
      `Set ${envVar} in .env.local for real output.`,
  );
}

/** Shared HMAC for the eve bridge: the agent signs callbacks + bank calls with
 *  EVE_CALLBACK_SECRET; blobgen verifies them here. */
import crypto from "node:crypto";
import { env } from "@/env";

export function signEve(body: string): string | null {
  if (!env.EVE_CALLBACK_SECRET) return null;
  return crypto
    .createHmac("sha256", env.EVE_CALLBACK_SECRET)
    .update(body)
    .digest("hex");
}

export function verifyEveRequest(
  body: string,
  signature: string | null,
): boolean {
  if (!env.EVE_CALLBACK_SECRET || !signature) return false;
  const expected = crypto
    .createHmac("sha256", env.EVE_CALLBACK_SECRET)
    .update(body)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { env } from "@/env";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

/**
 * Return a valid Google access token for a user (refreshing if expired), or
 * `null` when the user has no Google account linked (e.g. the dev login) — in
 * which case callers fall back to the mock path. `fetchImpl` injectable for tests.
 */
export async function getGoogleAccessToken(
  userId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const account = await db.query.accounts.findFirst({
    where: (a, ops) => ops.and(ops.eq(a.userId, userId), ops.eq(a.provider, "google")),
  });
  if (!account?.access_token) return null;

  // expires_at is unix seconds; refresh ~60s early.
  const stillValid =
    account.expires_at != null &&
    account.expires_at * 1000 > Date.now() + 60_000;
  if (stillValid) return account.access_token;

  if (!account.refresh_token || !env.AUTH_GOOGLE_ID || !env.AUTH_GOOGLE_SECRET) {
    return account.access_token; // best effort — can't refresh
  }

  const res = await fetchImpl(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.AUTH_GOOGLE_ID,
      client_secret: env.AUTH_GOOGLE_SECRET,
      refresh_token: account.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return account.access_token;

  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!json.access_token) return account.access_token;

  const expiresAt = Math.floor(Date.now() / 1000) + (json.expires_in ?? 3600);
  await db
    .update(accounts)
    .set({ access_token: json.access_token, expires_at: expiresAt })
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")));

  return json.access_token;
}

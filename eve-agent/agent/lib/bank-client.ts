/**
 * Client for blobgen's Image Bank (/api/bank). Reuse-first: the pipeline searches
 * the brand library before sourcing/generating, then saves new assets back.
 * HMAC-signed with the shared bridge secret.
 */
import crypto from "node:crypto";

function sign(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

async function call(op: string, payload: Record<string, unknown>): Promise<unknown> {
  const base = process.env.BLOBGEN_URL;
  const secret = process.env.BLOBGEN_CALLBACK_SECRET;
  if (!base || !secret) return null;
  const body = JSON.stringify({ op, ...payload });
  try {
    const res = await fetch(`${base}/api/bank`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-blobgen-signature": sign(body, secret),
      },
      body,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface BankMatch {
  id: string;
  url: string;
  storageRef?: string;
  tags: string[];
}

export async function searchBank(input: {
  channelId: string;
  tags?: string[];
  query?: string;
  limit?: number;
}): Promise<BankMatch[]> {
  const r = (await call("search", input)) as { items?: BankMatch[] } | null;
  return r?.items ?? [];
}

export async function saveToBank(input: {
  channelId: string;
  userId: string;
  storageRef?: string;
  url?: string;
  source?: string;
  provider?: string;
  query?: string;
  tags?: string[];
}): Promise<{ id: string } | null> {
  return (await call("save", input)) as { id: string } | null;
}

export async function markBankUsed(id: string): Promise<void> {
  await call("markUsed", { id });
}

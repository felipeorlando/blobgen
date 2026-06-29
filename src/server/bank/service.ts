import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  channels,
  mediaBank,
  type MediaBankItem,
  type MediaBankKind,
  type MediaBankSource,
  type NewMediaBankItem,
} from "@/db/schema";
import { storage } from "@/server/storage";

async function assertChannel(channelId: string, userId: string): Promise<void> {
  const channel = await db.query.channels.findFirst({
    where: eq(channels.id, channelId),
  });
  if (!channel) throw new Error("Channel not found");
  if (channel.userId && channel.userId !== userId) {
    throw new Error("Channel does not belong to this user");
  }
}

export interface BankSearchInput {
  channelId: string;
  kind?: MediaBankKind;
  tags?: string[];
  query?: string;
  limit?: number;
}

/**
 * Reuse-first lookup. Ranks the channel's bank by tag overlap with the requested
 * shot/beat, then favorite + useCount. With no criteria it returns the most-reused
 * items, so the pipeline can always prefer the library before sourcing/generating.
 */
export async function searchBank(
  input: BankSearchInput,
): Promise<MediaBankItem[]> {
  const rows = await db.query.mediaBank.findMany({
    where: and(
      eq(mediaBank.channelId, input.channelId),
      input.kind ? eq(mediaBank.kind, input.kind) : undefined,
    ),
    orderBy: [
      desc(mediaBank.favorite),
      desc(mediaBank.useCount),
      desc(mediaBank.createdAt),
    ],
  });

  const wanted = new Set((input.tags ?? []).map((t) => t.toLowerCase()));
  const q = (input.query ?? "").trim().toLowerCase();
  const hasCriteria = wanted.size > 0 || q.length > 0;

  const scored = rows.map((r) => {
    const tags = (r.tags ?? []).map((t) => t.toLowerCase());
    let score = tags.reduce((s, t) => (wanted.has(t) ? s + 1 : s), 0);
    if (
      q &&
      (r.query?.toLowerCase().includes(q) ||
        r.prompt?.toLowerCase().includes(q) ||
        tags.some((t) => t.includes(q)))
    ) {
      score += 1;
    }
    return { r, score };
  });

  const pool = hasCriteria ? scored.filter((s) => s.score > 0) : scored;
  pool.sort((a, b) => b.score - a.score);
  return pool.slice(0, input.limit ?? 12).map((s) => s.r);
}

export async function listBank(
  channelId: string,
  userId: string,
): Promise<MediaBankItem[]> {
  await assertChannel(channelId, userId);
  return db.query.mediaBank.findMany({
    where: eq(mediaBank.channelId, channelId),
    orderBy: [desc(mediaBank.favorite), desc(mediaBank.createdAt)],
  });
}

export interface SaveBankInput {
  userId: string;
  channelId: string;
  kind?: MediaBankKind;
  storageRef: string;
  thumbRef?: string | null;
  source?: MediaBankSource;
  provider?: string | null;
  query?: string | null;
  prompt?: string | null;
  tags?: string[];
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
  license?: string | null;
}

export async function saveToBank(input: SaveBankInput): Promise<MediaBankItem> {
  const values: NewMediaBankItem = {
    userId: input.userId,
    channelId: input.channelId,
    kind: input.kind ?? "image",
    storageRef: input.storageRef,
    thumbRef: input.thumbRef ?? null,
    source: input.source ?? "stock",
    provider: input.provider ?? null,
    query: input.query ?? null,
    prompt: input.prompt ?? null,
    tags: input.tags ?? [],
    width: input.width ?? null,
    height: input.height ?? null,
    durationSec: input.durationSec ?? null,
    license: input.license ?? null,
  };
  const [row] = await db.insert(mediaBank).values(values).returning();
  return row;
}

/** Bump reuse stats when the pipeline reuses a bank item. */
export async function markUsed(id: string): Promise<void> {
  const row = await db.query.mediaBank.findFirst({
    where: eq(mediaBank.id, id),
  });
  if (!row) return;
  await db
    .update(mediaBank)
    .set({ useCount: row.useCount + 1, lastUsedAt: new Date() })
    .where(eq(mediaBank.id, id));
}

export async function uploadToBank(input: {
  userId: string;
  channelId: string;
  kind?: MediaBankKind;
  bytes: Buffer;
  contentType?: string;
  filename?: string;
  tags?: string[];
}): Promise<MediaBankItem> {
  await assertChannel(input.channelId, input.userId);
  const ext = (input.filename?.split(".").pop() ?? "bin")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const key = `bank/${input.channelId}/${crypto.randomUUID()}.${ext || "bin"}`;
  const { ref } = await storage().put(key, input.bytes, input.contentType);
  return saveToBank({
    userId: input.userId,
    channelId: input.channelId,
    kind: input.kind ?? "image",
    storageRef: ref,
    source: "uploaded",
    tags: input.tags ?? [],
  });
}

export async function deleteFromBank(
  id: string,
  userId: string,
): Promise<void> {
  const row = await db.query.mediaBank.findFirst({
    where: eq(mediaBank.id, id),
  });
  if (!row || row.userId !== userId) return;
  try {
    await storage().delete(row.storageRef);
  } catch {
    // best-effort cleanup; the DB row is the source of truth
  }
  await db.delete(mediaBank).where(eq(mediaBank.id, id));
}

export async function toggleFavorite(
  id: string,
  userId: string,
): Promise<void> {
  const row = await db.query.mediaBank.findFirst({
    where: eq(mediaBank.id, id),
  });
  if (!row || row.userId !== userId) return;
  await db
    .update(mediaBank)
    .set({ favorite: !row.favorite })
    .where(eq(mediaBank.id, id));
}

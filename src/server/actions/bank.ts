"use server";

import { auth } from "@/server/auth";
import { storage } from "@/server/storage";
import * as bank from "@/server/bank/service";
import type { MediaBankItem } from "@/db/schema";

export interface BankItemView {
  id: string;
  url: string;
  kind: string;
  source: string;
  tags: string[];
  favorite: boolean;
  useCount: number;
  width: number | null;
  height: number | null;
  createdLabel: string;
}

async function toViews(items: MediaBankItem[]): Promise<BankItemView[]> {
  const s = storage();
  return Promise.all(
    items.map(async (it) => ({
      id: it.id,
      url: await s.url(it.thumbRef ?? it.storageRef),
      kind: it.kind,
      source: it.source,
      tags: it.tags ?? [],
      favorite: it.favorite,
      useCount: it.useCount,
      width: it.width,
      height: it.height,
      createdLabel: new Date(it.createdAt).toLocaleDateString(),
    })),
  );
}

export async function listBankAction(
  channelId: string,
): Promise<BankItemView[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  try {
    const items = await bank.listBank(channelId, session.user.id);
    return toViews(items);
  } catch {
    return [];
  }
}

export interface BankActionResult {
  ok: boolean;
  error?: string;
}

export async function uploadBankAction(
  channelId: string,
  form: FormData,
): Promise<BankActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file selected." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Only image files are supported." };
  }
  const tags = String(form.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    await bank.uploadToBank({
      userId: session.user.id,
      channelId,
      kind: "image",
      bytes,
      contentType: file.type,
      filename: file.name,
      tags,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteBankAction(id: string): Promise<BankActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  await bank.deleteFromBank(id, session.user.id);
  return { ok: true };
}

export async function favoriteBankAction(
  id: string,
): Promise<BankActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  await bank.toggleFavorite(id, session.user.id);
  return { ok: true };
}

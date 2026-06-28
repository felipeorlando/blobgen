/** Agent-facing Image Bank API. The eve agent searches the brand library before
 *  sourcing/generating, then saves new assets back. HMAC-authenticated. */
import { verifyEveRequest } from "@/server/eve/secret";
import { storage } from "@/server/storage";
import * as bank from "@/server/bank/service";
import type { MediaBankKind, MediaBankSource } from "@/db/schema";

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyEveRequest(raw, req.headers.get("x-blobgen-signature"))) {
    return new Response("Unauthorized", { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const op = String(body.op ?? "");
  try {
    if (op === "search") {
      const items = await bank.searchBank({
        channelId: String(body.channelId ?? ""),
        kind: body.kind as MediaBankKind | undefined,
        tags: body.tags as string[] | undefined,
        query: body.query as string | undefined,
        limit: body.limit as number | undefined,
      });
      const s = storage();
      const out = await Promise.all(
        items.map(async (it) => ({
          id: it.id,
          url: await s.url(it.thumbRef ?? it.storageRef),
          storageRef: it.storageRef,
          tags: it.tags,
        })),
      );
      return Response.json({ items: out });
    }

    if (op === "save") {
      const ref =
        (body.storageRef as string | undefined) ??
        (body.url as string | undefined);
      if (!ref || !body.channelId || !body.userId) {
        return Response.json({ error: "missing fields" }, { status: 400 });
      }
      const row = await bank.saveToBank({
        userId: String(body.userId),
        channelId: String(body.channelId),
        kind: body.kind as MediaBankKind | undefined,
        storageRef: ref,
        source: (body.source as MediaBankSource | undefined) ?? "stock",
        provider: body.provider as string | undefined,
        query: body.query as string | undefined,
        tags: (body.tags as string[] | undefined) ?? [],
      });
      return Response.json({ id: row.id });
    }

    if (op === "markUsed") {
      await bank.markUsed(String(body.id ?? ""));
      return Response.json({ ok: true });
    }

    return new Response("Unknown op", { status: 400 });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

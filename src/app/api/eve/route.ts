/** Inbound callback from the eve agent. Verifies the HMAC and mirrors the
 *  progress event into blobgen's stage_runs/credits/gates. */
import { verifyEveRequest } from "@/server/eve/secret";
import { mirrorEvent, type EveEvent } from "@/server/eve/bridge";

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyEveRequest(raw, req.headers.get("x-blobgen-signature"))) {
    return new Response("Unauthorized", { status: 401 });
  }
  let ev: EveEvent;
  try {
    ev = JSON.parse(raw) as EveEvent;
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  try {
    await mirrorEvent(ev);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

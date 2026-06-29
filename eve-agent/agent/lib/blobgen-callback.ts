/**
 * Outbound bridge to blobgen (the productization shell). Every pipeline
 * checkpoint is POSTed here; blobgen's /api/eve/callback mirrors it into
 * stage_runs, meters credits, and drives the approval gates. HMAC-signed with
 * the shared secret. A no-op when the bridge isn't configured (standalone dev).
 */
import crypto from "node:crypto";

export type ProgressKind =
  | "stage_started"
  | "stage_artifact"
  | "checkpoint"
  | "stage_completed"
  | "awaiting_human"
  | "stage_failed"
  | "session_completed";

export interface ProgressEvent {
  projectId: string;
  stage: string;
  kind: ProgressKind;
  payload?: Record<string, unknown>;
}

function sign(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export async function postProgress(ev: ProgressEvent): Promise<boolean> {
  const base = process.env.BLOBGEN_URL;
  const secret = process.env.BLOBGEN_CALLBACK_SECRET;
  if (!base || !secret) return false;

  const body = JSON.stringify(ev);
  try {
    const res = await fetch(`${base}/api/eve/callback`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-blobgen-signature": sign(body, secret),
      },
      body,
    });
    return res.ok;
  } catch {
    return false;
  }
}

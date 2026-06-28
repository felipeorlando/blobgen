/** Typed client for the eve agent's HTTP API. Isolates the eve wire contract so
 *  an eve API change is a one-file edit. */
import { env } from "@/env";

function base(): string {
  if (!env.EVE_URL) throw new Error("EVE_URL is not configured");
  return env.EVE_URL.replace(/\/+$/, "");
}

export interface EveSession {
  sessionId: string;
}

/** Open a session — the eve agent starts driving the OpenMontage pipeline. */
export async function createSession(input: {
  message: string;
  input: Record<string, unknown>;
}): Promise<EveSession> {
  const res = await fetch(`${base()}/eve/v1/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`eve createSession failed: ${res.status}`);
  const data = (await res.json()) as { sessionId: string };
  return { sessionId: data.sessionId };
}

/** Resume a paused session after a human approval/rejection. */
export async function resumeSession(
  sessionId: string,
  body: {
    continuationToken?: string;
    message?: string;
    decision?: "approve" | "revise" | "reject";
    notes?: string;
  },
): Promise<void> {
  const res = await fetch(`${base()}/eve/v1/session/${sessionId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`eve resumeSession failed: ${res.status}`);
}

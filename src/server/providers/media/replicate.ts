import { ProviderNotConfigured } from "@/env";
import type { MediaGenInput, MediaGenResult, MediaProvider } from "./types";

const BASE = "https://api.replicate.com/v1";

interface ReplicatePrediction {
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  urls?: { get?: string };
  output?: unknown;
  error?: unknown;
  metrics?: { predict_time?: number };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** First http(s) url found in a Replicate output (string | array | object). */
function firstUrl(output: unknown): string | undefined {
  if (typeof output === "string") {
    return output.startsWith("http") ? output : undefined;
  }
  if (Array.isArray(output)) {
    for (const x of output) {
      const u = firstUrl(x);
      if (u) return u;
    }
  } else if (output && typeof output === "object") {
    for (const v of Object.values(output)) {
      const u = firstUrl(v);
      if (u) return u;
    }
  }
  return undefined;
}

/**
 * Replicate media adapter — create a prediction on an official model
 * (`owner/name`, no version hash) and poll until terminal. `fetchImpl`,
 * `pollIntervalMs`, and `maxWaitMs` are injectable for tests.
 */
export class ReplicateMediaProvider implements MediaProvider {
  readonly name = "replicate";

  constructor(
    private opts: {
      apiToken: string;
      ttsModel?: string;
      imageModel?: string;
      fetchImpl?: typeof fetch;
      pollIntervalMs?: number;
      maxWaitMs?: number;
    },
  ) {}

  private modelFor(kind: MediaGenInput["kind"]): string {
    const m = kind === "tts" ? this.opts.ttsModel : this.opts.imageModel;
    if (!m) {
      throw new ProviderNotConfigured(
        `Replicate ${kind}`,
        kind === "tts" ? "REPLICATE_TTS_MODEL" : "REPLICATE_IMAGE_MODEL",
      );
    }
    return m;
  }

  private buildInput(args: MediaGenInput): Record<string, unknown> {
    if (args.kind === "tts") {
      // TTS model input keys vary; provide the common aliases.
      return {
        text: args.prompt,
        prompt: args.prompt,
        ...(args.voice ? { voice: args.voice } : {}),
      };
    }
    return {
      prompt: args.prompt,
      ...(args.imageUrl ? { image: args.imageUrl } : {}),
    };
  }

  async generate(args: MediaGenInput): Promise<MediaGenResult> {
    const doFetch = this.opts.fetchImpl ?? fetch;
    const model = args.model ?? this.modelFor(args.kind);
    const [owner, name] = model.split("/");
    if (!owner || !name) {
      throw new Error(`Invalid Replicate model "${model}" (expected owner/name)`);
    }
    const authHeader = { Authorization: `Token ${this.opts.apiToken}` };

    const createRes = await doFetch(`${BASE}/models/${owner}/${name}/predictions`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
        Prefer: "wait", // hold the connection briefly so short jobs return inline
      },
      body: JSON.stringify({ input: this.buildInput(args) }),
    });
    if (!createRes.ok) {
      const body = await createRes.text().catch(() => "");
      throw new Error(`Replicate create ${createRes.status}: ${body.slice(0, 300)}`);
    }

    let pred = (await createRes.json()) as ReplicatePrediction;
    const interval = this.opts.pollIntervalMs ?? 1500;
    const maxWait = this.opts.maxWaitMs ?? 120_000;
    const start = Date.now();

    while (pred.status === "starting" || pred.status === "processing") {
      if (Date.now() - start > maxWait) {
        throw new Error(`Replicate timed out after ${maxWait}ms (status ${pred.status})`);
      }
      const pollUrl = pred.urls?.get;
      if (!pollUrl) break;
      await sleep(interval);
      const pollRes = await doFetch(pollUrl, { headers: authHeader });
      if (!pollRes.ok) throw new Error(`Replicate poll ${pollRes.status}`);
      pred = (await pollRes.json()) as ReplicatePrediction;
    }

    if (pred.status !== "succeeded") {
      throw new Error(
        `Replicate prediction ${pred.status}: ${String(pred.error ?? "unknown error")}`,
      );
    }

    const url = firstUrl(pred.output);
    if (!url) throw new Error("Replicate returned no output url");

    return {
      url,
      model,
      raw: pred,
      predictSeconds: pred.metrics?.predict_time,
    };
  }
}

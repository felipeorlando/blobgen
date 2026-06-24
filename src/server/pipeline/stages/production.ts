import { creditsForMedia } from "@/server/credits/costs";
import type { Storage } from "@/server/storage";
import type { Stage, StageContext, StageResult } from "../types";
import { ScriptSchema } from "./script";

const MAX_SHOTS = 6;

interface Shot {
  index?: number;
  timecode?: string;
  heading?: string;
  line?: string;
}

interface VoiceoverOut {
  ref?: string;
  url?: string;
  text: string;
  durationSec: number;
  mock: boolean;
  error?: string;
}

interface ImageOut {
  shotIndex: number;
  ref?: string;
  url: string;
  prompt: string;
  mock: boolean;
}

/** Download a remote binary into storage; return its ref + served URL. */
async function store(
  storage: Storage,
  url: string,
  key: string,
  contentType: string,
): Promise<{ ref: string; url: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const { ref } = await storage.put(key, buf, contentType);
  return { ref, url: await storage.url(ref) };
}

function buildNarration(script: {
  hook: string;
  sections: { beats: string[] }[];
  cta: string;
}): string {
  return [script.hook, ...script.sections.flatMap((s) => s.beats), script.cta]
    .filter(Boolean)
    .join(" ")
    .slice(0, 1500);
}

function imagePrompt(shot: Shot, niche: string): string {
  const subject = shot.line || shot.heading || "establishing shot";
  return `${subject}. Cinematic, high detail, ${niche} aesthetic, 16:9.`.slice(
    0,
    400,
  );
}

/** Turns the storyboard into real media: voiceover (TTS) + one image per shot. */
export const productionStage: Stage = {
  key: "production",
  label: "Production · sound + visuals",
  implemented: true,

  estimateCredits(ctx) {
    const shots =
      (ctx.priorOutputs.storyboard as { shots?: unknown[] } | undefined)?.shots
        ?.length ?? 4;
    return creditsForMedia({
      voiceovers: 1,
      images: Math.min(shots, MAX_SHOTS),
    });
  },

  async run(ctx: StageContext): Promise<StageResult> {
    const { project, channel, providers, storage } = ctx;
    const parsed = ScriptSchema.safeParse(ctx.priorOutputs.script);
    const script = parsed.success
      ? parsed.data
      : { hook: project.prompt, sections: [], cta: "" };
    const shots = (
      (ctx.priorOutputs.storyboard as { shots?: Shot[] } | undefined)?.shots ??
      []
    ).slice(0, MAX_SHOTS);

    const errors: string[] = [];
    let predictSeconds = 0;

    // ── Voiceover ────────────────────────────────────────────────────────────
    const narration = buildNarration(script);
    const durationSec = "estimatedDurationSec" in script
      ? (script as { estimatedDurationSec?: number }).estimatedDurationSec ?? 30
      : 30;
    let voiceover: VoiceoverOut | undefined;
    try {
      const tts = await providers.media.generate({
        kind: "tts",
        prompt: narration,
        voice: project.voice,
      });
      await ctx.recordUsage({
        provider: providers.media.name,
        model: tts.model,
        requestKind: "tts",
        latencyMs: tts.predictSeconds ? Math.round(tts.predictSeconds * 1000) : undefined,
        raw: tts.raw,
      });
      predictSeconds += tts.predictSeconds ?? 0;
      if (tts.url.startsWith("http")) {
        const saved = await store(
          storage,
          tts.url,
          `projects/${project.id}/production/voiceover.mp3`,
          "audio/mpeg",
        );
        voiceover = { ...saved, text: narration, durationSec, mock: false };
      } else {
        // Mock / no audio — keep the narration text so the UI can show it.
        voiceover = { text: narration, durationSec, mock: true };
      }
    } catch (e) {
      errors.push(`voiceover: ${(e as Error).message}`);
    }

    // ── Per-shot images (concurrent) ─────────────────────────────────────────
    const settled = await Promise.allSettled(
      shots.map(async (shot, i): Promise<ImageOut> => {
        const prompt = imagePrompt(shot, channel.niche);
        const img = await providers.media.generate({ kind: "image", prompt });
        await ctx.recordUsage({
          provider: providers.media.name,
          model: img.model,
          requestKind: "image",
          latencyMs: img.predictSeconds ? Math.round(img.predictSeconds * 1000) : undefined,
          raw: img.raw,
        });
        predictSeconds += img.predictSeconds ?? 0;
        if (img.url.startsWith("http")) {
          const saved = await store(
            storage,
            img.url,
            `projects/${project.id}/production/shot-${i}.png`,
            "image/png",
          );
          return { shotIndex: i, ref: saved.ref, url: saved.url, prompt, mock: false };
        }
        // Local mock path — reference directly.
        return { shotIndex: i, url: img.url, prompt, mock: !!img.mock };
      }),
    );

    const images: ImageOut[] = [];
    for (const r of settled) {
      if (r.status === "fulfilled") images.push(r.value);
      else errors.push(`image: ${String((r.reason as Error)?.message ?? r.reason)}`);
    }

    if (!voiceover && images.length === 0) {
      throw new Error(`Production produced nothing — ${errors.join("; ")}`);
    }
    if (errors.length) ctx.logger("production partial", errors);

    const actualCredits = Math.max(
      1,
      predictSeconds > 0
        ? creditsForMedia({ seconds: predictSeconds })
        : creditsForMedia({
            voiceovers: voiceover ? 1 : 0,
            images: images.length,
          }),
    );

    return {
      output: { voiceover, images, errors: errors.length ? errors : undefined },
      assets: [
        ...(voiceover
          ? [
              {
                kind: "Voiceover" as const,
                title: "Voiceover",
                data: voiceover,
                storageRef: voiceover.ref,
                meta: { durationSec: voiceover.durationSec, mock: voiceover.mock },
                visual: false,
              },
            ]
          : []),
        ...images.map((img) => ({
          kind: "Image" as const,
          title: `Shot ${img.shotIndex + 1}`,
          data: img,
          storageRef: img.ref,
          meta: { shotIndex: img.shotIndex, mock: img.mock },
          visual: true,
        })),
      ],
      actualCredits,
    };
  },
};

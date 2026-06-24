import { spawn } from "node:child_process";
import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import ffmpegStatic from "ffmpeg-static";
import { env } from "@/env";
import { creditsForRender } from "@/server/credits/costs";
import type { Storage } from "@/server/storage";
import type { Stage, StageContext, StageResult } from "../types";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const DEFAULT_PER_IMAGE = 3;

interface ProductionOut {
  voiceover?: { ref?: string; url?: string; durationSec?: number; mock?: boolean };
  images?: { shotIndex: number; ref?: string; url: string; mock?: boolean }[];
}

/* ----------------------------- pure builders ------------------------------ */

/** Seconds each image is shown so the slideshow matches the voiceover length. */
export function perImageDuration(
  totalSec: number,
  count: number,
  fallback = DEFAULT_PER_IMAGE,
): number {
  if (count <= 0) return 0;
  if (!totalSec || totalSec <= 0) return fallback;
  return Math.max(0.5, totalSec / count);
}

/** ffmpeg concat-demuxer list; the last file is repeated (demuxer honors duration only between entries). */
export function buildConcatList(
  files: { path: string; durationSec: number }[],
): string {
  const esc = (p: string) => p.replace(/'/g, "'\\''");
  const lines: string[] = [];
  for (const f of files) {
    lines.push(`file '${esc(f.path)}'`);
    lines.push(`duration ${f.durationSec.toFixed(3)}`);
  }
  if (files.length) lines.push(`file '${esc(files[files.length - 1].path)}'`);
  return lines.join("\n") + "\n";
}

/** ffmpeg args for a vertical 1080×1920 H.264 slideshow, optionally muxed with audio. */
export function buildFfmpegArgs(opts: {
  listPath: string;
  audioPath?: string;
  outPath: string;
}): string[] {
  const args = ["-y", "-f", "concat", "-safe", "0", "-i", opts.listPath];
  if (opts.audioPath) args.push("-i", opts.audioPath);
  args.push(
    "-vf",
    `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT}`,
    "-r",
    String(FPS),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
  );
  if (opts.audioPath) args.push("-c:a", "aac", "-shortest");
  args.push("-movflags", "+faststart", opts.outPath);
  return args;
}

/* ------------------------------- ffmpeg I/O ------------------------------- */

function resolveFfmpeg(): string {
  const bin = env.FFMPEG_PATH || ffmpegStatic;
  if (!bin) {
    throw new Error(
      "ffmpeg binary not found — set FFMPEG_PATH or ensure ffmpeg-static is installed.",
    );
  }
  return bin;
}

function runFfmpeg(bin: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    proc.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString();
      if (stderr.length > 16000) stderr = stderr.slice(-16000);
    });
    proc.on("error", reject);
    proc.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-800)}`)),
    );
  });
}

/** Resolve an image/audio reference to a real local file for ffmpeg. */
async function materialize(
  storage: Storage,
  src: { ref?: string; url: string },
  destNoExt: string,
): Promise<string> {
  if (src.ref) {
    const buf = await storage.get(src.ref);
    const dest = destNoExt + (extname(src.ref) || ".png");
    await writeFile(dest, buf);
    return dest;
  }
  // Keyless mock path like "/images/x.jpg" — copy from public/.
  const ext = extname(src.url) || ".jpg";
  const local = join(process.cwd(), "public", src.url.replace(/^\/+/, ""));
  const dest = destNoExt + ext;
  await copyFile(local, dest);
  return dest;
}

/* --------------------------------- stage ---------------------------------- */

export const cutsStage: Stage = {
  key: "cuts",
  label: "Cuts",
  implemented: true,

  estimateCredits() {
    return creditsForRender();
  },

  async run(ctx: StageContext): Promise<StageResult> {
    const { project, storage } = ctx;
    const prod = ctx.priorOutputs.production as ProductionOut | undefined;
    const images = prod?.images ?? [];
    if (!images.length) {
      throw new Error("Cuts needs Production shot images — none were found.");
    }
    const voiceover = prod?.voiceover;

    const tmp = await mkdtemp(join(tmpdir(), "blobgen-cuts-"));
    const startedAt = Date.now();
    try {
      const localImages: string[] = [];
      for (let i = 0; i < images.length; i++) {
        localImages.push(await materialize(storage, images[i], join(tmp, `shot-${i}`)));
      }

      let audioPath: string | undefined;
      if (voiceover?.ref) {
        const buf = await storage.get(voiceover.ref);
        audioPath = join(tmp, `voiceover${extname(voiceover.ref) || ".mp3"}`);
        await writeFile(audioPath, buf);
      }

      const per = perImageDuration(
        audioPath ? (voiceover?.durationSec ?? 0) : 0,
        localImages.length,
      );
      const durationSec = Math.round(per * localImages.length);

      const listPath = join(tmp, "frames.txt");
      await writeFile(
        listPath,
        buildConcatList(localImages.map((p) => ({ path: p, durationSec: per }))),
      );

      const outPath = join(tmp, "final.mp4");
      await runFfmpeg(resolveFfmpeg(), buildFfmpegArgs({ listPath, audioPath, outPath }));

      const videoBuf = await readFile(outPath);
      const { ref } = await storage.put(
        `projects/${project.id}/cuts/final.mp4`,
        videoBuf,
        "video/mp4",
      );
      const url = await storage.url(ref);

      await ctx.recordUsage({
        provider: "ffmpeg",
        requestKind: "render",
        latencyMs: Date.now() - startedAt,
      });

      const data = {
        url,
        durationSec,
        width: WIDTH,
        height: HEIGHT,
        hasAudio: !!audioPath,
        bytes: videoBuf.length,
      };

      return {
        output: data,
        assets: [
          {
            kind: "Cuts",
            title: "Final video",
            data,
            storageRef: ref,
            meta: { durationSec, bytes: videoBuf.length },
            visual: true,
          },
        ],
        actualCredits: creditsForRender(),
        projectPatch: { thumb: images[0]?.url },
      };
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  },
};

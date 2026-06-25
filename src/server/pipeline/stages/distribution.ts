import { db } from "@/db";
import { uploads } from "@/db/schema";
import { creditsForPublish } from "@/server/credits/costs";
import { getGoogleAccessToken } from "@/server/google/token";
import {
  MockYouTubeUploader,
  ResumableYouTubeUploader,
  type YouTubeUploader,
} from "@/server/providers/youtube/uploader";
import type { Stage, StageContext, StageResult } from "../types";

interface CutsOut {
  url?: string;
  durationSec?: number;
}

/** Next 9:00 / 13:00 / 18:00 slot in the future (simple auto-schedule heuristic). */
function nextPublishAt(now = new Date()): Date {
  const slots = [9 * 60, 13 * 60, 18 * 60];
  const mins = now.getHours() * 60 + now.getMinutes();
  for (const s of slots) {
    if (s > mins + 5) {
      const r = new Date(now);
      r.setHours(Math.floor(s / 60), s % 60, 0, 0);
      return r;
    }
  }
  const r = new Date(now);
  r.setDate(r.getDate() + 1);
  r.setHours(Math.floor(slots[0] / 60), 0, 0, 0);
  return r;
}

/** Publishes/schedules the finished video to YouTube (real via OAuth, else mock). */
export const distributionStage: Stage = {
  key: "distribution",
  label: "Distribution",
  implemented: true,

  estimateCredits() {
    return creditsForPublish();
  },

  async run(ctx: StageContext): Promise<StageResult> {
    const { project, storage } = ctx;

    const cuts = ctx.priorOutputs.cuts as CutsOut | undefined;
    if (!cuts?.url) {
      throw new Error("Distribution needs a finished video from Cuts — none found.");
    }
    const ref = `projects/${project.id}/cuts/final.mp4`;
    const buffer = await storage.get(ref);

    const token = await getGoogleAccessToken(project.userId);
    const uploader: YouTubeUploader = token
      ? new ResumableYouTubeUploader()
      : new MockYouTubeUploader();

    const publishAt = nextPublishAt();
    const result = await uploader.upload({
      accessToken: token ?? "",
      buffer,
      title: project.title,
      description: project.prompt,
      privacyStatus: "private",
      publishAt,
    });

    await ctx.recordUsage({
      provider: "youtube",
      requestKind: result.mock ? "upload-mock" : "upload",
      raw: { videoId: result.videoId },
    });

    await db.insert(uploads).values({
      projectId: project.id,
      channelId: project.channelId,
      userId: project.userId,
      platform: "youtube",
      kind: "Cuts",
      externalId: result.videoId,
      url: result.url,
      title: project.title,
      thumb: project.thumb,
      status: "scheduled",
      publishAt,
      privacyStatus: "private",
      mock: !!result.mock,
    });

    return {
      output: {
        videoId: result.videoId,
        url: result.url,
        publishAt: publishAt.toISOString(),
        status: "scheduled",
        privacyStatus: "private",
        mock: !!result.mock,
      },
      assets: [],
      actualCredits: creditsForPublish(),
      projectPatch: { status: "Scheduled" },
    };
  },
};

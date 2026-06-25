import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  assets,
  channels,
  projects,
  stageRuns,
  uploads,
  type Asset,
  type Project,
  type ProjectStatus,
  type StageRun,
  type Upload,
} from "@/db/schema";
import { getBalance } from "@/server/credits/service";
import { initProject } from "@/server/pipeline/engine";
import { SCHEDULE_TODAY_INDEX } from "@/lib/studio";
import type {
  AssetKind as UiAssetKind,
  LibraryItem,
  Project as UiProject,
  ProjectStatus as UiProjectStatus,
  ScheduledUpload,
  UploadStatus as UiUploadStatus,
  VideoFormat,
} from "@/lib/studio";

export interface CreateProjectInput {
  userId: string;
  channelId: string;
  prompt: string;
  mode: "single" | "series";
  formats: string[];
  aspectRatio: string;
  duration: string;
  voice: string;
}

export async function createProject(
  input: CreateProjectInput,
): Promise<{ projectId: string }> {
  const channel = await db.query.channels.findFirst({
    where: eq(channels.id, input.channelId),
  });
  if (!channel) throw new Error("Channel not found");
  if (channel.userId && channel.userId !== input.userId) {
    throw new Error("Channel does not belong to this user");
  }

  const [project] = await db
    .insert(projects)
    .values({
      channelId: input.channelId,
      userId: input.userId,
      title: input.prompt.slice(0, 80) || "Untitled project",
      prompt: input.prompt,
      mode: input.mode,
      formats: input.formats,
      aspectRatio: input.aspectRatio,
      duration: input.duration,
      voice: input.voice,
      thumb: channel.image,
      status: "Rendering",
    })
    .returning();

  await initProject(project.id);
  return { projectId: project.id };
}

export interface ProjectDetail {
  project: Project;
  stages: StageRun[];
  assets: Asset[];
}

export async function getProjectDetail(
  projectId: string,
  userId: string,
): Promise<ProjectDetail | null> {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
  });
  if (!project) return null;
  const stages = await db.query.stageRuns.findMany({
    where: eq(stageRuns.projectId, projectId),
    orderBy: [asc(stageRuns.ord)],
  });
  const projectAssets = await db.query.assets.findMany({
    where: eq(assets.projectId, projectId),
    orderBy: [desc(assets.createdAt)],
  });
  return { project, stages, assets: projectAssets };
}

/* ------------------------------- UI mappers ------------------------------- */

function relativeTime(d: Date): string {
  const secs = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

function uiStatus(s: ProjectStatus): UiProjectStatus {
  return s === "Failed" ? "Draft" : s;
}

function uiFormat(formats: string[]): VideoFormat {
  return formats.includes("long") ? "Long-form" : "Short";
}

function toUiProject(p: Project): UiProject {
  return {
    id: p.id,
    channelId: p.channelId,
    title: p.title,
    thumb: p.thumb || "/images/tech.jpg",
    format: uiFormat(p.formats),
    status: uiStatus(p.status),
    editedLabel: `Edited ${relativeTime(p.updatedAt)}`,
  };
}

const UI_KINDS = new Set<UiAssetKind>([
  "Long-form",
  "Short",
  "Cuts",
  "Thumbnail",
  "Script",
  "Voiceover",
  "ResearchBrief",
  "Materials",
  "Storyboard",
  "Image",
  "Video",
]);

function uiKind(kind: string): UiAssetKind {
  return UI_KINDS.has(kind as UiAssetKind) ? (kind as UiAssetKind) : "Short";
}

function metaString(asset: Asset): string {
  const m = asset.meta ?? {};
  if (typeof m.wordCount === "number") return `${m.wordCount} words`;
  if (typeof m.sources === "number") return `${m.sources} sources`;
  if (typeof m.count === "number") return `${m.count} clips`;
  if (typeof m.shots === "number") return `${m.shots} shots`;
  return asset.kind;
}

export async function listProjectsForChannel(
  channelId: string,
  userId: string,
): Promise<UiProject[]> {
  const rows = await db.query.projects.findMany({
    where: and(eq(projects.channelId, channelId), eq(projects.userId, userId)),
    orderBy: [desc(projects.updatedAt)],
  });
  return rows.map(toUiProject);
}

export async function listLibraryForChannel(
  channelId: string,
  userId: string,
): Promise<LibraryItem[]> {
  const rows = await db
    .select({ asset: assets, project: projects })
    .from(assets)
    .innerJoin(projects, eq(assets.projectId, projects.id))
    .where(and(eq(projects.channelId, channelId), eq(projects.userId, userId)))
    .orderBy(desc(assets.createdAt));

  return rows.map(({ asset, project }) => ({
    id: asset.id,
    channelId: project.channelId,
    title: asset.title || asset.kind,
    thumb: project.thumb || "/images/tech.jpg",
    kind: uiKind(asset.kind),
    visual: asset.visual,
    status: uiStatus(asset.status),
    editedLabel: `Edited ${relativeTime(asset.createdAt)}`,
    meta: metaString(asset),
  }));
}

const UPLOAD_STATUS_MAP: Record<Upload["status"], UiUploadStatus> = {
  scheduled: "Scheduled",
  processing: "Rendering",
  published: "Published",
  failed: "Draft",
};

/** Map a stored upload onto the calendar's relative-day model (anchored at real today). */
function toScheduledUpload(u: Upload): ScheduledUpload | null {
  const when = u.publishAt ?? u.createdAt;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(when);
  day.setHours(0, 0, 0, 0);
  const daysFromNow = Math.round((day.getTime() - today.getTime()) / 86_400_000);
  const dayIndex = SCHEDULE_TODAY_INDEX + daysFromNow;
  if (dayIndex < 0 || dayIndex > 13) return null; // outside the 14-day window
  const t = new Date(when);
  return {
    id: u.id,
    channelId: u.channelId,
    title: u.title || "Untitled",
    thumb: u.thumb || "/images/tech.jpg",
    visual: true,
    kind: u.kind as UiAssetKind,
    status: UPLOAD_STATUS_MAP[u.status],
    dayIndex,
    minutes: t.getHours() * 60 + t.getMinutes(),
    timeLabel: t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    autopilot: true,
  };
}

export async function listScheduleForChannel(
  channelId: string,
  userId: string,
): Promise<ScheduledUpload[]> {
  const rows = await db.query.uploads.findMany({
    where: and(eq(uploads.channelId, channelId), eq(uploads.userId, userId)),
    orderBy: [asc(uploads.publishAt)],
  });
  return rows
    .map(toScheduledUpload)
    .filter((x): x is ScheduledUpload => x !== null);
}

export async function getCreditBalance(userId: string): Promise<number> {
  return getBalance(userId);
}

"use server";

import { auth } from "@/server/auth";
import { createProject } from "@/server/projects/service";

export interface CreateProjectActionInput {
  channelId: string;
  prompt: string;
  mode: "single" | "series";
  formats: string[];
  aspectRatio: string;
  duration: string;
  voice: string;
}

export type ActionResult<T = unknown> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

/** Create a project from the New Idea composer and kick off the pipeline. */
export async function createProjectAction(
  input: CreateProjectActionInput,
): Promise<ActionResult<{ projectId: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  if (!input.prompt?.trim()) return { ok: false, error: "Describe your idea first." };
  if (!input.formats?.length)
    return { ok: false, error: "Pick at least one output format." };

  try {
    const { projectId } = await createProject({
      userId: session.user.id,
      channelId: input.channelId,
      prompt: input.prompt.trim(),
      mode: input.mode,
      formats: input.formats,
      aspectRatio: input.aspectRatio,
      duration: input.duration,
      voice: input.voice,
    });
    return { ok: true, projectId };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

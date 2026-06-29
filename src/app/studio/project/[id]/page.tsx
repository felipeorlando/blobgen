import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProjectDetailView } from "@/components/studio/project-detail-view";
import type { ProjectDetailView as DetailData } from "@/hooks/use-project-poll";
import { auth } from "@/server/auth";
import { getProjectDetail } from "@/server/projects/service";

export const metadata: Metadata = { title: "Project" };

export default async function ProjectPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const detail = await getProjectDetail(id, session.user.id);
  if (!detail) notFound();

  const initial: DetailData = {
    project: {
      id: detail.project.id,
      title: detail.project.title,
      prompt: detail.project.prompt,
      status: detail.project.status,
      channelId: detail.project.channelId,
      thumb: detail.project.thumb,
      currentStageKey: detail.project.currentStageKey,
      formats: detail.project.formats,
      duration: detail.project.duration,
    },
    stages: detail.stages.map((s) => ({
      id: s.id,
      stageKey: s.stageKey,
      ord: s.ord,
      status: s.status,
      attempt: s.attempt,
      output: s.output,
      error: s.error,
      estimatedCredits: s.estimatedCredits,
      actualCredits: s.actualCredits,
    })),
    assets: detail.assets.map((a) => ({
      id: a.id,
      stageRunId: a.stageRunId,
      kind: a.kind,
      title: a.title,
      data: a.data,
      storageRef: a.storageRef,
      meta: a.meta,
      visual: a.visual,
    })),
  };

  return <ProjectDetailView projectId={id} initial={initial} />;
}

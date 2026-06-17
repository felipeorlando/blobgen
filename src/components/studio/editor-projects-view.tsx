"use client";

import Image from "next/image";
import Link from "next/link";
import { Clapperboard, Plus, Scissors, Smartphone, Wand2 } from "lucide-react";
import { getProjects, type Project } from "@/lib/studio";
import { useStudio } from "./studio-context";
import { StudioTopbar } from "./studio-topbar";
import { Reveal } from "./reveal";

function EditCard({ project, index }: { project: Project; index: number }) {
  return (
    <Reveal delay={Math.min(index, 8) * 45}>
      <Link
        href={`/studio/editor/${project.id}`}
        className="group block overflow-hidden rounded-lg border border-border bg-card transition-[transform,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:border-foreground/15"
      >
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={project.thumb}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10" />
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-black/45 px-2 py-0.5 text-[0.68rem] font-semibold text-white backdrop-blur">
            {project.format === "Short" ? (
              <Smartphone className="size-3" />
            ) : (
              <Clapperboard className="size-3" />
            )}
            {project.format}
          </span>
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/90 px-3 py-1.5 text-sm font-semibold text-black shadow-lg">
              <Scissors className="size-4" />
              Open editor
            </span>
          </span>
        </div>
        <div className="p-3.5">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
            {project.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{project.editedLabel}</p>
        </div>
      </Link>
    </Reveal>
  );
}

export function EditorProjectsView() {
  const { channel, channelId } = useStudio();
  const projects = getProjects(channelId);

  return (
    <>
      <StudioTopbar title="Editor" subtitle={channel.name}>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary/90 active:scale-[0.97] motion-reduce:transition-none"
        >
          <Plus className="size-4" />
          New edit
        </button>
      </StudioTopbar>

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8">
        <Reveal>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <Wand2 className="size-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Edit a pre-generated video
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Open any project to recut it, swap scenes, and drop in images,
                clips, voiceovers, and music from Labs and your media library.
              </p>
            </div>
          </div>
        </Reveal>

        <h2 className="mt-8 text-base font-semibold tracking-tight text-foreground">
          Editable projects in {channel.name}
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p, i) => (
            <EditCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}

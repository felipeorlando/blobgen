"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock,
  FolderOpen,
  Loader2,
  PencilLine,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Project, type ProjectStatus } from "@/lib/studio";
import { listProjectsAction } from "@/server/actions/data";
import { useStudio } from "./studio-context";

const STATUS_STYLE: Record<
  ProjectStatus,
  { className: string; icon: typeof Clock; spin?: boolean }
> = {
  Published: {
    className: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  Scheduled: {
    className: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
    icon: Clock,
  },
  Rendering: {
    className: "bg-amber-500/14 text-amber-600 dark:text-amber-400",
    icon: Loader2,
    spin: true,
  },
  Draft: {
    className: "bg-muted text-muted-foreground",
    icon: PencilLine,
  },
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.68rem] font-semibold backdrop-blur",
        s.className,
      )}
    >
      <s.icon
        className={cn("size-3", s.spin && "animate-spin motion-reduce:animate-none")}
      />
      {status}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group w-[260px] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-card transition-[transform,border-color] ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:border-foreground/15">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={project.thumb}
          alt=""
          fill
          sizes="260px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10" />
        <div className="absolute left-2.5 top-2.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/45 px-2 py-0.5 text-[0.68rem] font-semibold text-white backdrop-blur">
            {project.format === "Short" ? (
              <Smartphone className="size-3" />
            ) : (
              <Clapperboard className="size-3" />
            )}
            {project.format}
          </span>
        </div>
        <div className="absolute right-2.5 top-2.5">
          <StatusBadge status={project.status} />
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
          {project.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {project.editedLabel}
        </p>
      </div>
    </article>
  );
}

export function ProjectsGrid() {
  const { channelId, channel } = useStudio();
  const [projects, setProjects] = useState<Project[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    listProjectsAction(channelId).then((p) => {
      if (active) setProjects(p);
    });
    return () => {
      active = false;
    };
  }, [channelId]);

  function slide(dir: 1 | -1) {
    scroller.current?.scrollBy({ left: dir * 288, behavior: "smooth" });
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FolderOpen className="size-[18px] text-muted-foreground" />
          <h2 className="text-base font-semibold tracking-tight">
            Projects in {channel.name}
          </h2>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {projects.length}
          </span>
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          <button
            type="button"
            aria-label="Previous projects"
            onClick={() => slide(-1)}
            className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.97]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="More projects"
            onClick={() => slide(1)}
            className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.97]"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {projects.length > 0 ? (
        <div
          ref={scroller}
          className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [scroll-padding-left:0px]"
        >
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/studio/project/${p.id}`}
              className="shrink-0 snap-start"
            >
              <ProjectCard project={p} />
            </Link>
          ))}
          {/* trailing spacer so the last card isn't flush to the edge */}
          <div className="w-px shrink-0" aria-hidden />
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <FolderOpen className="size-7 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium text-foreground">
            Nothing here yet
          </p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Generate something above and it will show up here.
          </p>
        </div>
      )}
    </section>
  );
}

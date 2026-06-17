"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  AudioLines,
  Clapperboard,
  Image as ImageIcon,
  Music,
  Play,
  Plus,
  Scissors,
  Sparkles,
  Type,
} from "lucide-react";
import { getProjectById } from "@/lib/studio";
import { waveformBars } from "@/lib/labs";

const SOURCE_TABS = [
  { icon: Clapperboard, label: "Clips" },
  { icon: ImageIcon, label: "Images" },
  { icon: AudioLines, label: "Voice" },
  { icon: Music, label: "Music" },
  { icon: Type, label: "Text" },
];

/** A faux timeline clip block. */
function Clip({ className }: { className: string }) {
  return (
    <div
      className={`h-full shrink-0 rounded-md border border-white/15 bg-gradient-to-b from-white/10 to-white/0 ${className}`}
    />
  );
}

export function EditorCanvasView({ projectId }: { projectId: string }) {
  const project = getProjectById(projectId);
  const title = project?.title ?? "Untitled edit";
  const bars = waveformBars(projectId, 80);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col lg:min-h-[100dvh]">
      {/* Editor top bar */}
      <div className="sticky top-14 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:top-0">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/studio/editor"
            aria-label="Back to editor projects"
            className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
            <p className="truncate text-[0.72rem] text-muted-foreground">
              Draft · auto-saved
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground opacity-60">
          Export
        </span>
      </div>

      {/* Coming-soon banner */}
      <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-700 sm:px-6 dark:text-amber-300">
        <Sparkles className="size-3.5 shrink-0" />
        Timeline editing is in design — this is a preview of the workspace. Sources,
        tracks, and export are coming soon.
      </div>

      {/* Workspace */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Source rail */}
        <aside className="border-b border-border lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="no-scrollbar flex gap-1 overflow-x-auto p-2 lg:flex-col">
            {SOURCE_TABS.map((t, i) => (
              <button
                key={t.label}
                type="button"
                className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  i === 0
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <t.icon className="size-4" />
                {t.label}
              </button>
            ))}
          </div>
          <div className="hidden grid-cols-2 gap-2 p-2 lg:grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video rounded-md border border-dashed border-border bg-muted/40"
              />
            ))}
          </div>
        </aside>

        {/* Preview */}
        <div className="flex flex-1 items-center justify-center bg-muted/20 p-6">
          <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-black shadow-sm">
            {project ? (
              <Image
                src={project.thumb}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 672px"
                className="object-cover opacity-80"
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
                <Play className="ml-1 size-7" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="border-t border-border bg-card/50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Scissors className="size-3.5" />
            Split
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Plus className="size-3.5" />
            Add track
          </button>
        </div>

        {/* Video track */}
        <div className="flex h-12 items-center gap-1.5 rounded-md bg-muted/50 p-1.5">
          <Clip className="w-1/4 from-sky-400/25" />
          <Clip className="w-1/3 from-violet-400/25" />
          <Clip className="w-1/5 from-emerald-400/25" />
          <Clip className="w-1/4 from-amber-400/25" />
        </div>

        {/* Audio track (waveform) */}
        <div className="mt-1.5 flex h-10 items-center gap-[2px] rounded-md bg-muted/50 px-2">
          {bars.map((b, i) => (
            <span
              key={i}
              style={{ height: `${Math.round(b * 80)}%` }}
              className="flex-1 rounded-full bg-primary/30"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

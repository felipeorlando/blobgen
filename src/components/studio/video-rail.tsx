"use client";

import Image from "next/image";
import { Clapperboard, ListVideo, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { compact, type Video } from "@/lib/studio";

function retentionTone(v: number) {
  if (v >= 58) return "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400";
  if (v >= 45) return "bg-amber-500/14 text-amber-600 dark:text-amber-400";
  return "bg-rose-500/12 text-rose-600 dark:text-rose-400";
}

export function VideoRail({
  videos,
  selectedId,
  onSelect,
}: {
  videos: Video[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="card-surface rounded-lg border border-border">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2">
          <ListVideo className="size-4 text-muted-foreground" />
          <h2 className="text-base font-semibold tracking-tight">
            Recent uploads
          </h2>
        </div>
        {selectedId ? (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Show channel average
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">
            {videos.length} videos
          </span>
        )}
      </div>

      <div className="divide-y divide-border/70">
        {videos.map((v) => {
          const active = v.id === selectedId;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(active ? null : v.id)}
              aria-pressed={active}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors sm:px-4",
                active ? "bg-primary/[0.06]" : "hover:bg-muted/50",
              )}
            >
              <span className="relative shrink-0">
                <Image
                  src={v.thumb}
                  alt=""
                  width={88}
                  height={56}
                  className={cn(
                    "h-11 w-[68px] rounded-lg object-cover ring-1 ring-inset ring-black/10 dark:ring-white/10",
                    active && "ring-2 ring-primary/50",
                  )}
                />
                <span className="absolute bottom-0.5 right-0.5 rounded bg-black/65 px-1 font-mono text-[0.58rem] font-medium text-white">
                  {v.durationLabel}
                </span>
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "flex items-center gap-1.5 truncate text-sm font-semibold",
                    active ? "text-foreground" : "text-foreground/90",
                  )}
                >
                  {v.format === "Short" ? (
                    <Smartphone className="size-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <Clapperboard className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{v.title}</span>
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.7rem]">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 font-semibold tabular-nums",
                      retentionTone(v.retention),
                    )}
                  >
                    {v.retention}% ret
                  </span>
                  <span className="rounded bg-sky-500/12 px-1.5 py-0.5 font-semibold tabular-nums text-sky-600 dark:text-sky-400">
                    {v.ctr}% CTR
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {compact(v.views)} views
                  </span>
                  <span className="ml-auto text-muted-foreground/70">
                    {v.publishedLabel}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

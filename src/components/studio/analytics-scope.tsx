"use client";

import Image from "next/image";
import { Check, ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { compact, type Channel, type Video } from "@/lib/studio";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./popover";

/**
 * Single top-of-page control for the analytics scope: the whole channel
 * ("All videos") or one specific upload. Replaces the inline selectable rail.
 */
export function AnalyticsScope({
  channel,
  videos,
  selectedId,
  onSelect,
  channelRetention,
}: {
  channel: Channel;
  videos: Video[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  channelRetention: number;
}) {
  const selected = videos.find((v) => v.id === selectedId) ?? null;

  return (
    <Popover>
      <PopoverTrigger className="group inline-flex h-9 w-full max-w-[280px] items-center gap-2 rounded-md border border-border bg-card py-1 pl-1.5 pr-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted aria-expanded:bg-muted">
        <Image
          src={selected ? selected.thumb : channel.image}
          alt=""
          width={72}
          height={48}
          className="h-6 w-9 shrink-0 rounded-[4px] object-cover"
        />
        <span className="truncate">{selected ? selected.title : "All videos"}</span>
        <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" className="w-[340px] p-1.5">
        <p className="px-2 pb-1 pt-1 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
          Analytics scope
        </p>

        <PopoverClose
          onClick={() => onSelect(null)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted",
            !selected && "bg-muted/60",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[5px] bg-muted">
            <Layers className="size-4 text-muted-foreground" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-foreground">
              All videos
            </span>
            <span className="block text-xs text-muted-foreground tabular-nums">
              Channel average · {channelRetention}% retention
            </span>
          </span>
          {!selected ? (
            <Check className="size-4 shrink-0 text-primary" />
          ) : null}
        </PopoverClose>

        <div className="my-1 h-px bg-border/70" />
        <p className="px-2 pb-1 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
          Per video
        </p>

        <div className="no-scrollbar max-h-72 overflow-y-auto">
          {videos.map((v) => {
            const active = v.id === selectedId;
            return (
              <PopoverClose
                key={v.id}
                onClick={() => onSelect(v.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted",
                  active && "bg-muted/60",
                )}
              >
                <Image
                  src={v.thumb}
                  alt=""
                  width={104}
                  height={72}
                  className="h-9 w-[52px] shrink-0 rounded-[5px] object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {v.title}
                  </span>
                  <span className="block text-xs text-muted-foreground tabular-nums">
                    {v.retention}% retention · {compact(v.views)} views
                  </span>
                </span>
                {active ? (
                  <Check className="size-4 shrink-0 text-primary" />
                ) : null}
              </PopoverClose>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

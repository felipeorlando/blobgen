"use client";

import Image from "next/image";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { compact } from "@/lib/studio";
import { useStudio } from "./studio-context";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./popover";

/**
 * Compact channel picker for the sidebar footer: shows the active channel and
 * opens a popover to switch between channels — replaces the always-open list.
 */
export function ChannelSwitcher() {
  const { channels, channel, channelId, setChannelId } = useStudio();

  return (
    <Popover>
      <PopoverTrigger className="group flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/60 aria-expanded:bg-muted/60">
        <Image
          src={channel.image}
          alt=""
          width={40}
          height={40}
          className="size-9 shrink-0 rounded-lg object-cover ring-1 ring-inset ring-black/10 dark:ring-white/10"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {channel.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {compact(channel.subscribers)} subscribers
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground transition-colors group-aria-expanded:text-foreground" />
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="w-[256px] p-1.5"
      >
        <p className="px-2 pb-1 pt-1 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
          Switch channel
        </p>

        <div className="no-scrollbar max-h-[280px] overflow-y-auto">
          {channels.map((c) => {
            const active = c.id === channelId;
            return (
              <PopoverClose
                key={c.id}
                onClick={() => setChannelId(c.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted",
                  active && "bg-muted/60",
                )}
              >
                <Image
                  src={c.image}
                  alt=""
                  width={36}
                  height={36}
                  className={cn(
                    "size-8 shrink-0 rounded-lg object-cover ring-1 ring-inset ring-black/10 dark:ring-white/10",
                    active && "ring-2 ring-primary/60",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {c.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {compact(c.subscribers)} subscribers
                  </span>
                </span>
                {active ? (
                  <Check className="size-4 shrink-0 text-primary" />
                ) : null}
              </PopoverClose>
            );
          })}
        </div>

        <div className="my-1 h-px bg-border/70" />

        <PopoverClose className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-border">
            <Plus className="size-4" />
          </span>
          Add channel
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

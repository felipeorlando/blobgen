"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  Film,
  Image as ImageIcon,
  Music,
  Play,
  Plus,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMedia,
  MEDIA_KINDS,
  waveformBars,
  type MediaItem,
  type MediaKind,
} from "@/lib/labs";
import { useStudio } from "./studio-context";
import { StudioTopbar } from "./studio-topbar";

const KIND_ICON: Record<MediaKind, LucideIcon> = {
  image: ImageIcon,
  video: Film,
  sound: Music,
};

function SelectMark({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-md border-2 transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-white/80 bg-black/30 text-transparent backdrop-blur",
      )}
    >
      <Check className="size-3.5" strokeWidth={3} />
    </span>
  );
}

function SourceBadge({ source }: { source: MediaItem["source"] }) {
  return (
    <span className="rounded bg-black/55 px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-white backdrop-blur">
      {source}
    </span>
  );
}

function Tile({
  item,
  selected,
  onToggle,
}: {
  item: MediaItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = KIND_ICON[item.kind];

  if (item.kind === "sound") {
    const bars = waveformBars(item.id, 40);
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        className={cn(
          "group flex flex-col rounded-lg border bg-card p-3 text-left transition-colors",
          selected ? "border-primary/50 ring-1 ring-primary/30" : "border-border hover:border-foreground/15",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/12 text-primary">
            <Play className="ml-0.5 size-3.5" />
          </span>
          <SelectMark selected={selected} />
        </div>
        <div className="my-3 flex h-12 items-center gap-[2px]">
          {bars.map((b, i) => (
            <span
              key={i}
              style={{ height: `${Math.round(b * 100)}%` }}
              className="flex-1 rounded-full bg-primary/30"
            />
          ))}
        </div>
        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
          <Icon className="size-3" />
          {item.meta}
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "group block overflow-hidden rounded-lg border text-left transition-colors",
        selected ? "border-primary/60 ring-1 ring-primary/30" : "border-border hover:border-foreground/15",
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          src={item.thumb!}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 50vw, 280px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        {item.kind === "video" ? (
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex size-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
              <Play className="ml-0.5 size-5" />
            </span>
          </span>
        ) : null}
        <span className="absolute left-2 top-2">
          <SourceBadge source={item.source} />
        </span>
        <span className="absolute right-2 top-2">
          <SelectMark selected={selected} />
        </span>
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-black/65 px-1.5 py-0.5 text-[0.62rem] font-medium text-white backdrop-blur">
          <Icon className="size-3" />
          {item.meta}
        </span>
      </div>
      <p className="truncate px-2.5 py-2 text-sm font-medium text-foreground">
        {item.title}
      </p>
    </button>
  );
}

export function MediaBrowserView() {
  const { channel } = useStudio();
  const [kind, setKind] = useState<MediaKind | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return getMedia(kind).filter(
      (m) => q === "" || m.title.toLowerCase().includes(q),
    );
  }, [kind, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const count = selected.size;

  return (
    <>
      <StudioTopbar title="Media" subtitle={`${channel.name} · images, video & sound`} />

      <div className="mx-auto max-w-[1440px] px-5 py-8 pb-28 sm:px-8">
        {/* Controls */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
            {MEDIA_KINDS.map((k) => {
              const active = k.id === kind;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 rounded-md px-3 py-1.5 text-[0.82rem] font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-foreground ring-1 ring-inset ring-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {k.label}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 lg:w-72 lg:flex-none">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search media"
              className="h-9 w-full rounded-md border border-border bg-card pl-8 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/20"
            />
          </div>
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <Search className="size-7 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium text-foreground">No media found</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Try another tab or search term.
            </p>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((m) => (
              <Tile
                key={m.id}
                item={m}
                selected={selected.has(m.id)}
                onToggle={() => toggle(m.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selection action bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 transition-transform duration-300 ease-out lg:left-[280px]",
          count > 0 ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-5 mb-4 flex max-w-[640px] items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-xl sm:mx-auto">
          <span className="text-sm font-medium text-foreground">
            {count} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
              Clear
            </button>
            <Link
              href="/studio/editor"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 hover:bg-primary/90 active:scale-[0.97]"
            >
              <Plus className="size-4" />
              Use in editor
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

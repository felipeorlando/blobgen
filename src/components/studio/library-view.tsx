"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  CheckCircle2,
  Clapperboard,
  Clock,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Loader2,
  PencilLine,
  Scissors,
  Search,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getLibrary,
  type AssetKind,
  type LibraryItem,
  type ProjectStatus,
} from "@/lib/studio";
import { useStudio } from "./studio-context";
import { StudioTopbar } from "./studio-topbar";
import { listLibraryAction } from "@/server/actions/data";

const KIND_ICON: Record<AssetKind, LucideIcon> = {
  "Long-form": Clapperboard,
  Short: Smartphone,
  Cuts: Scissors,
  Thumbnail: ImageIcon,
  Script: FileText,
  Voiceover: AudioLines,
  ResearchBrief: Sparkles,
  Materials: ImageIcon,
  Storyboard: LayoutGrid,
  Image: ImageIcon,
  Video: Clapperboard,
};

const STATUS: Record<
  ProjectStatus,
  { cls: string; icon: LucideIcon; spin?: boolean }
> = {
  Published: {
    cls: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  Scheduled: { cls: "bg-sky-500/12 text-sky-600 dark:text-sky-400", icon: Clock },
  Rendering: {
    cls: "bg-amber-500/14 text-amber-600 dark:text-amber-400",
    icon: Loader2,
    spin: true,
  },
  Draft: { cls: "bg-muted text-muted-foreground", icon: PencilLine },
};

const KIND_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Long-form", label: "Long-form" },
  { id: "Short", label: "Shorts" },
  { id: "Cuts", label: "Cuts" },
  { id: "Thumbnail", label: "Thumbnails" },
  { id: "Script", label: "Scripts" },
  { id: "Voiceover", label: "Voiceovers" },
];

function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.68rem] font-semibold backdrop-blur",
        s.cls,
      )}
    >
      <s.icon
        className={cn("size-3", s.spin && "animate-spin motion-reduce:animate-none")}
      />
      {status}
    </span>
  );
}

function KindBadge({ kind, onTile }: { kind: AssetKind; onTile?: boolean }) {
  const Icon = KIND_ICON[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.68rem] font-semibold backdrop-blur",
        onTile
          ? "bg-black/45 text-white"
          : "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-3" />
      {kind}
    </span>
  );
}

function Media({ item }: { item: LibraryItem }) {
  const Icon = KIND_ICON[item.kind];
  if (item.visual) {
    return (
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          src={item.thumb}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Play button overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <svg className="ml-1 size-6 fill-black" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration badge (bottom-right) */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="inline-flex items-center rounded bg-black/75 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            {item.meta}
          </span>
        </div>

        <div className="absolute left-2.5 top-2.5">
          <KindBadge kind={item.kind} onTile />
        </div>
        <div className="absolute right-2.5 top-2.5">
          <StatusBadge status={item.status} />
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex aspect-video items-center justify-center bg-muted/40">
      <Icon className="size-9 text-muted-foreground/45" strokeWidth={1.5} />
      <div className="absolute left-2.5 top-2.5">
        <KindBadge kind={item.kind} />
      </div>
      <div className="absolute right-2.5 top-2.5">
        <StatusBadge status={item.status} />
      </div>
    </div>
  );
}

function LibraryCard({ item, index }: { item: LibraryItem; index: number }) {
  return (
    <article
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
      className="group animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500 cursor-pointer"
    >
      <div className="overflow-hidden rounded-lg">
        <Media item={item} />
      </div>
      <div className="pt-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-foreground/85 transition-colors">
          {item.title}
        </h3>
        <p className="mt-2 text-xs text-muted-foreground space-x-1">
          <span className="font-medium">{item.kind}</span>
          <span>·</span>
          <span>{item.editedLabel}</span>
        </p>
      </div>
    </article>
  );
}

function LibraryRow({ item }: { item: LibraryItem }) {
  const Icon = KIND_ICON[item.kind];
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 sm:px-4">
      {item.visual ? (
        <Image
          src={item.thumb}
          alt=""
          width={104}
          height={64}
          className="h-10 w-[64px] shrink-0 rounded-md object-cover ring-1 ring-inset ring-black/10 dark:ring-white/10"
        />
      ) : (
        <div className="flex h-10 w-[64px] shrink-0 items-center justify-center rounded-md bg-muted/50 ring-1 ring-inset ring-black/10 dark:ring-white/10">
          <Icon className="size-4 text-muted-foreground/60" strokeWidth={1.5} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          <span className="font-mono tabular-nums">{item.meta}</span> ·{" "}
          {item.editedLabel}
        </p>
      </div>
      <div className="hidden shrink-0 sm:block">
        <KindBadge kind={item.kind} />
      </div>
      <div className="shrink-0">
        <StatusBadge status={item.status} />
      </div>
    </div>
  );
}

export function LibraryView() {
  const { channel, channelId } = useStudio();
  const [real, setReal] = useState<LibraryItem[] | null>(null);
  // Show real generated assets when present; otherwise the demo library.
  const items = real && real.length > 0 ? real : getLibrary(channelId);
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    let active = true;
    listLibraryAction(channelId).then((r) => {
      if (active) setReal(r);
    });
    return () => {
      active = false;
    };
  }, [channelId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (it) =>
        (kind === "all" || it.kind === kind) &&
        (q === "" || it.title.toLowerCase().includes(q)),
    );
  }, [items, kind, query]);

  return (
    <>
      <StudioTopbar title="Library" subtitle={channel.name}>
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary/90 active:scale-[0.97] motion-reduce:transition-none"
        >
          <Sparkles className="size-4" />
          New idea
        </Link>
      </StudioTopbar>

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8">
        {/* Controls */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
            {KIND_FILTERS.map((f) => {
              const active = f.id === kind;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setKind(f.id)}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 rounded-md px-3 py-1.5 text-[0.82rem] font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-foreground ring-1 ring-inset ring-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-60 lg:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search library"
                className="h-9 w-full rounded-md border border-border bg-card pl-8 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/20"
              />
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
                className={cn(
                  "flex size-7 items-center justify-center rounded transition-colors",
                  view === "grid"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                aria-label="List view"
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
                className={cn(
                  "flex size-7 items-center justify-center rounded transition-colors",
                  view === "list"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <Search className="size-7 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No assets match
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Try a different filter or search term.
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((it, i) => (
              <LibraryCard key={it.id} item={it} index={i} />
            ))}
          </div>
        ) : (
          <div className="card-surface mt-6 divide-y divide-border/70 overflow-hidden rounded-lg border border-border">
            {filtered.map((it) => (
              <LibraryRow key={it.id} item={it} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

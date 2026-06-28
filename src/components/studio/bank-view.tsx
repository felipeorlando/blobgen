"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageOff, Loader2, Search, Star, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudio } from "./studio-context";
import { StudioTopbar } from "./studio-topbar";
import {
  deleteBankAction,
  favoriteBankAction,
  listBankAction,
  uploadBankAction,
  type BankItemView,
} from "@/server/actions/bank";

const SOURCE_FILTERS = [
  { id: "all", label: "All" },
  { id: "uploaded", label: "Brand uploads" },
  { id: "stock", label: "Stock" },
  { id: "generated", label: "Generated" },
] as const;

const SOURCE_BADGE: Record<string, string> = {
  uploaded: "bg-primary/15 text-primary",
  stock: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  generated: "bg-violet-500/14 text-violet-600 dark:text-violet-400",
};

export function BankView() {
  const { channel, channelId } = useStudio();
  const [items, setItems] = useState<BankItemView[] | null>(null);
  const [source, setSource] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => {
    listBankAction(channelId).then(setItems);
  }, [channelId]);

  useEffect(() => {
    setItems(null);
    refresh();
  }, [refresh]);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.set("file", file);
      const res = await uploadBankAction(channelId, form);
      if (!res.ok) setError(res.error ?? "Upload failed.");
    }
    setBusy(false);
    refresh();
  }

  async function onFavorite(id: string) {
    setItems((prev) =>
      prev
        ? prev.map((it) =>
            it.id === id ? { ...it, favorite: !it.favorite } : it,
          )
        : prev,
    );
    await favoriteBankAction(id);
    refresh();
  }

  async function onDelete(id: string) {
    setItems((prev) => (prev ? prev.filter((it) => it.id !== id) : prev));
    await deleteBankAction(id);
  }

  const all = items ?? [];
  const q = query.trim().toLowerCase();
  const filtered = all.filter(
    (it) =>
      (source === "all" || it.source === source) &&
      (q === "" || it.tags.some((t) => t.toLowerCase().includes(q))),
  );

  return (
    <>
      <StudioTopbar title="Image bank" subtitle={channel.name}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary/90 active:scale-[0.97] disabled:opacity-70 motion-reduce:transition-none"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <Upload className="size-4" />
          )}
          Upload
        </button>
      </StudioTopbar>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          void onFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Your brand&apos;s reusable visuals. The pipeline pulls from here first —
          reused assets keep {channel.name} visually consistent and cost{" "}
          <span className="font-medium text-foreground">
            0 generation credits
          </span>
          .
        </p>

        {/* Controls */}
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
            {SOURCE_FILTERS.map((f) => {
              const active = f.id === source;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSource(f.id)}
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
          <div className="relative lg:w-60">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by tag"
              className="h-9 w-full rounded-md border border-border bg-card pl-8 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/20"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-3 text-xs font-medium text-destructive">{error}</p>
        ) : null}

        {/* Grid */}
        {items === null ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground motion-reduce:animate-none" />
          </div>
        ) : filtered.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-10 flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-16 text-center transition-colors hover:border-foreground/25 hover:bg-muted/30"
          >
            <ImageOff className="size-7 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium text-foreground">
              {all.length === 0 ? "Your image bank is empty" : "No matches"}
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              {all.length === 0
                ? "Upload logos, intros and b-roll to reuse across every video."
                : "Try a different filter or tag."}
            </p>
          </button>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((it) => (
              <figure
                key={it.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-muted"
              >
                <div className="relative aspect-square">
                  <Image
                    src={it.url}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 50vw, 240px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide backdrop-blur",
                      SOURCE_BADGE[it.source] ?? "bg-black/45 text-white",
                    )}
                  >
                    {it.source}
                  </span>
                  <button
                    type="button"
                    aria-label="Favorite"
                    onClick={() => onFavorite(it.id)}
                    className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur transition-colors hover:bg-black/60"
                  >
                    <Star
                      className={cn(
                        "size-3.5",
                        it.favorite && "fill-amber-400 text-amber-400",
                      )}
                    />
                  </button>
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="truncate text-[0.66rem] font-medium text-white/90">
                    {it.useCount > 0 ? `Used ${it.useCount}×` : "Unused"}
                  </span>
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => onDelete(it.id)}
                    className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur transition-colors hover:bg-red-600"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

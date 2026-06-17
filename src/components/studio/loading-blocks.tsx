/**
 * Server-safe skeleton primitives shared by the studio route `loading.tsx`
 * files. No hooks, no "use client" — these are plain presentational blocks that
 * mirror each page's first paint to avoid layout shift.
 */

import { cn } from "@/lib/utils";

export function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 motion-reduce:animate-none",
        className,
      )}
    />
  );
}

/** Composer + results grid — used by the Lab generator routes. */
export function GeneratorLoading() {
  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-8 sm:px-8">
      <Block className="h-[180px] w-full rounded-lg" />
      <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Block key={i} className="aspect-video rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/** A filter row + a card grid — used by Media and Editor list routes. */
export function GridLoading({ cols = 8 }: { cols?: number }) {
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <Block className="h-9 w-64 max-w-[55%]" />
        <Block className="h-9 w-40 max-w-[30%]" />
      </div>
      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: cols }).map((_, i) => (
          <Block key={i} className="aspect-video rounded-lg" />
        ))}
      </div>
    </div>
  );
}

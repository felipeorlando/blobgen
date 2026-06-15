import Image from "next/image";
import { Upload } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TileData = {
  src: string;
  alt: string;
  portrait?: boolean;
  priority?: boolean;
};

// Justified bento: every tile is strictly 16:9 (landscape) or 9:16 (portrait).
// On desktop each row is a flex line where flex-grow is proportional to the
// aspect ratio, so tiles share one row height while keeping exact ratios.
// On smaller screens it collapses to a uniform 16:9 two-up grid.
const ROW_ONE: TileData[] = [
  { src: "/images/space.jpg", alt: "Planet Earth seen from space", portrait: true, priority: true },
  { src: "/images/motivation.jpg", alt: "Person on a ridge watching layered mountains at sunrise", priority: true },
  { src: "/images/city.jpg", alt: "City skyline at golden hour", priority: true },
  { src: "/images/lion.jpg", alt: "Portrait of a lion", portrait: true, priority: true },
];

const ROW_TWO: TileData[] = [
  { src: "/images/desk.jpg", alt: "Laptop and coffee on a wooden desk" },
  // UploadTile sits here (portrait), between the two landscapes.
  { src: "/images/mountains.jpg", alt: "Mountain range above the clouds at sunset" },
];

// Tiles are strictly 16:9 / 9:16. Desktop column widths are set proportional
// to the aspect ratios (below), which makes every tile in a row share one
// height while keeping exact framing.
const LANDSCAPE = "aspect-video";
const PORTRAIT = "aspect-video lg:aspect-[9/16]";

// Column tracks ∝ aspect ratio (16:9 = 1.7778, 9:16 = 0.5625), min 0 so the
// fr ratio — not content — decides the width.
const ROW_ONE_COLS =
  "lg:grid-cols-[minmax(0,0.5625fr)_minmax(0,1.7778fr)_minmax(0,1.7778fr)_minmax(0,0.5625fr)]";
const ROW_TWO_COLS =
  "lg:grid-cols-[minmax(0,1.7778fr)_minmax(0,0.5625fr)_minmax(0,1.7778fr)]";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="glow-radial" />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-grad-light">Keyword in.</span>
            <br />
            <span className="text-grad-red">YouTube Short out.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            blobgen.ai turns any topic into a finished YouTube Short—script,
            voiceover, visuals, captions, and upload or schedule. All on
            autopilot.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#pricing"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-12 w-full rounded-xl px-7 text-base font-semibold glow-red hover:bg-primary sm:w-auto",
              )}
            >
              Start for free
            </a>
            <a
              href="#use-cases"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "h-12 w-full rounded-xl px-7 text-base font-semibold sm:w-auto",
              )}
            >
              See examples
            </a>
          </div>
        </div>

        {/* Justified bento image showcase */}
        <div className="mx-auto mt-14 max-w-6xl space-y-3 sm:space-y-4">
          <div className={cn("grid grid-cols-2 gap-3 sm:gap-4", ROW_ONE_COLS)}>
            {ROW_ONE.map((tile) => (
              <Tile key={tile.src} {...tile} />
            ))}
          </div>
          <div className={cn("grid grid-cols-2 gap-3 sm:gap-4", ROW_TWO_COLS)}>
            <Tile {...ROW_TWO[0]} />
            <UploadTile className="col-span-2 order-last lg:order-none lg:col-span-1" />
            <Tile {...ROW_TWO[1]} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({
  src,
  alt,
  portrait,
  priority,
  className,
}: TileData & { className?: string }) {
  return (
    <div
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-2xl border border-border bg-card",
        portrait ? PORTRAIT : LANDSCAPE,
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 30vw, 50vw"
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/5" />
    </div>
  );
}

function UploadTile({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-card px-3 text-center card-surface",
        PORTRAIT,
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full border border-primary/40 text-primary">
        <Upload className="size-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">
        Upload to YouTube
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Schedule or publish in one click.
      </p>
    </div>
  );
}

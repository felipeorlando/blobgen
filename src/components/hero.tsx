import Image from "next/image";
import { Upload } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOP_TILES = [
  { src: "/images/mountains.jpg", alt: "Mountain range above the clouds at sunset" },
  { src: "/images/motivation.jpg", alt: "Person on a ridge watching layered mountains at sunrise" },
  { src: "/images/space.jpg", alt: "Planet Earth seen from space" },
  { src: "/images/lion.jpg", alt: "Portrait of a lion" },
];

const BOTTOM_TILES = [
  { src: "/images/desk.jpg", alt: "Laptop and coffee on a wooden desk" },
  { src: "/images/blueberries.jpg", alt: "Bowl of fresh blueberries" },
  { src: "/images/city.jpg", alt: "City skyline at golden hour" },
];

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

        {/* Image showcase grid */}
        <div className="mx-auto mt-14 max-w-6xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {TOP_TILES.map((tile) => (
              <Tile key={tile.src} {...tile} ratio="aspect-[4/5]" priority />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:grid-cols-4 sm:gap-4">
            {BOTTOM_TILES.map((tile) => (
              <Tile key={tile.src} {...tile} ratio="aspect-[16/11]" />
            ))}
            <UploadTile />
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({
  src,
  alt,
  ratio,
  priority,
}: {
  src: string;
  alt: string;
  ratio: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-card",
        ratio,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 640px) 25vw, 50vw"
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
    </div>
  );
}

function UploadTile() {
  return (
    <div className="relative flex aspect-[16/11] flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-card px-4 text-center card-surface">
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

import { AudioLines } from "lucide-react";

interface ProductionData {
  voiceover?: {
    url?: string;
    text?: string;
    durationSec?: number;
    mock?: boolean;
    error?: string;
  };
  images?: { url: string; shotIndex: number; mock?: boolean }[];
  errors?: string[];
}

export function ProductionOutput({ output }: { output: unknown }) {
  const data = (output ?? {}) as ProductionData;
  const vo = data.voiceover;
  const images = data.images ?? [];

  return (
    <div className="space-y-4">
      {vo ? (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
            <AudioLines className="size-3.5" /> Voiceover
          </p>
          {vo.error ? (
            <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {vo.error}
            </p>
          ) : vo.url ? (
            <audio
              src={vo.url}
              controls
              className="w-full"
              preload="none"
            />
          ) : (
            <p className="rounded-md border border-dashed border-border bg-muted/40 p-2 text-xs text-muted-foreground">
              Mock voiceover — set <code>REPLICATE_API_TOKEN</code> +{" "}
              <code>REPLICATE_TTS_MODEL</code> for real audio.
            </p>
          )}
          {vo.text ? (
            <p className="mt-1.5 line-clamp-3 text-xs text-foreground/70">
              {vo.text}
            </p>
          ) : null}
        </div>
      ) : null}

      {images.length ? (
        <div>
          <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
            Shot visuals ({images.length})
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.shotIndex}
                src={img.url}
                alt={`Shot ${img.shotIndex + 1}`}
                className="aspect-video w-full rounded-md border border-border object-cover"
              />
            ))}
          </div>
        </div>
      ) : null}

      {data.errors?.length ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Some media failed: {data.errors.join("; ")}
        </p>
      ) : null}
    </div>
  );
}

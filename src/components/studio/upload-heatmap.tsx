import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const LEVEL: Record<number, string> = {
  0: "bg-muted",
  1: "bg-primary/25",
  2: "bg-primary/45",
  3: "bg-primary/70",
  4: "bg-primary",
};

export function UploadHeatmap({ data }: { data: number[][] }) {
  const total = data.flat().filter((v) => v > 0).length;

  return (
    <div className="card-surface rounded-lg border border-border p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarRange className="size-4 text-muted-foreground" />
          <h2 className="text-base font-semibold tracking-tight">
            Upload cadence
          </h2>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {total} uploads
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <div className="flex flex-col justify-between py-0.5">
          {DAYS.map((d, i) => (
            <span
              key={i}
              className="font-mono text-[0.6rem] leading-none text-muted-foreground/70"
            >
              {d}
            </span>
          ))}
        </div>
        <div className="grid flex-1 grid-rows-7 gap-1.5">
          {data.map((row, ri) => (
            <div key={ri} className="grid grid-cols-10 gap-1.5">
              {row.map((level, ci) => (
                <div
                  key={ci}
                  title={`${level} uploads`}
                  className={cn(
                    "aspect-square rounded-[3px] ring-1 ring-inset ring-black/5 dark:ring-white/5",
                    LEVEL[level],
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5">
        <span className="text-[0.62rem] text-muted-foreground">Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span
            key={l}
            className={cn("size-3 rounded-[3px]", LEVEL[l])}
          />
        ))}
        <span className="text-[0.62rem] text-muted-foreground">More</span>
      </div>
    </div>
  );
}

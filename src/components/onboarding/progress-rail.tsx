"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "@/lib/onboarding";

/** Vertical stepper shown in the left rail on xl screens. */
export function ProgressRail({ current }: { current: number }) {
  return (
    <ol className="space-y-1">
      {WIZARD_STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === WIZARD_STEPS.length - 1;
        return (
          <li key={s.id} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-[0.72rem] font-semibold transition-colors duration-300",
                  done && "border-primary bg-primary text-primary-foreground",
                  active &&
                    "border-primary bg-primary/10 text-primary ring-4 ring-primary/10",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              {!last ? (
                <span
                  className={cn(
                    "my-1 w-px flex-1 transition-colors duration-300",
                    done ? "bg-primary/50" : "bg-border",
                  )}
                />
              ) : null}
            </div>

            <div className={cn("pb-5", last && "pb-0")}>
              <p
                className={cn(
                  "text-[0.66rem] font-semibold uppercase tracking-[0.12em] transition-colors",
                  active ? "text-primary" : "text-muted-foreground/60",
                )}
              >
                {s.eyebrow}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-[0.9rem] font-medium leading-tight transition-colors",
                  active || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.rail}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Compact horizontal progress shown above the form on smaller screens. */
export function MiniProgress({ current }: { current: number }) {
  const total = WIZARD_STEPS.length;
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-[0.74rem] font-semibold tabular-nums text-muted-foreground">
        Step {current + 1}
        <span className="text-muted-foreground/50"> / {total}</span>
      </span>
      <div className="flex flex-1 gap-1">
        {WIZARD_STEPS.map((s, i) => (
          <span
            key={s.id}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i <= current ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { STEPS } from "./data";
import { StepDetail } from "./details";
import { useAutoAdvance } from "./use-auto-advance";

const DURATION = 4200;
const LAST = STEPS.length - 1;

export function VariantSplit() {
  const { active, setActive, paused, setPaused } = useAutoAdvance(
    STEPS.length,
    DURATION,
  );

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]"
    >
      {/* left: step list threaded on a pipeline rail */}
      <ol className="flex flex-col">
        {STEPS.map((step, i) => {
          const isActive = i === active;
          const passed = i < active;
          const Icon = step.icon;
          return (
            <li key={step.id} className="flex items-stretch gap-4">
              {/* rail */}
              <div className="relative flex w-4 flex-col items-center">
                <span
                  className={cn(
                    "w-px flex-1 transition-colors duration-500",
                    i === 0
                      ? "bg-transparent"
                      : i <= active
                        ? "bg-primary"
                        : "bg-border",
                  )}
                />
                <span className="relative flex size-4 items-center justify-center">
                  {isActive ? (
                    <span className="absolute inline-flex size-4 animate-ping rounded-full bg-primary/40" />
                  ) : null}
                  <span
                    className={cn(
                      "relative size-2.5 rounded-full border-2 transition-all duration-300",
                      isActive
                        ? "scale-110 border-primary bg-primary shadow-[0_0_10px_2px] shadow-primary/50"
                        : passed
                          ? "border-primary bg-primary"
                          : "border-border bg-card",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "w-px flex-1 transition-colors duration-500",
                    i === LAST
                      ? "bg-transparent"
                      : i < active
                        ? "bg-primary"
                        : "bg-border",
                  )}
                />
              </div>

              {/* card */}
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "group relative my-1 w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
                  isActive
                    ? "border-primary/40 bg-card card-surface"
                    : "border-transparent bg-card/30 hover:border-border hover:bg-card/60",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300",
                      isActive
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-muted/50 text-muted-foreground dark:bg-background/50",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "flex items-baseline gap-1.5 text-sm font-semibold transition-colors",
                        isActive ? "text-foreground" : "text-foreground/75",
                      )}
                    >
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
                        0{step.n}
                      </span>
                      {step.label}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {step.blurb}
                    </p>
                  </div>
                </div>
                {isActive ? (
                  <span className="absolute inset-x-0 bottom-0 h-[3px] bg-primary/15">
                    <span
                      key={active}
                      className="block h-full origin-left bg-primary"
                      style={{
                        animation: `pipe-fill ${DURATION}ms linear forwards`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>

      {/* right: animated detail panel */}
      <div className="relative min-h-[440px] overflow-hidden rounded-3xl border border-border bg-card p-6 card-surface sm:p-8">
        <div className="glow-radial opacity-70" />
        <span
          key={`n-${active}`}
          className="pointer-events-none absolute right-5 top-1 select-none font-mono text-[7rem] font-bold leading-none text-foreground/[0.045] duration-700 animate-in fade-in-0 sm:text-[9rem]"
        >
          0{active + 1}
        </span>
        <div
          key={active}
          className="relative h-full duration-500 animate-in fade-in-0 zoom-in-[0.99] ease-out"
        >
          <StepDetail id={STEPS[active].id} />
        </div>
      </div>
    </div>
  );
}

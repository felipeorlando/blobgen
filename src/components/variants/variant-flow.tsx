"use client";

import { cn } from "@/lib/utils";
import { STEPS } from "./data";
import { StepDetail } from "./details";
import { useAutoAdvance } from "./use-auto-advance";

const DURATION = 3600;

// Node centres in a 6-column grid sit at (i + 0.5)/6. The wire runs between the
// first and last node centre; the active position is shared by the wire fill,
// the travelling pulse, the glow, and the caret so they all line up.
const FIRST = (0.5 / 6) * 100; // 8.333%
const SPAN = (5 / 6) * 100; // 83.333%

export function VariantFlow() {
  const { active, setActive, setPaused } = useAutoAdvance(STEPS.length, DURATION);

  const leadPct = FIRST + (active / 5) * SPAN;
  const caretPct = ((active + 0.5) / 6) * 100;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative px-1"
    >
      <div className="pipe-canvas pointer-events-none absolute inset-x-0 top-0 h-44" />

      {/* node flow */}
      <div className="relative">
        {/* wire track */}
        <div
          className="absolute top-6 h-0.5 -translate-y-1/2 rounded-full bg-border"
          style={{ left: `${FIRST}%`, right: `${FIRST}%` }}
        />
        {/* active-node glow */}
        <div
          className="pointer-events-none absolute top-6 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-2xl transition-[left] duration-500 ease-out"
          style={{ left: `${leadPct}%` }}
        />
        {/* wire fill with a continuously flowing sheen */}
        <div
          className="absolute top-6 h-[3px] -translate-y-1/2 overflow-hidden rounded-full transition-[width] duration-500 ease-out"
          style={{ left: `${FIRST}%`, width: `${(active / 5) * SPAN}%` }}
        >
          <div className="size-full bg-primary" />
          <div className="pipe-flow absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/85 to-transparent" />
        </div>
        {/* leading pulse */}
        <div
          className="absolute top-6 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-500 ease-out"
          style={{ left: `${leadPct}%` }}
        >
          <span className="absolute inset-0 m-auto size-2.5 animate-ping rounded-full bg-primary/60" />
          <span className="block size-2.5 rounded-full bg-primary shadow-[0_0_14px_3px] shadow-primary/60" />
        </div>

        <ol className="relative grid grid-cols-6">
          {STEPS.map((step, i) => {
            const passed = i < active;
            const isActive = i === active;
            const Icon = step.icon;
            return (
              <li
                key={step.id}
                className="flex flex-col items-center gap-2.5 text-center"
              >
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className="relative"
                  aria-label={step.label}
                >
                  {isActive ? (
                    <span className="absolute inset-0 -z-10 animate-ping rounded-2xl bg-primary/25" />
                  ) : null}
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl border transition-all duration-300",
                      isActive
                        ? "scale-110 border-primary bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg shadow-primary/25"
                        : passed
                          ? "border-primary/40 bg-primary/5 text-primary"
                          : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                </button>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground/50">
                    0{step.n}
                  </span>
                  <span
                    className={cn(
                      "px-1 text-[11px] font-medium transition-colors sm:text-xs",
                      isActive || passed
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.short}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* caret pointing at the active node */}
      <div className="relative mt-5 h-3">
        <span
          className="absolute top-0 size-3 -translate-x-1/2 rotate-45 rounded-[2px] border-l border-t border-border bg-card transition-[left] duration-500 ease-out"
          style={{ left: `${caretPct}%` }}
        />
      </div>

      {/* gliding detail card */}
      <div className="relative -mt-[7px] min-h-[360px] overflow-hidden rounded-3xl border border-border bg-card p-6 card-surface sm:p-8">
        <div className="glow-radial opacity-70" />
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

"use client";

import { cn } from "@/lib/utils";
import { STEPS } from "./data";
import { StepDetail } from "./details";
import { useAutoAdvance } from "./use-auto-advance";

const DURATION = 4000;
const PANEL = 520; // px, desktop panel width
const GAP = 24;

function trackSpotlight(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export function VariantSpotlight() {
  const { active, setActive, paused, setPaused } = useAutoAdvance(
    STEPS.length,
    DURATION,
  );

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* desktop: 3D coverflow rail */}
      <div className="hidden overflow-hidden [perspective:1600px] lg:block">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(${-active * (PANEL + GAP)}px)` }}
        >
          {/* leading spacer centres the active panel */}
          <div className="shrink-0" style={{ width: `calc(50% - ${PANEL / 2}px)` }} />
          {STEPS.map((step, i) => {
            const d = i - active;
            const isActive = d === 0;
            return (
              <div
                key={step.id}
                className="shrink-0"
                style={{ width: PANEL, marginRight: GAP }}
              >
                <Panel
                  active={isActive}
                  onSelect={() => setActive(i)}
                  style={{
                    transform: `translateZ(${isActive ? 0 : -110}px) rotateY(${
                      Math.max(-2, Math.min(2, d)) * -7
                    }deg) scale(${isActive ? 1 : 0.9})`,
                    opacity: isActive ? 1 : 0.4,
                    filter: isActive ? "none" : "blur(1px)",
                  }}
                >
                  <StepDetail id={step.id} />
                </Panel>
              </div>
            );
          })}
          <div className="shrink-0" style={{ width: `calc(50% - ${PANEL / 2}px)` }} />
        </div>
      </div>

      {/* mobile: single stacked panel */}
      <div className="lg:hidden">
        <Panel active onSelect={() => undefined} key={active}>
          <div className="duration-500 animate-in fade-in-0 slide-in-from-bottom-3">
            <StepDetail id={STEPS[active].id} />
          </div>
        </Panel>
      </div>

      {/* segmented indicator */}
      <ol className="mx-auto mt-8 flex max-w-md items-center gap-2">
        {STEPS.map((step, i) => {
          const isActive = i === active;
          const passed = i < active;
          return (
            <li key={step.id} className="flex-1">
              <button
                type="button"
                onClick={() => setActive(i)}
                className="block w-full py-1 active:scale-[0.97]"
                aria-label={step.label}
              >
                <span className="block h-1 overflow-hidden rounded-full bg-primary/15">
                  {passed ? (
                    <span className="block h-full w-full bg-primary" />
                  ) : isActive ? (
                    <span
                      key={active}
                      className="block h-full origin-left bg-primary"
                      style={{
                        animation: `pipe-fill ${DURATION}ms linear forwards`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "mt-2 block text-center font-mono text-[10px] tabular-nums transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground/60",
                  )}
                >
                  0{step.n}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Panel({
  active,
  onSelect,
  style,
  children,
}: {
  active: boolean;
  onSelect: () => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      onMouseMove={active ? trackSpotlight : undefined}
      onClick={active ? undefined : onSelect}
      style={style}
      className={cn(
        "group/panel relative flex min-h-[420px] flex-col rounded-[1.8rem] border p-6 transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:p-8",
        active
          ? "border-primary/40 bg-card card-surface"
          : "cursor-pointer border-border bg-card/40",
      )}
    >
      {active ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.8rem] opacity-0 transition-opacity duration-300 group-hover/panel:opacity-100"
          style={{
            background:
              "radial-gradient(260px circle at var(--mx,50%) var(--my,50%), oklch(0.62 0.24 26 / 0.16), transparent 70%)",
          }}
        />
      ) : null}
      <div className="relative flex flex-1 flex-col">{children}</div>
    </div>
  );
}

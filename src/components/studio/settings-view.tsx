"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Clapperboard,
  Gem,
  Lock,
  Minus,
  Plus,
  SlidersHorizontal,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  CADENCES,
  COST_CAP,
  DEFAULT_SETTINGS,
  MAX_SHORTS,
  QUALITY_TIERS,
  SETTINGS_STORAGE_KEY,
  VIDEO_SIZES,
  type StudioSettings,
} from "@/lib/settings";
import { useStudio } from "./studio-context";
import { StudioTopbar } from "./studio-topbar";

/* -------------------------------------------------------------------------- */
/*  Persistence                                                               */
/* -------------------------------------------------------------------------- */

function useSettings() {
  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_SETTINGS);

  // Hydrate after mount so SSR and first client render match the default.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<StudioSettings>;
        setSettings((s) => ({
          autopilot: { ...s.autopilot, ...p.autopilot },
          generation: { ...s.generation, ...p.generation },
        }));
      }
    } catch {
      /* storage unavailable — keep defaults */
    }
  }, []);

  const save = (next: StudioSettings) => {
    setSettings(next);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  return {
    settings,
    setAutopilot: (patch: Partial<StudioSettings["autopilot"]>) =>
      save({ ...settings, autopilot: { ...settings.autopilot, ...patch } }),
    setGeneration: (patch: Partial<StudioSettings["generation"]>) =>
      save({ ...settings, generation: { ...settings.generation, ...patch } }),
  };
}

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                               */
/* -------------------------------------------------------------------------- */

function SettingRow({
  title,
  desc,
  control,
  disabled,
}: {
  title: string;
  desc: string;
  control: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-4",
        disabled && "opacity-50",
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
  disabled,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const btn =
    "flex size-8 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent";
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Decrease"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={btn}
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums text-foreground">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={btn}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sections                                                                  */
/* -------------------------------------------------------------------------- */

function AutomationSection({
  settings,
  setAutopilot,
}: {
  settings: StudioSettings;
  setAutopilot: (p: Partial<StudioSettings["autopilot"]>) => void;
}) {
  const a = settings.autopilot;
  const cadence = CADENCES.find((c) => c.id === a.cadence) ?? CADENCES[0];
  const weeklyCost = cadence.perWeek * settings.generation.costCap;

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Autopilot">
        <SettingRow
          title="Run on autopilot"
          desc="Let blobgen plan, generate, and publish videos for this channel on a schedule."
          control={
            <Switch
              checked={a.enabled}
              onCheckedChange={(v: boolean) => setAutopilot({ enabled: v })}
            />
          }
        />

        <div className="border-t border-border/60 pt-4">
          <p className="text-sm font-semibold text-foreground">Cadence</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            How often a new long-form video goes out.
          </p>
          <div
            className={cn(
              "mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4",
              !a.enabled && "pointer-events-none opacity-50",
            )}
          >
            {CADENCES.map((c) => {
              const active = c.id === a.cadence;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAutopilot({ cadence: c.id })}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-start rounded-lg border p-3 text-left transition-colors",
                    active
                      ? "border-primary/45 bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <c.icon
                    className={cn(
                      "size-4",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="mt-2 text-sm font-semibold text-foreground">
                    {c.label}
                  </span>
                  <span className="text-[0.7rem] text-muted-foreground">
                    {c.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Shorts">
        <SettingRow
          title="Auto-create Shorts"
          desc="Cut vertical Shorts from each long-form video automatically."
          control={
            <Switch
              checked={a.autoShorts}
              onCheckedChange={(v: boolean) => setAutopilot({ autoShorts: v })}
            />
          }
        />
        <div className="border-t border-border/60">
          <SettingRow
            title="Max Shorts per video"
            desc="Cap how many Shorts each long-form can spin off."
            disabled={!a.autoShorts}
            control={
              <Stepper
                value={a.maxShorts}
                min={MAX_SHORTS.min}
                max={MAX_SHORTS.max}
                disabled={!a.autoShorts}
                onChange={(v) => setAutopilot({ maxShorts: v })}
              />
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="Publishing">
        <SettingRow
          title="Publish at the best time only"
          desc="Use the analytics best-time window instead of a fixed slot."
          control={
            <Switch
              checked={a.bestTimeOnly}
              onCheckedChange={(v: boolean) => setAutopilot({ bestTimeOnly: v })}
            />
          }
        />
      </SectionCard>

      {/* Estimate */}
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Gem className="size-4 shrink-0 text-primary" />
        <p className="text-sm text-foreground">
          {a.enabled ? (
            <>
              About{" "}
              <span className="font-semibold">{cadence.perWeek} videos/week</span>
              {a.autoShorts ? (
                <> + up to {a.maxShorts} Shorts each</>
              ) : null}
              , capped at{" "}
              <span className="font-semibold">
                {settings.generation.costCap} credits
              </span>{" "}
              per video — roughly{" "}
              <span className="font-semibold tabular-nums">
                {weeklyCost.toLocaleString()} credits/week
              </span>
              .
            </>
          ) : (
            <>Autopilot is off — you publish manually from the studio.</>
          )}
        </p>
      </div>
    </div>
  );
}

function GenerationSection({
  settings,
  setGeneration,
}: {
  settings: StudioSettings;
  setGeneration: (p: Partial<StudioSettings["generation"]>) => void;
}) {
  const g = settings.generation;

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Budget">
        <div className="py-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Cost cap per video
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                The most credits a single video may use.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-semibold text-foreground">
              <Gem className="size-3.5 text-primary" />
              <span className="tabular-nums">{g.costCap}</span>
            </span>
          </div>
          <input
            type="range"
            min={COST_CAP.min}
            max={COST_CAP.max}
            step={COST_CAP.step}
            value={g.costCap}
            onChange={(e) => setGeneration({ costCap: Number(e.target.value) })}
            className="mt-4 w-full accent-primary"
            aria-label="Cost cap per video"
          />
          <div className="mt-1 flex justify-between text-[0.7rem] text-muted-foreground">
            <span>{COST_CAP.min} credits</span>
            <span>{COST_CAP.max} credits</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Video size">
        <p className="text-xs text-muted-foreground">
          Default resolution and aspect ratio for the long-form render.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {VIDEO_SIZES.map((s) => {
            const active = s.id === g.size;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setGeneration({ size: s.id })}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start rounded-lg border p-3 text-left transition-colors",
                  active
                    ? "border-primary/45 bg-primary/5"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <span className="text-sm font-semibold text-foreground">
                  {s.label}
                </span>
                <span className="text-[0.7rem] text-muted-foreground">
                  {s.ratio}
                </span>
                <span className="mt-1 font-mono text-[0.66rem] tabular-nums text-muted-foreground/80">
                  {s.res}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Quality">
        <p className="text-xs text-muted-foreground">
          Higher tiers look better and cost more credits.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          {QUALITY_TIERS.map((q) => {
            const active = q.id === g.quality;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setGeneration({ quality: q.id })}
                aria-pressed={active}
                className={cn(
                  "flex-1 rounded-lg border p-3 text-left transition-colors",
                  active
                    ? "border-primary/45 bg-primary/5"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <span className="text-sm font-semibold text-foreground">
                  {q.label}
                </span>
                <span className="mt-0.5 block text-[0.7rem] text-muted-foreground">
                  {q.hint}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shell                                                                     */
/* -------------------------------------------------------------------------- */

type SectionId = "automation" | "generation" | "billing" | "channels" | "account";

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon; soon?: boolean }[] = [
  { id: "automation", label: "Autopilot", icon: Zap },
  { id: "generation", label: "Generation", icon: SlidersHorizontal },
  { id: "billing", label: "Billing & credits", icon: Wallet, soon: true },
  { id: "channels", label: "Channels & brand", icon: Clapperboard, soon: true },
  { id: "account", label: "Account & team", icon: Users, soon: true },
];

export function SettingsView() {
  const { channel } = useStudio();
  const { settings, setAutopilot, setGeneration } = useSettings();
  const [section, setSection] = useState<SectionId>("automation");

  const current = SECTIONS.find((s) => s.id === section)!;

  return (
    <>
      <StudioTopbar title="Settings" subtitle={channel.name} />

      <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Section nav */}
          <nav className="lg:w-56 lg:shrink-0">
            <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 lg:flex-col lg:overflow-visible">
              {SECTIONS.map((s) => {
                const active = s.id === section;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => !s.soon && setSection(s.id)}
                    disabled={s.soon}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      s.soon && "cursor-not-allowed opacity-50 hover:bg-transparent",
                    )}
                  >
                    <s.icon className="size-4 shrink-0" />
                    <span className="truncate">{s.label}</span>
                    {s.soon ? (
                      <Lock className="ml-auto hidden size-3 lg:block" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {section === "automation" ? (
              <AutomationSection
                settings={settings}
                setAutopilot={setAutopilot}
              />
            ) : section === "generation" ? (
              <GenerationSection
                settings={settings}
                setGeneration={setGeneration}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-20 text-center">
                <current.icon className="size-7 text-muted-foreground/55" />
                <p className="mt-3 text-sm font-medium text-foreground">
                  {current.label}
                </p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  This section is coming soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS, type WizardStepId } from "@/lib/onboarding";
import { PreviewPanel } from "./preview-panel";
import { MiniProgress, ProgressRail } from "./progress-rail";

type ShellStep = {
  id: WizardStepId;
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function WizardShell({
  index,
  step,
  canContinue,
  isFinal,
  direction,
  onBack,
  onContinue,
  children,
}: {
  index: number;
  step: ShellStep;
  canContinue: boolean;
  isFinal: boolean;
  /** 1 = moving forward, -1 = moving back; drives the slide direction. */
  direction: 1 | -1;
  onBack: () => void;
  onContinue: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-background lg:grid lg:h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(380px,42%)] lg:overflow-hidden xl:grid-cols-[284px_minmax(0,1fr)_minmax(420px,40%)]">
      {/* ----- Rail (xl only) ----- */}
      <aside className="hidden flex-col border-r border-border bg-card/40 p-8 xl:flex xl:overflow-y-auto">
        <Link href="/" aria-label="blobgen.ai home" className="inline-flex">
          <Logo />
        </Link>

        <div className="mt-12">
          <ProgressRail current={index} />
        </div>

        <div className="mt-auto flex items-center justify-between pt-8">
          <Link
            href="/"
            className="text-[0.78rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to site
          </Link>
          <ThemeToggle />
        </div>
      </aside>

      {/* ----- Form column ----- */}
      <section className="flex flex-col lg:overflow-y-auto">
        {/* Top bar (below xl, since the rail carries the logo on xl) */}
        <div className="flex items-center justify-between px-5 pt-6 sm:px-8 xl:hidden">
          <Link href="/" aria-label="blobgen.ai home" className="inline-flex">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-8 sm:px-8 xl:max-w-xl xl:px-12 xl:py-12">
          <div className="xl:hidden">
            <MiniProgress current={index} />
          </div>

          {/* Step header */}
          <div
            key={`head-${step.id}`}
            className="mt-7 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 motion-reduce:animate-none xl:mt-2"
          >
            <p className="hidden text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary xl:block">
              {step.eyebrow} · Step {index + 1} of {WIZARD_STEPS.length}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {step.title}
            </h1>
            <p className="mt-2 text-pretty text-[0.95rem] leading-relaxed text-muted-foreground">
              {step.subtitle}
            </p>
          </div>

          {/* Step body (re-mounts per step to replay the entrance) */}
          <div
            key={`body-${step.id}`}
            className={cn(
              "mt-7 flex-1 animate-in fade-in-0 duration-500 motion-reduce:animate-none",
              direction === 1
                ? "slide-in-from-right-4"
                : "slide-in-from-left-4",
            )}
          >
            {children}
          </div>

          {/* Nav */}
          <div className="mt-8 flex items-center gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-[0.88rem] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <button
              type="button"
              onClick={onContinue}
              disabled={!canContinue}
              className={cn(
                "ml-auto inline-flex h-11 items-center gap-1.5 rounded-xl px-5 text-[0.9rem] font-semibold text-primary-foreground transition-[transform,background-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
                "bg-primary hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40",
                canContinue && "glow-red",
              )}
            >
              {isFinal ? (
                <>
                  Enter studio
                  <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ----- Preview (lg+), always a cinematic dark stage ----- */}
      <aside className="hidden border-l border-border bg-[oklch(0.06_0.01_25)] lg:block lg:overflow-hidden">
        <PreviewPanel step={step.id} />
      </aside>
    </div>
  );
}

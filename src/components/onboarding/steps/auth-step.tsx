"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo, YouTubeIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { PROVIDERS } from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/studio/reveal";
import { useOnboarding } from "../onboarding-context";

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

const PROOF_THUMBS = [
  "/images/space.jpg",
  "/images/finance.jpg",
  "/images/history.jpg",
];

export function AuthStep({ onNext }: { onNext: () => void }) {
  const { state, set } = useOnboarding();
  const isSignup = state.authMode === "signup";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <div className="relative grid min-h-[100dvh] lg:grid-cols-[1.05fr_1fr]">
      {/* ---------------------------------------------------------------- */}
      {/* Brand panel (cinematic) — hidden on small screens               */}
      {/* ---------------------------------------------------------------- */}
      <aside className="relative hidden overflow-hidden bg-[oklch(0.06_0.01_265)] lg:flex lg:flex-col lg:justify-between dark:bg-[oklch(0.05_0.005_265)]">
        <div className="glow-radial opacity-100" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 30% 0%, oklch(0.82 0.008 265 / 0.16), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pipe-canvas pointer-events-none absolute inset-0"
        />

        <div className="relative p-10 xl:p-14">
          <Link href="/" aria-label="blobgen.ai home" className="inline-flex">
            <Logo className="[&_span]:text-white" />
          </Link>
        </div>

        <div className="relative px-10 xl:px-14">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              blobgen studio
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 max-w-md text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white xl:text-5xl">
              A faceless channel,
              <br />
              running itself by
              <span className="text-grad-accent"> tonight.</span>
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-sm text-pretty text-[0.95rem] leading-relaxed text-white/55">
              Keyword in, YouTube Short out. Script, voiceover, visuals, captions
              and scheduling — generated and published on autopilot.
            </p>
          </Reveal>
        </div>

        <div className="relative p-10 xl:p-14">
          <Reveal delay={240} className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {PROOF_THUMBS.map((src) => (
                <span
                  key={src}
                  className="size-10 overflow-hidden rounded-full ring-2 ring-[oklch(0.06_0.01_265)]"
                  style={{
                    backgroundImage: `url(${src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
            </div>
            <p className="text-[0.82rem] leading-snug text-white/55">
              <span className="font-semibold text-white">12,000+ creators</span>
              <br />
              automate their Shorts with blobgen.
            </p>
          </Reveal>
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* Form panel                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative flex flex-col px-5 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="blobgen.ai home"
            className="inline-flex lg:invisible"
          >
            <Logo />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm py-10">
            <Reveal>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {isSignup ? "Create your studio" : "Welcome back"}
              </h1>
              <p className="mt-2 text-[0.95rem] text-muted-foreground">
                {isSignup
                  ? "Start free. No card, no credits to burn."
                  : "Sign in to pick up where you left off."}
              </p>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-7 grid grid-cols-2 gap-2.5">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={onNext}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-[0.85rem] font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {p.id === "google" ? (
                      <GoogleGlyph />
                    ) : (
                      <YouTubeIcon className="size-4 text-[#FF0000]" />
                    )}
                    {p.label}
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="my-6 flex items-center gap-3 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
                <span className="h-px flex-1 bg-border" />
                or with email
                <span className="h-px flex-1 bg-border" />
              </div>
            </Reveal>

            <Reveal delay={160}>
              <form onSubmit={submit} className="space-y-3.5">
                {isSignup ? (
                  <Field
                    label="Name"
                    type="text"
                    placeholder="Alex Rivera"
                    value={state.name}
                    onChange={(v) => set({ name: v })}
                    autoComplete="name"
                  />
                ) : null}
                <Field
                  label="Email"
                  type="email"
                  placeholder="you@studio.com"
                  value={state.email}
                  onChange={(v) => set({ email: v })}
                  autoComplete="email"
                />
                <Field
                  label="Password"
                  type="password"
                  placeholder="••••••••••"
                  value=""
                  onChange={() => {}}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />

                <button
                  type="submit"
                  className="glow-accent mt-1 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-[0.9rem] font-semibold text-primary-foreground transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary/90 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100"
                >
                  {isSignup ? "Create account" : "Sign in"}
                  <ArrowRight className="size-4" />
                </button>
              </form>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 text-center text-[0.85rem] text-muted-foreground">
                {isSignup ? "Already have an account?" : "New to blobgen?"}{" "}
                <button
                  type="button"
                  onClick={() =>
                    set({ authMode: isSignup ? "signin" : "signup" })
                  }
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {isSignup ? "Sign in" : "Create one free"}
                </button>
              </p>
            </Reveal>

            <p className="mt-8 text-center text-[0.72rem] leading-relaxed text-muted-foreground/70">
              By continuing you agree to our Terms and acknowledge our Privacy
              Policy. This is a demo — no account is actually created.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.8rem] font-medium text-foreground">
        {label}
      </span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-[0.9rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-3 focus:ring-ring/40"
      />
    </label>
  );
}

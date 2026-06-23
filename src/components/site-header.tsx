"use client";

import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Features", href: "#features", caret: true },
  { label: "Examples", href: "#use-cases", caret: false },
  { label: "Pricing", href: "#pricing", caret: false },
  { label: "Resources", href: "#footer", caret: true },
  { label: "Affiliates", href: "#footer", caret: false },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" aria-label="blobgen.ai home" className="shrink-0">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
              {item.caret ? (
                <ChevronDown className="size-3.5 opacity-70" />
              ) : null}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="/onboarding?mode=signin"
            className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </a>
          <a
            href="/onboarding"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-10 rounded-xl px-5 text-sm font-semibold glow-accent hover:bg-primary",
            )}
          >
            Get started
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/60 bg-background/95 px-4 pb-5 pt-2 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
                {item.caret ? <ChevronDown className="size-4 opacity-70" /> : null}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <a
              href="/onboarding?mode=signin"
              className={cn(buttonVariants({ variant: "secondary" }), "h-11 rounded-xl text-sm font-semibold")}
            >
              Sign in
            </a>
            <a
              href="/onboarding"
              onClick={() => setOpen(false)}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 rounded-xl text-sm font-semibold glow-accent hover:bg-primary",
              )}
            >
              Get started
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./app-sidebar";
import { StudioProvider, useStudio } from "./studio-context";

function MobileBar({ onOpen }: { onOpen: () => void }) {
  const { channel } = useStudio();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open menu"
        className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground"
      >
        <Menu className="size-5" />
      </button>
      <Link href="/studio" aria-label="blobgen.ai studio">
        <Logo />
      </Link>
      <Image
        src={channel.image}
        alt={channel.name}
        width={36}
        height={36}
        className="size-9 rounded-lg object-cover ring-1 ring-inset ring-black/10 dark:ring-white/10"
      />
    </header>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Disable the native elastic/rubber-band overscroll inside the studio app
  // shell (restored on leave, so marketing pages keep their native scroll feel).
  useEffect(() => {
    const root = document.documentElement;
    const prevRoot = root.style.overscrollBehavior;
    const prevBody = document.body.style.overscrollBehavior;
    root.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";
    return () => {
      root.style.overscrollBehavior = prevRoot;
      document.body.style.overscrollBehavior = prevBody;
    };
  }, []);

  return (
    <div className="studio-scope min-h-[100dvh] bg-background">
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Backdrop (mobile only) */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <div className="lg:pl-[280px]">
        <MobileBar onOpen={() => setMobileOpen(true)} />
        {/* Close affordance when drawer is open (mobile) */}
        {mobileOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="fixed right-4 top-3.5 z-[60] flex size-9 items-center justify-center rounded-lg bg-card text-foreground shadow-lg ring-1 ring-border lg:hidden"
          >
            <X className="size-5" />
          </button>
        ) : null}
        <main>{children}</main>
      </div>
    </div>
  );
}

export function StudioShell({ children }: { children: React.ReactNode }) {
  return (
    <StudioProvider>
      <ShellInner>{children}</ShellInner>
    </StudioProvider>
  );
}

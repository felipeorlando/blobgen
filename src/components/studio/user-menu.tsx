"use client";

import type { LucideIcon } from "lucide-react";
import { LogOut, Settings2 } from "lucide-react";
import { Settings } from "@/components/animate-ui/icons/settings";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./popover";

function MenuItem({
  icon: Icon,
  label,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
}) {
  return (
    <PopoverClose
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm font-medium transition-colors",
        danger
          ? "text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
          : "text-foreground hover:bg-muted",
      )}
    >
      <Icon className={cn("size-4 shrink-0", !danger && "text-muted-foreground")} />
      {label}
    </PopoverClose>
  );
}

/**
 * Account menu for the sidebar footer. Holds the profile, settings, the theme
 * control (moved out of the footer), and sign-out behind a single trigger.
 */
export function UserMenu() {
  return (
    <Popover>
      <PopoverTrigger className="group flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/60 aria-expanded:bg-muted/60">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
          PR
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            Priya Raman
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Studio plan
          </span>
        </span>
        <Settings
          animateOnHover
          size={16}
          className="shrink-0 text-muted-foreground transition-colors group-aria-expanded:text-foreground"
        />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-[256px] p-1.5"
      >
        <div className="flex items-center gap-2.5 px-2 py-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
            PR
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              Priya Raman
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              priya@blobgen.ai
            </span>
          </span>
        </div>

        <div className="my-1 h-px bg-border/70" />

        <MenuItem icon={Settings2} label="Settings" />

        <div className="my-1 h-px bg-border/70" />

        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <span className="text-sm font-medium text-foreground">Theme</span>
          <ThemeToggle />
        </div>

        <div className="my-1 h-px bg-border/70" />

        <MenuItem icon={LogOut} label="Sign out" danger />
      </PopoverContent>
    </Popover>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarClock,
  Check,
  Library,
  Plus,
  Settings2,
  Sparkles,
  Users,
} from "lucide-react";
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { compact } from "@/lib/studio";
import { useStudio } from "./studio-context";

type NavItem = {
  label: string;
  href?: string;
  icon: typeof Sparkles;
  match?: (path: string) => boolean;
};

const CREATE: NavItem[] = [
  {
    label: "New idea",
    href: "/studio",
    icon: Sparkles,
    match: (p) => p === "/studio",
  },
  { label: "Library", icon: Library },
  { label: "Schedule", icon: CalendarClock },
];

const INSIGHTS: NavItem[] = [
  {
    label: "Channel analytics",
    href: "/studio/analytics",
    icon: BarChart3,
    match: (p) => p.startsWith("/studio/analytics"),
  },
  { label: "Audience", icon: Users },
];

function NavRow({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const inner = (
    <>
      <item.icon
        className={cn(
          "size-[18px] shrink-0 transition-colors",
          active ? "text-primary" : "text-muted-foreground group-hover/nav:text-foreground",
        )}
      />
      <span className="truncate">{item.label}</span>
    </>
  );

  const base =
    "group/nav relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors";

  if (!item.href) {
    return (
      <span
        aria-disabled
        className={cn(
          base,
          "cursor-default text-muted-foreground/70 hover:bg-muted/40",
        )}
      >
        {inner}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        base,
        active
          ? "bg-primary/10 text-foreground"
          : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {active ? (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      ) : null}
      {inner}
    </Link>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1.5 pt-4 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
      {children}
    </p>
  );
}

export function AppSidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { channels, channelId, setChannelId } = useStudio();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-out lg:translate-x-0",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
      )}
    >
      {/* Top: logo */}
      <div className="flex h-16 items-center px-5">
        <Link href="/studio" onClick={onClose} aria-label="blobgen.ai studio">
          <Logo />
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 no-scrollbar">
        <GroupLabel>Create</GroupLabel>
        <div className="flex flex-col gap-0.5">
          {CREATE.map((item) => (
            <NavRow
              key={item.label}
              item={item}
              active={item.match?.(pathname) ?? false}
              onNavigate={onClose}
            />
          ))}
        </div>

        <GroupLabel>Insights</GroupLabel>
        <div className="flex flex-col gap-0.5">
          {INSIGHTS.map((item) => (
            <NavRow
              key={item.label}
              item={item}
              active={item.match?.(pathname) ?? false}
              onNavigate={onClose}
            />
          ))}
        </div>
      </nav>

      {/* Bottom: channel switcher */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center justify-between px-2 pb-1.5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
            Channels
          </p>
          <span className="text-[0.68rem] font-medium text-muted-foreground/60">
            {channels.length}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          {channels.map((c) => {
            const active = c.id === channelId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setChannelId(c.id)}
                aria-pressed={active}
                className={cn(
                  "group/ch flex items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                  active ? "bg-primary/10" : "hover:bg-muted/60",
                )}
              >
                <span className="relative shrink-0">
                  <Image
                    src={c.image}
                    alt=""
                    width={40}
                    height={40}
                    className={cn(
                      "size-9 rounded-lg object-cover ring-1 ring-inset ring-black/10 dark:ring-white/10",
                      active && "ring-2 ring-primary/60",
                    )}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "truncate text-sm font-semibold",
                        active ? "text-foreground" : "text-foreground/85",
                      )}
                    >
                      {c.name}
                    </span>
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {compact(c.subscribers)} subscribers
                  </span>
                </span>
                {active ? (
                  <Check className="size-4 shrink-0 text-primary" />
                ) : null}
              </button>
            );
          })}

          <button
            type="button"
            className="flex items-center gap-3 rounded-md px-2 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-border">
              <Plus className="size-4" />
            </span>
            Add channel
          </button>
        </div>

        {/* Account + theme */}
        <div className="mt-3 border-t border-sidebar-border pt-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-1.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
              PR
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Priya Raman</p>
              <p className="truncate text-xs text-muted-foreground">Studio plan</p>
            </div>
            <button
              type="button"
              aria-label="Account settings"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings2 className="size-4" />
            </button>
          </div>
          <div className="mt-2 flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}

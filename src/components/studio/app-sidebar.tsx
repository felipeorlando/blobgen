"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Sparkles } from "@/components/animate-ui/icons/sparkles";
import { Layers } from "@/components/animate-ui/icons/layers";
import { Clock } from "@/components/animate-ui/icons/clock";
import { ChartColumn } from "@/components/animate-ui/icons/chart-column";
import { Users } from "@/components/animate-ui/icons/users";
import { cn } from "@/lib/utils";
import { ChannelSwitcher } from "./channel-switcher";
import { UserMenu } from "./user-menu";

/** animate-ui icons share this minimal surface (size + className). */
type NavIcon = ComponentType<{ className?: string; size?: number }>;

type NavItem = {
  label: string;
  href?: string;
  icon: NavIcon;
  match?: (path: string) => boolean;
};

const CREATE: NavItem[] = [
  {
    label: "New idea",
    href: "/studio",
    icon: Sparkles,
    match: (p) => p === "/studio",
  },
  {
    label: "Library",
    href: "/studio/library",
    icon: Layers,
    match: (p) => p.startsWith("/studio/library"),
  },
  {
    label: "Schedule",
    href: "/studio/schedule",
    icon: Clock,
    match: (p) => p.startsWith("/studio/schedule"),
  },
];

const INSIGHTS: NavItem[] = [
  {
    label: "Channel analytics",
    href: "/studio/analytics",
    icon: ChartColumn,
    match: (p) => p.startsWith("/studio/analytics"),
  },
  {
    label: "Audience",
    href: "/studio/audience",
    icon: Users,
    match: (p) => p.startsWith("/studio/audience"),
  },
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
        size={18}
        className={cn(
          "shrink-0 transition-colors",
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
    <AnimateIcon animateOnHover asChild>
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
    </AnimateIcon>
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

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-out lg:translate-x-0",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
      )}
    >
      {/* Top: channel switcher. Border lives on a height-less wrapper (not on
          the h-16 box) so its divider lands pixel-exact on the page topbar,
          which is structured the same way. */}
      <div className="border-b border-sidebar-border">
        <div className="flex h-16 items-center px-3">
          <ChannelSwitcher />
        </div>
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

      {/* Bottom: account menu — mirrors the top bar's structure exactly. */}
      <div className="border-t border-sidebar-border">
        <div className="flex h-16 items-center px-3">
          <UserMenu />
        </div>
      </div>
    </aside>
  );
}

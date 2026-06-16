"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;
export const PopoverClose = BasePopover.Close;

/**
 * Sober popover surface. Scales from its trigger via Base UI's
 * `--transform-origin` (origin-aware, per Emil Kowalski), fast ease-out,
 * reduced-motion safe.
 */
export function PopoverContent({
  className,
  side = "top",
  align = "start",
  sideOffset = 8,
  children,
}: {
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  children: React.ReactNode;
}) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <BasePopover.Popup
          className={cn(
            "min-w-[12rem] origin-[var(--transform-origin)] rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-md outline-none",
            "transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

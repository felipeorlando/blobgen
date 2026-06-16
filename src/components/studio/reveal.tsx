import { cn } from "@/lib/utils";

/**
 * Staggered entrance wrapper. Fades + lifts its child on mount; chain a few
 * with increasing `delay` to orchestrate a top-to-bottom page reveal. Matches
 * the KpiCard / LibraryCard motion and is reduced-motion safe. `className`
 * merges, so a Reveal can double as the grid cell (carry `lg:col-span-2`,
 * margins, etc.) instead of adding an extra wrapper.
 */
export function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(
        "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500 motion-reduce:animate-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

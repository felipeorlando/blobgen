import { cn } from "@/lib/utils";

/** Sticky page header. Sits below the mobile bar on small screens, at the top on desktop. */
export function StudioTopbar({
  title,
  subtitle,
  children,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-14 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl lg:top-0",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-[0.82rem] text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children ? (
          <div className="flex shrink-0 items-center gap-2">{children}</div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Gem } from "lucide-react";
import { getCreditBalanceAction } from "@/server/actions/data";

/** Live credit balance for the signed-in user (replaces the hardcoded chip). */
export function CreditBadge({ refreshKey }: { refreshKey?: number }) {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getCreditBalanceAction().then((b) => {
      if (active) setCredits(b);
    });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground">
      <Gem className="size-3.5 text-primary" />
      {credits === null ? "—" : credits.toLocaleString()} credits
    </span>
  );
}

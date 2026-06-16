"use client";

import { useEffect, useState } from "react";

/**
 * Auto-advances through `count` steps, looping forever. Returns the active
 * index plus controls so the UI can let users jump to a step or pause on hover.
 * Each step lingers for `durationMs`; the timer restarts whenever `active`
 * changes (manual jump resets the dwell), and stops while `paused`.
 */
export function useAutoAdvance(count: number, durationMs = 3800) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => {
      setActive((a) => (a + 1) % count);
    }, durationMs);
    return () => clearTimeout(id);
  }, [active, paused, count, durationMs]);

  return { active, setActive, paused, setPaused };
}

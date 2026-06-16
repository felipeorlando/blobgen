"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Plus, Search, Sparkles } from "lucide-react";
import { Reveal } from "@/components/studio/reveal";
import { cn } from "@/lib/utils";
import { compact } from "@/lib/studio";
import {
  searchCompetitors,
  suggestCompetitors,
  type Competitor,
} from "@/lib/onboarding";
import { useOnboarding } from "../onboarding-context";

export function CompetitorsStep() {
  const { state, set, topicKey } = useOnboarding();
  const [query, setQuery] = useState("");

  const suggested = suggestCompetitors(topicKey);
  const suggestedIds = new Set(suggested.map((c) => c.id));
  const results = searchCompetitors(query).filter((c) => !suggestedIds.has(c.id));

  function toggle(id: string) {
    set({
      competitorIds: state.competitorIds.includes(id)
        ? state.competitorIds.filter((c) => c !== id)
        : [...state.competitorIds, id],
    });
  }

  return (
    <div className="space-y-5">
      {/* Suggested */}
      <Reveal>
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[0.8rem] font-medium text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Suggested for you
          </p>
          <div className="space-y-2">
            {suggested.map((c) => (
              <CompetitorRow
                key={c.id}
                competitor={c}
                selected={state.competitorIds.includes(c.id)}
                onToggle={() => toggle(c.id)}
              />
            ))}
          </div>
        </div>
      </Reveal>

      {/* Search */}
      <Reveal delay={80}>
        <div>
          <p className="mb-2 text-[0.8rem] font-medium text-foreground">
            Search for more
          </p>
          <div className="flex h-11 items-center gap-2 rounded-xl border border-input bg-card px-3.5 transition-colors focus-within:border-primary/60 focus-within:ring-3 focus-within:ring-ring/40">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search YouTube channels…"
              className="h-full w-full bg-transparent text-[0.9rem] text-foreground outline-none placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="mt-2 space-y-2">
            {query.trim() && results.length === 0 ? (
              <p className="px-1 py-2 text-[0.82rem] text-muted-foreground">
                No channels match “{query.trim()}”.
              </p>
            ) : (
              results.map((c) => (
                <CompetitorRow
                  key={c.id}
                  competitor={c}
                  selected={state.competitorIds.includes(c.id)}
                  onToggle={() => toggle(c.id)}
                />
              ))
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <p className="text-[0.78rem] text-muted-foreground">
          Tracking{" "}
          <span className="font-semibold text-foreground">
            {state.competitorIds.length}
          </span>{" "}
          {state.competitorIds.length === 1 ? "competitor" : "competitors"} ·
          optional, you can change this later.
        </p>
      </Reveal>
    </div>
  );
}

function CompetitorRow({
  competitor,
  selected,
  onToggle,
}: {
  competitor: Competitor;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] motion-reduce:active:scale-100",
        selected
          ? "border-primary/60 bg-primary/[0.06]"
          : "border-border bg-card hover:border-foreground/20 hover:bg-muted/40",
      )}
    >
      <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-border">
        <Image src={competitor.avatar} alt="" fill sizes="40px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.88rem] font-semibold text-foreground">
          {competitor.name}
        </span>
        <span className="block truncate text-[0.76rem] text-muted-foreground">
          @{competitor.handle} · {compact(competitor.subscribers)} subscribers
        </span>
      </span>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-muted-foreground",
        )}
      >
        {selected ? (
          <Check className="size-3.5" strokeWidth={3} />
        ) : (
          <Plus className="size-4" />
        )}
      </span>
    </button>
  );
}

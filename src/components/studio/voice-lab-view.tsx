"use client";

import { useState } from "react";
import { Check, Mic, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { VOICES } from "@/lib/labs";
import { GeneratorLab } from "./generator-lab";

function VoiceManager() {
  const [selected, setSelected] = useState(VOICES[0].id);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Mic className="size-4 text-emerald-600 dark:text-emerald-400" />
          Your voices
        </h3>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Upload className="size-3.5" />
          Clone a voice
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {VOICES.map((v) => {
          const active = v.id === selected;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelected(v.id)}
              aria-pressed={active}
              className={cn(
                "relative flex flex-col rounded-lg border p-3 text-left transition-colors",
                active
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:bg-muted/50",
              )}
            >
              {active ? (
                <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
              ) : null}
              <span className="text-sm font-semibold text-foreground">
                {v.name}
              </span>
              <span className="mt-0.5 text-[0.7rem] text-muted-foreground">
                {v.tag}
              </span>
              <span
                className={cn(
                  "mt-2 inline-flex w-fit items-center gap-1 rounded px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide",
                  v.origin === "Cloned"
                    ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {v.origin === "Cloned" ? (
                  <Mic className="size-2.5" />
                ) : (
                  <Plus className="size-2.5" />
                )}
                {v.origin}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function VoiceLabView() {
  return <GeneratorLab slug="voice" header={<VoiceManager />} />;
}

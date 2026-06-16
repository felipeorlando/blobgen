"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { Reveal } from "@/components/studio/reveal";
import { cn } from "@/lib/utils";
import { AVATAR_OPTIONS, toHandle } from "@/lib/onboarding";
import { useOnboarding } from "../onboarding-context";

export function DescribeStep() {
  const { state, set } = useOnboarding();

  function onName(v: string) {
    set({
      newName: v,
      // Keep the handle synced until the user edits it directly.
      ...(state.newHandle === toHandle(state.newName)
        ? { newHandle: toHandle(v) }
        : {}),
    });
  }

  return (
    <div className="space-y-5">
      <Reveal>
        <label className="block">
          <span className="mb-1.5 block text-[0.8rem] font-medium text-foreground">
            Channel name
          </span>
          <input
            value={state.newName}
            onChange={(e) => onName(e.target.value)}
            placeholder="e.g. Midnight Mythos"
            className="h-12 w-full rounded-xl border border-input bg-card px-3.5 text-[1rem] font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-3 focus:ring-ring/40"
          />
        </label>
      </Reveal>

      <Reveal delay={60}>
        <label className="block">
          <span className="mb-1.5 block text-[0.8rem] font-medium text-foreground">
            Handle
          </span>
          <div className="flex h-12 items-center rounded-xl border border-input bg-card px-3.5 transition-colors focus-within:border-primary/60 focus-within:ring-3 focus-within:ring-ring/40">
            <span className="text-[0.95rem] text-muted-foreground">@</span>
            <input
              value={state.newHandle}
              onChange={(e) => set({ newHandle: toHandle(e.target.value) })}
              placeholder="midnightmythos"
              className="h-full w-full bg-transparent pl-0.5 text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </label>
      </Reveal>

      <Reveal delay={120}>
        <label className="block">
          <span className="mb-1.5 block text-[0.8rem] font-medium text-foreground">
            What&apos;s it going to be about?
          </span>
          <textarea
            value={state.newAbout}
            onChange={(e) => set({ newAbout: e.target.value })}
            rows={3}
            placeholder="e.g. Short, eerie retellings of world mythology — calm narration over dark, atmospheric visuals."
            className="w-full resize-none rounded-xl border border-input bg-card p-3.5 text-[0.92rem] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-3 focus:ring-ring/40"
          />
          <span className="mt-1.5 block text-[0.74rem] text-muted-foreground">
            blobgen uses this to script, voice and style every video.
          </span>
        </label>
      </Reveal>

      <Reveal delay={180}>
        <div>
          <p className="mb-2 text-[0.8rem] font-medium text-foreground">
            Channel avatar
          </p>
          <div className="flex flex-wrap gap-2.5">
            {AVATAR_OPTIONS.map((src) => {
              const active = state.newAvatar === src;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => set({ newAvatar: src })}
                  aria-pressed={active}
                  aria-label="Select avatar"
                  className={cn(
                    "relative size-14 overflow-hidden rounded-xl outline-none ring-offset-2 ring-offset-background transition-all focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "ring-2 ring-primary"
                      : "ring-1 ring-inset ring-border hover:ring-foreground/30",
                  )}
                >
                  <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                  {active ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-primary/35">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

"use client";

import { Gem } from "lucide-react";
import { StudioTopbar } from "./studio-topbar";
import { PromptComposer } from "./prompt-composer";
import { ProjectsGrid } from "./projects-grid";
import { Reveal } from "./reveal";
import { useStudio } from "./studio-context";

export function NewIdeaView() {
  const { channel } = useStudio();

  return (
    <>
      <StudioTopbar title="New idea" subtitle={channel.name}>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground">
          <Gem className="size-3.5 text-primary" />
          248 credits
        </span>
      </StudioTopbar>

      <div className="mx-auto flex min-h-[calc(100dvh-7.5rem)] max-w-[1180px] flex-col px-5 pb-10 pt-10 sm:px-8 sm:pt-14 lg:min-h-[calc(100dvh-4rem)]">
        {/* Hero + composer */}
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex flex-col items-center text-center">
            <h2 className="animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500 text-3xl font-semibold tracking-tight text-foreground motion-reduce:animate-none sm:text-[2.5rem] sm:leading-[1.1]">
              What&rsquo;s the next idea?
            </h2>
            <p
              style={{ animationDelay: "90ms" }}
              className="mt-3 max-w-md text-pretty text-[0.95rem] leading-relaxed text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500 motion-reduce:animate-none"
            >
              One idea becomes a long-form video, Shorts, and the cuts in
              between.
            </p>
          </div>

          <Reveal delay={180} className="mt-8">
            <PromptComposer />
          </Reveal>
        </div>

        {/* Existing projects — pushed toward the bottom of the fold */}
        <Reveal delay={280} className="mt-auto pt-20">
          <ProjectsGrid />
        </Reveal>
      </div>
    </>
  );
}

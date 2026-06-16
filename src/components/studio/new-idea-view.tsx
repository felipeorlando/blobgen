"use client";

import Image from "next/image";
import { Gem } from "lucide-react";
import { StudioTopbar } from "./studio-topbar";
import { PromptComposer } from "./prompt-composer";
import { ProjectsGrid } from "./projects-grid";
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
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card py-1 pl-1 pr-2.5 text-xs font-medium text-muted-foreground">
              <Image
                src={channel.image}
                alt=""
                width={24}
                height={24}
                className="size-5 rounded-[4px] object-cover"
              />
              Creating for {channel.name}
            </span>

            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.1]">
              What&rsquo;s the next idea?
            </h2>
            <p className="mt-3 max-w-md text-pretty text-[0.95rem] leading-relaxed text-muted-foreground">
              One idea becomes a long-form video, Shorts, and the cuts in
              between.
            </p>
          </div>

          <div className="mt-8">
            <PromptComposer />
          </div>
        </div>

        {/* Existing projects — pushed toward the bottom of the fold */}
        <div className="mt-auto pt-20">
          <ProjectsGrid />
        </div>
      </div>
    </>
  );
}

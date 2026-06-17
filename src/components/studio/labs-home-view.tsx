"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, Library, Sparkles } from "lucide-react";
import {
  CREDIT_BALANCE,
  LAB_TOOLS,
  MEDIA_ITEMS,
  type LabTool,
} from "@/lib/labs";
import { useStudio } from "./studio-context";
import { StudioTopbar } from "./studio-topbar";
import { Reveal } from "./reveal";

function ToolCard({ tool, index }: { tool: LabTool; index: number }) {
  return (
    <Reveal delay={index * 60}>
      <Link
        href={`/studio/labs/${tool.slug}`}
        className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-[transform,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:border-foreground/15"
      >
        <div className="flex items-start justify-between">
          <span
            className={`flex size-11 items-center justify-center rounded-xl ${tool.accent}`}
          >
            <tool.icon className="size-5" />
          </span>
          <ArrowRight className="size-4 text-muted-foreground/60 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
          {tool.title}
        </h3>
        <p className="mt-1 text-[0.85rem] leading-relaxed text-muted-foreground">
          {tool.tagline}
        </p>
        <p className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Gem className="size-3.5 text-primary" />
          from {tool.cost} credits
        </p>
      </Link>
    </Reveal>
  );
}

export function LabsHomeView() {
  const { channel } = useStudio();
  const recent = MEDIA_ITEMS.filter((m) => m.thumb).slice(0, 6);

  return (
    <>
      <StudioTopbar title="Labs" subtitle={channel.name}>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground">
          <Gem className="size-3.5 text-primary" />
          {CREDIT_BALANCE} credits
        </span>
      </StudioTopbar>

      <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-8 sm:px-8">
        <Reveal>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            Make one asset at a time — then bring it into the editor.
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
            What do you want to create?
          </h2>
        </Reveal>

        {/* Tools */}
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LAB_TOOLS.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>

        {/* Media browser entry */}
        <Reveal delay={280} className="mt-4">
          <Link
            href="/studio/labs/media"
            className="group flex flex-col gap-4 overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/15 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <Library className="size-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  Browse media
                </h3>
                <p className="mt-1 text-[0.85rem] text-muted-foreground">
                  Search your generated assets plus stock images, video, and
                  sound to reuse in the editor.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="flex -space-x-3">
                {recent.map((m) => (
                  <span
                    key={m.id}
                    className="relative size-10 overflow-hidden rounded-lg border-2 border-card ring-1 ring-black/5 dark:ring-white/10"
                  >
                    <Image
                      src={m.thumb!}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                ))}
              </div>
              <ArrowRight className="size-4 text-muted-foreground/60 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
          </Link>
        </Reveal>
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUp,
  Check,
  Download,
  Gem,
  Loader2,
  Paperclip,
  Pause,
  Play,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CREDIT_BALANCE, getLabTool, waveformBars } from "@/lib/labs";
import { useStudio } from "./studio-context";
import { StudioTopbar } from "./studio-topbar";

type Status = "idle" | "generating" | "done";

type Result = {
  id: string;
  thumb?: string;
  label: string;
  meta: string;
};

const RATIO_CLASS: Record<string, string> = {
  "16:9": "aspect-video",
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
  "4:5": "aspect-[4/5]",
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* -------------------------------------------------------------------------- */
/*  Small controls                                                            */
/* -------------------------------------------------------------------------- */

function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={active}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary/12 text-primary ring-1 ring-inset ring-primary/25"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Waveform({ seed, playing }: { seed: string; playing?: boolean }) {
  const bars = waveformBars(seed, 56);
  return (
    <div className="flex h-10 flex-1 items-center gap-[2px]" aria-hidden>
      {bars.map((b, i) => (
        <span
          key={i}
          style={{ height: `${Math.round(b * 100)}%` }}
          className={cn(
            "flex-1 rounded-full transition-colors",
            playing ? "bg-primary/70" : "bg-primary/30",
          )}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Results                                                                    */
/* -------------------------------------------------------------------------- */

function VisualResult({
  result,
  ratio,
  index,
}: {
  result: Result;
  ratio: string;
  index: number;
}) {
  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      className="group animate-in fade-in-0 zoom-in-95 fill-mode-both duration-500 motion-reduce:animate-none"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-border bg-muted",
          RATIO_CLASS[ratio] ?? "aspect-video",
        )}
      >
        {result.thumb ? (
          <Image
            src={result.thumb}
            alt={result.label}
            fill
            sizes="(max-width: 768px) 50vw, 320px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded bg-black/65 px-2 py-0.5 text-[0.68rem] font-medium text-white backdrop-blur">
            {result.meta}
          </span>
          <span className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Download"
              className="flex size-7 items-center justify-center rounded-md bg-white/90 text-black transition-colors hover:bg-white"
            >
              <Download className="size-3.5" />
            </button>
            <Link
              href="/studio/editor"
              aria-label="Use in editor"
              className="flex size-7 items-center justify-center rounded-md bg-white/90 text-black transition-colors hover:bg-white"
            >
              <Plus className="size-3.5" />
            </Link>
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs font-medium text-foreground">{result.label}</p>
    </article>
  );
}

function AudioResult({ result, index }: { result: Result; index: number }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      className="flex animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 duration-500 motion-reduce:animate-none"
    >
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause" : "Play"}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
      >
        {playing ? (
          <Pause className="size-4" />
        ) : (
          <Play className="ml-0.5 size-4" />
        )}
      </button>
      <Waveform seed={result.id} playing={playing} />
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs font-medium text-foreground">{result.label}</p>
        <p className="text-[0.68rem] text-muted-foreground">{result.meta}</p>
      </div>
      <button
        type="button"
        aria-label="Download"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Download className="size-4" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Generator                                                                  */
/* -------------------------------------------------------------------------- */

export function GeneratorLab({
  slug,
  header,
}: {
  slug: string;
  /** Optional extra UI under the topbar (e.g. the Voice lab's voice manager). */
  header?: React.ReactNode;
}) {
  const { channel } = useStudio();
  const tool = getLabTool(slug)!;

  const [controls, setControls] = useState<Record<string, string>>(() =>
    Object.fromEntries(tool.controls.map((c) => [c.id, c.options[0]])),
  );
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runRef = useRef(0);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const ratio = controls.ratio ?? "16:9";
  const metaLine = tool.controls.map((c) => controls[c.id]).join(" · ");
  const runCost = tool.cost * tool.batch;

  function setControl(id: string, value: string) {
    setControls((prev) => ({ ...prev, [id]: value }));
  }

  function generate() {
    if (!prompt.trim()) {
      setError("Describe what you want first.");
      textareaRef.current?.focus();
      return;
    }
    setError(null);
    setStatus("generating");
    const run = ++runRef.current;

    timers.current.push(
      setTimeout(() => {
        const made: Result[] = Array.from({ length: tool.batch }, (_, i) => ({
          id: `${tool.id}-${run}-${i}`,
          thumb:
            tool.output === "visual"
              ? channel.thumbs[(run + i) % channel.thumbs.length]
              : undefined,
          label: `${cap(tool.resultNoun)} ${i + 1}`,
          meta: metaLine,
        }));
        setResults((prev) => [...made, ...prev]);
        setStatus("done");
      }, 1700),
    );
    timers.current.push(setTimeout(() => setStatus("idle"), 4200));
  }

  const statusText = error
    ? error
    : status === "done"
      ? `Saved to ${channel.name} library`
      : null;

  return (
    <>
      <StudioTopbar title={tool.title} subtitle={tool.tagline}>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground">
          <Gem className="size-3.5 text-primary" />
          {CREDIT_BALANCE} credits
        </span>
      </StudioTopbar>

      <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-8 sm:px-8">
        {header ? <div className="mb-6">{header}</div> : null}

        {/* Composer */}
        <div className="card-surface overflow-hidden rounded-lg border border-border transition-colors focus-within:border-foreground/20">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (error) setError(null);
            }}
            rows={3}
            placeholder={tool.placeholder}
            className="block max-h-64 min-h-[104px] w-full resize-none bg-transparent px-4 pt-4 text-[0.95rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70"
          />

          {/* Controls + actions */}
          <div className="flex flex-wrap items-end gap-x-5 gap-y-3 border-t border-border/70 px-4 py-3">
            <button
              type="button"
              aria-label="Attach a reference"
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Paperclip className="size-4" />
            </button>

            {tool.controls.map((c) => (
              <div key={c.id} className="flex flex-col gap-1">
                <span className="text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
                  {c.label}
                </span>
                <Segmented
                  options={c.options}
                  value={controls[c.id]}
                  onChange={(v) => setControl(c.id, v)}
                />
              </div>
            ))}

            <div className="ml-auto flex items-center gap-3 self-center">
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                <Gem className="size-3.5 text-primary" />
                {runCost} credits
              </span>
              <button
                type="button"
                onClick={generate}
                disabled={status === "generating"}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-[0.82rem] font-semibold text-primary-foreground transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary/90 active:scale-[0.97] disabled:opacity-70 motion-reduce:transition-none"
              >
                {status === "generating" ? (
                  <>
                    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                    Generating
                  </>
                ) : status === "done" ? (
                  <>
                    <Check className="size-4" strokeWidth={3} />
                    Done
                  </>
                ) : (
                  <>
                    {tool.cta}
                    <ArrowUp className="size-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div
            className={cn(
              "h-0.5 overflow-hidden",
              status === "generating" ? "bg-primary/15" : "bg-transparent",
            )}
          >
            {status === "generating" ? (
              <div className="h-full w-1/3 animate-[pipe-pulse_1.4s_ease-in-out_infinite] bg-primary motion-reduce:animate-none" />
            ) : null}
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 px-0.5">
          <span className="text-xs font-medium text-muted-foreground">Try</span>
          {tool.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setPrompt(s);
                setError(null);
                textareaRef.current?.focus();
              }}
              className="rounded-md border border-border/70 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>

        {statusText ? (
          <p
            aria-live="polite"
            className={cn(
              "mt-3 text-xs font-medium",
              error ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {statusText}
          </p>
        ) : null}

        {/* Results */}
        <div className="mt-9">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
              <tool.icon className="size-7 text-muted-foreground/55" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-medium text-foreground">
                Your {tool.resultNoun}s will appear here
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Write a prompt above and hit {tool.cta.toLowerCase()}.
              </p>
            </div>
          ) : tool.output === "visual" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((r, i) => (
                <VisualResult key={r.id} result={r} ratio={ratio} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((r, i) => (
                <AudioResult key={r.id} result={r} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

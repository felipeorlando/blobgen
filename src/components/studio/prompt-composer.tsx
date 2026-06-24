"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  Check,
  ChevronDown,
  LayoutGrid,
  Loader2,
  Paperclip,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ASPECT_RATIOS,
  DURATIONS,
  OUTPUT_FORMATS,
  SUGGESTIONS,
  VOICE_STYLES,
} from "@/lib/studio";
import { useStudio } from "./studio-context";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { createProjectAction } from "@/server/actions/projects";

type Status = "idle" | "generating" | "done";

const triggerCls =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-border/70 px-2.5 text-[0.82rem] font-medium text-foreground transition-colors hover:bg-muted aria-expanded:bg-muted";

function MiniSegmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
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
              "rounded-md px-2 py-1 text-xs font-medium transition-colors",
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

function MenuSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-1.5 py-1.5">
      <p className="px-0.5 pb-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
        {label}
      </p>
      {children}
    </div>
  );
}

export function PromptComposer() {
  const { channel, channelId } = useStudio();

  const [mode, setMode] = useState<"Single idea" | "Series">("Single idea");
  const [prompt, setPrompt] = useState("");
  const [formats, setFormats] = useState<string[]>(["long", "short"]);
  const [ratio, setRatio] = useState<(typeof ASPECT_RATIOS)[number]>("9:16");
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>("30s");
  const [voice, setVoice] = useState(VOICE_STYLES[0].id);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  function toggleFormat(id: string) {
    setError(null);
    setFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }

  async function generate() {
    if (!prompt.trim()) {
      setError("Describe your idea first.");
      textareaRef.current?.focus();
      return;
    }
    if (formats.length === 0) {
      setError("Pick at least one output format.");
      return;
    }
    setError(null);
    setStatus("generating");
    const res = await createProjectAction({
      channelId,
      prompt,
      mode: mode === "Series" ? "series" : "single",
      formats,
      aspectRatio: ratio,
      duration,
      voice,
    });
    if (res.ok) {
      setStatus("done");
      router.push(`/studio/project/${res.projectId}`);
    } else {
      setStatus("idle");
      setError(res.error);
    }
  }

  const statusText = error
    ? error
    : status === "done"
      ? `Queued to ${channel.name}`
      : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="card-surface overflow-hidden rounded-lg border border-border transition-colors focus-within:border-foreground/20">
        {/* Textarea — the focus of the composer */}
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
          if (error) setError(null);
        }}
        rows={3}
        placeholder={
          mode === "Series"
            ? `Describe a series for ${channel.name}. We'll outline each episode...`
            : `Describe the video you want ${channel.name} to make...`
        }
        className="block max-h-64 min-h-[112px] w-full resize-none bg-transparent px-4 pt-4 text-[0.95rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70"
      />

      {/* Toolbar — every option lives in a menu */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-border/70 px-2.5 py-2.5">
        <button
          type="button"
          aria-label="Attach a reference"
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Paperclip className="size-4" />
        </button>

        {/* Formats menu (multi-select) */}
        <Popover>
          <PopoverTrigger className={triggerCls}>
            <LayoutGrid className="size-3.5 text-muted-foreground" />
            Formats
            {formats.length > 0 ? (
              <span className="rounded bg-primary/15 px-1.5 text-[0.7rem] font-semibold tabular-nums text-primary">
                {formats.length}
              </span>
            ) : null}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <p className="px-2 pb-1 pt-1 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
              Output formats
            </p>
            {OUTPUT_FORMATS.map((f) => {
              const active = formats.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFormat(f.id)}
                  aria-pressed={active}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted"
                >
                  <f.icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="flex-1">
                    <span className="block text-[0.82rem] font-medium text-foreground">
                      {f.label}
                    </span>
                    <span className="block text-[0.68rem] text-muted-foreground">
                      {f.hint}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {active ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                </button>
              );
            })}
          </PopoverContent>
        </Popover>

        {/* Options menu (mode + style) */}
        <Popover>
          <PopoverTrigger className={triggerCls}>
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            Options
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent className="w-72 divide-y divide-border/60">
            <MenuSection label="Mode">
              <MiniSegmented
                options={["Single idea", "Series"] as const}
                value={mode}
                onChange={setMode}
              />
            </MenuSection>
            <MenuSection label="Aspect ratio">
              <MiniSegmented
                options={ASPECT_RATIOS}
                value={ratio}
                onChange={setRatio}
              />
            </MenuSection>
            <MenuSection label="Duration">
              <MiniSegmented
                options={DURATIONS}
                value={duration}
                onChange={setDuration}
              />
            </MenuSection>
            <MenuSection label="Voice">
              <div className="flex flex-wrap gap-1">
                {VOICE_STYLES.map((v) => {
                  const active = v.id === voice;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVoice(v.id)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                        active
                          ? "bg-primary/12 text-primary ring-1 ring-inset ring-primary/25"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </MenuSection>
          </PopoverContent>
        </Popover>

        <div className="ml-auto flex items-center gap-2.5">
          {statusText ? (
            <span
              aria-live="polite"
              className={cn(
                "hidden text-xs font-medium sm:inline",
                error ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {statusText}
            </span>
          ) : null}

          <button
            type="button"
            onClick={generate}
            disabled={status === "generating"}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[0.82rem] font-semibold text-primary-foreground transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary/90 active:scale-[0.97] disabled:opacity-70 motion-reduce:transition-none"
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
                Generate
                <ArrowUp className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generation progress */}
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

      {/* Suggestions — below the input box */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-0.5">
        <span className="text-xs font-medium text-muted-foreground">Try</span>
        {(SUGGESTIONS[channelId] ?? []).map((s) => (
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
    </div>
  );
}

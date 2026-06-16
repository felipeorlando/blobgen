"use client";

import { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Clapperboard,
  Clock3,
  FileText,
  Image as ImageIcon,
  Plus,
  Scissors,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getBestTimes,
  getSchedule,
  relativeDay,
  SCHEDULE_DAYS,
  SCHEDULE_WEEKS,
  type AssetKind,
  type ScheduledUpload,
  type UploadStatus,
} from "@/lib/studio";
import { useStudio } from "./studio-context";
import { StudioTopbar } from "./studio-topbar";
import { Reveal } from "./reveal";

/* -------------------------------------------------------------------------- */
/*  Shared tokens                                                             */
/* -------------------------------------------------------------------------- */

const KIND_ICON: Record<AssetKind, LucideIcon> = {
  "Long-form": Clapperboard,
  Short: Smartphone,
  Cuts: Scissors,
  Thumbnail: ImageIcon,
  Script: FileText,
  Voiceover: FileText,
};

const STATUS: Record<
  UploadStatus,
  { dot: string; bar: string; text: string }
> = {
  Scheduled: {
    dot: "bg-sky-500",
    bar: "bg-sky-500/70",
    text: "text-sky-600 dark:text-sky-400",
  },
  Rendering: {
    dot: "bg-amber-500",
    bar: "bg-amber-500/70",
    text: "text-amber-600 dark:text-amber-400",
  },
  Draft: {
    dot: "bg-muted-foreground/60",
    bar: "bg-border",
    text: "text-muted-foreground",
  },
};

const HEAT: Record<number, string> = {
  0: "bg-muted",
  1: "bg-primary/25",
  2: "bg-primary/45",
  3: "bg-primary/70",
  4: "bg-primary",
};

function StatusDot({ status }: { status: UploadStatus }) {
  return <span className={cn("size-1.5 shrink-0 rounded-full", STATUS[status].dot)} />;
}

/* -------------------------------------------------------------------------- */
/*  Stat cards                                                                */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  index,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  index: number;
}) {
  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="card-surface animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500 rounded-lg border border-border p-4 motion-reduce:animate-none"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="size-4 shrink-0 text-muted-foreground/70" />
      </div>
      <p className="mt-2 truncate text-[1.7rem] font-bold leading-none tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-2 truncate text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Week planner                                                              */
/* -------------------------------------------------------------------------- */

function PlannerChip({
  upload,
  selected,
  onSelect,
}: {
  upload: ScheduledUpload;
  selected: boolean;
  onSelect: (u: ScheduledUpload) => void;
}) {
  const s = STATUS[upload.status];
  return (
    <button
      type="button"
      onClick={() => onSelect(upload)}
      aria-pressed={selected}
      className={cn(
        "group relative w-full overflow-hidden rounded-md border bg-card py-2 pl-3 pr-2 text-left shadow-sm transition-[transform,border-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none",
        selected
          ? "border-primary ring-2 ring-primary/40"
          : "border-border hover:border-foreground/15",
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", s.bar)} />
      <div className="flex items-center justify-between gap-1">
        <span className="font-mono text-[0.66rem] font-medium tabular-nums text-muted-foreground">
          {upload.timeLabel}
        </span>
        {upload.autopilot ? (
          <Sparkles className="size-3 shrink-0 text-primary" />
        ) : null}
      </div>
      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-foreground">
        {upload.title}
      </p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <StatusDot status={upload.status} />
        <span className="truncate text-[0.62rem] text-muted-foreground">
          {upload.kind}
        </span>
      </div>
    </button>
  );
}

function WeekPlanner({
  week,
  setWeek,
  byDay,
  selected,
  onSelect,
}: {
  week: 0 | 1;
  setWeek: (w: 0 | 1) => void;
  byDay: Record<number, ScheduledUpload[]>;
  selected: string | null;
  onSelect: (u: ScheduledUpload) => void;
}) {
  const days = SCHEDULE_DAYS.filter((d) => d.week === week);

  return (
    <section className="card-surface animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500 [animation-delay:220ms] rounded-lg border border-border p-4 motion-reduce:animate-none sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="size-4 text-primary" />
          <h2 className="text-base font-semibold tracking-tight">Week planner</h2>
          <span className="hidden font-mono text-xs text-muted-foreground/80 sm:inline">
            {SCHEDULE_WEEKS[week].range}
          </span>
        </div>

        <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5">
          {SCHEDULE_WEEKS.map((w, i) => (
            <button
              key={w.label}
              type="button"
              onClick={() => setWeek(i as 0 | 1)}
              aria-pressed={week === i}
              className={cn(
                "rounded-[0.4rem] px-3 py-1.5 text-xs font-semibold transition-colors",
                week === i
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar mt-4 overflow-x-auto pb-1">
        <div className="grid min-w-[820px] grid-cols-7 gap-2 sm:gap-2.5 lg:min-w-0">
          {days.map((day) => {
            const items = byDay[day.index] ?? [];
            return (
              <div
                key={day.index}
                className={cn(
                  "flex flex-col rounded-lg border p-2 transition-colors",
                  day.isToday
                    ? "border-primary/45 bg-primary/[0.05]"
                    : "border-border/70 bg-muted/15",
                  day.isPast && "opacity-50",
                )}
              >
                <div className="flex items-baseline justify-between px-0.5 pb-2">
                  <span
                    className={cn(
                      "text-[0.7rem] font-semibold uppercase tracking-wide",
                      day.isToday ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {day.isToday ? "Today" : day.weekday}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-sm font-bold tabular-nums",
                      day.isToday ? "text-primary" : "text-foreground/80",
                    )}
                  >
                    {day.dayNum}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  {items.length > 0 ? (
                    items.map((u) => (
                      <PlannerChip
                        key={u.id}
                        upload={u}
                        selected={selected === u.id}
                        onSelect={onSelect}
                      />
                    ))
                  ) : (
                    <button
                      type="button"
                      aria-label={`Add upload on ${day.weekday} ${day.dayNum}`}
                      className="flex min-h-[60px] flex-1 items-center justify-center rounded-md border border-dashed border-border/70 text-muted-foreground/40 transition-colors hover:border-foreground/20 hover:text-muted-foreground"
                    >
                      <Plus className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 pt-3 text-[0.68rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <StatusDot status="Scheduled" /> Scheduled
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot status="Rendering" /> Rendering
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot status="Draft" /> Draft
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="size-3 text-primary" /> Autopilot
        </span>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Up next queue                                                             */
/* -------------------------------------------------------------------------- */

function QueueRow({
  upload,
  selected,
  onSelect,
}: {
  upload: ScheduledUpload;
  selected: boolean;
  onSelect: (u: ScheduledUpload) => void;
}) {
  const day = SCHEDULE_DAYS[upload.dayIndex];
  const Icon = KIND_ICON[upload.kind];
  return (
    <button
      type="button"
      onClick={() => onSelect(upload)}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors",
        selected
          ? "bg-primary/[0.08] ring-1 ring-inset ring-primary/30"
          : "hover:bg-muted/50",
      )}
    >
      {upload.visual ? (
        <Image
          src={upload.thumb}
          alt=""
          width={104}
          height={64}
          className="h-10 w-[60px] shrink-0 rounded-md object-cover ring-1 ring-inset ring-black/10 dark:ring-white/10"
        />
      ) : (
        <div className="flex h-10 w-[60px] shrink-0 items-center justify-center rounded-md bg-muted/50 ring-1 ring-inset ring-black/10 dark:ring-white/10">
          <Icon className="size-4 text-muted-foreground/60" strokeWidth={1.5} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
          {upload.autopilot ? (
            <Sparkles className="size-3 shrink-0 text-primary" />
          ) : null}
          <span className="truncate">{upload.title}</span>
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">
            {relativeDay(upload.dayIndex)}
          </span>{" "}
          · {day.weekday} {day.dayNum} ·{" "}
          <span className="font-mono tabular-nums">{upload.timeLabel}</span>
        </p>
      </div>

      <span
        className={cn(
          "hidden shrink-0 items-center gap-1.5 text-[0.68rem] font-medium sm:flex",
          STATUS[upload.status].text,
        )}
      >
        <StatusDot status={upload.status} />
        {upload.status}
      </span>
    </button>
  );
}

function UpcomingQueue({
  queue,
  selected,
  onSelect,
}: {
  queue: ScheduledUpload[];
  selected: string | null;
  onSelect: (u: ScheduledUpload) => void;
}) {
  return (
    <section className="card-surface animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500 rounded-lg border border-border p-5 [animation-delay:340ms] motion-reduce:animate-none">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-primary" />
          <h2 className="text-base font-semibold tracking-tight">Up next</h2>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {queue.length} queued
        </span>
      </div>

      <div className="mt-3 flex flex-col divide-y divide-border/60">
        {queue.map((u, i) => (
          <Reveal key={u.id} delay={440 + i * 45}>
            <QueueRow
              upload={u}
              selected={selected === u.id}
              onSelect={onSelect}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  View                                                                      */
/* -------------------------------------------------------------------------- */

export function ScheduleView() {
  const { channel, channelId } = useStudio();
  const schedule = useMemo(() => getSchedule(channelId), [channelId]);
  const best = useMemo(() => getBestTimes(channelId), [channelId]);

  const [week, setWeek] = useState<0 | 1>(0);
  const [selected, setSelected] = useState<string | null>(null);

  // Reset selection + view to the current week whenever the channel changes.
  // Adjusting state during render (with a previous-value guard) is the React-
  // recommended alternative to a reset effect — no extra render pass.
  const [prevChannel, setPrevChannel] = useState(channelId);
  if (prevChannel !== channelId) {
    setPrevChannel(channelId);
    setSelected(null);
    setWeek(0);
  }

  // Selecting an upload highlights it everywhere and jumps the planner to its week.
  const select = (u: ScheduledUpload) => {
    setSelected((cur) => (cur === u.id ? null : u.id));
    setWeek(u.dayIndex < 7 ? 0 : 1);
  };

  const byDay = useMemo(() => {
    const m: Record<number, ScheduledUpload[]> = {};
    for (const u of schedule) (m[u.dayIndex] ??= []).push(u);
    return m;
  }, [schedule]);

  const thisWeek = schedule.filter((u) => u.dayIndex < 7).length;
  const autopilot = schedule.filter((u) => u.autopilot).length;
  const next = schedule[0];
  const queue = schedule.slice(0, 6);

  return (
    <>
      <StudioTopbar title="Schedule" subtitle={channel.name}>
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary/90 active:scale-[0.97] motion-reduce:transition-none"
        >
          <Sparkles className="size-4" />
          New idea
        </Link>
      </StudioTopbar>

      <div className="mx-auto max-w-[1440px] space-y-4 px-5 py-8 sm:space-y-6 sm:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            index={0}
            icon={CalendarClock}
            label="Scheduled"
            value={`${schedule.length}`}
            sub="uploads queued"
          />
          <StatCard
            index={1}
            icon={CalendarDays}
            label="This week"
            value={`${thisWeek}`}
            sub={SCHEDULE_WEEKS[0].range}
          />
          <StatCard
            index={2}
            icon={Sparkles}
            label="On Autopilot"
            value={`${autopilot}`}
            sub="auto-generated"
          />
          <StatCard
            index={3}
            icon={Clock3}
            label="Next publish"
            value={next ? relativeDay(next.dayIndex) : "—"}
            sub={next ? `${next.timeLabel} · ${next.kind}` : "Nothing queued"}
          />
        </div>

        {/* Planner */}
        <WeekPlanner
          week={week}
          setWeek={setWeek}
          byDay={byDay}
          selected={selected}
          onSelect={select}
        />

        {/* Intelligence + queue */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <BestTimeCard best={best} channelName={channel.name} />
          </div>
          <div className="xl:col-span-5">
            <UpcomingQueue queue={queue} selected={selected} onSelect={select} />
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Best-time card (resolves data from props, not the placeholder above)      */
/* -------------------------------------------------------------------------- */

function BestTimeCard({
  best,
  channelName,
}: {
  best: ReturnType<typeof getBestTimes>;
  channelName: string;
}) {
  const { grid, weekdays, slots, bestDay, bestSlot, bestLabel } = best;
  return (
    <section className="card-surface animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500 rounded-lg border border-border p-5 [animation-delay:300ms] motion-reduce:animate-none">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock3 className="size-4 text-primary" />
          <h2 className="text-base font-semibold tracking-tight">
            Best time to publish
          </h2>
        </div>
        <span className="hidden truncate text-xs text-muted-foreground sm:inline">
          When {channelName}&rsquo;s audience is active
        </span>
      </div>

      <div
        className="mt-4 grid items-center gap-1.5 sm:gap-2"
        style={{
          gridTemplateColumns: `2.4rem repeat(${slots.length}, minmax(0, 1fr))`,
        }}
      >
        <span />
        {slots.map((s) => (
          <span
            key={s}
            className="text-center font-mono text-[0.6rem] text-muted-foreground/70"
          >
            {s}
          </span>
        ))}

        {grid.map((row, day) => (
          <Fragment key={day}>
            <span className="font-mono text-[0.62rem] text-muted-foreground/70">
              {weekdays[day]}
            </span>
            {row.map((v, slot) => {
              const isBest = day === bestDay && slot === bestSlot;
              return (
                <div
                  key={slot}
                  title={`${weekdays[day]} ${slots[slot]} — ${["quiet", "low", "fair", "busy", "peak"][v]}`}
                  style={{ animationDelay: `${420 + (day + slot) * 15}ms` }}
                  className={cn(
                    "h-6 animate-in fade-in-0 zoom-in-75 fill-mode-both duration-300 rounded-[4px] ring-1 ring-inset ring-black/5 sm:h-7 dark:ring-white/5 motion-reduce:animate-none",
                    HEAT[v],
                    isBest && "ring-2 ring-primary ring-offset-1 ring-offset-card",
                  )}
                />
              );
            })}
          </Fragment>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-md bg-primary/[0.08] px-3 py-2 text-xs">
          <Sparkles className="size-3.5 shrink-0 text-primary" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">Recommended:</span>{" "}
            publish{" "}
            <span className="font-semibold text-foreground">{bestLabel}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.62rem] text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={cn("size-3 rounded-[3px]", HEAT[l])} />
          ))}
          <span>More</span>
        </div>
      </div>
    </section>
  );
}

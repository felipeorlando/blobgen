import Image from "next/image";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gem,
  Layers,
  type LucideIcon,
  Plus,
  ChartColumnIncreasing,
  Zap,
} from "lucide-react";
import { PlayBadge } from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { Switch } from "@/components/ui/switch";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ControlCenter() {
  return (
    <section
      id="features"
      className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
    >
      <div className="glow-radial" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Scheduling / Control Center"
          eyebrowIcon={CalendarDays}
          title={
            <>
              <span className="text-grad-light">Scale your Shorts with a </span>
              <span className="text-grad-red">content control center.</span>
            </>
          }
          subtitle="Schedule, queue, and publish on autopilot. Everything in one place to keep your channel consistent and growing."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          {/* Left rail */}
          <div className="flex flex-col gap-5 lg:col-span-3">
            <AutoPublishCard />
            <BatchCard />
          </div>

          {/* Center */}
          <div className="flex flex-col gap-5 lg:col-span-6">
            <PublishingCalendar />
            <UpcomingQueue />
          </div>

          {/* Right rail */}
          <div className="flex flex-col gap-5 lg:col-span-3">
            <MetadataCard />
            <PerformanceCard />
          </div>
        </div>

        <CtaBar />
      </div>
    </section>
  );
}

/* ---------- shared ---------- */

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card card-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <Panel className="p-5">
      <div className="flex items-center gap-2.5">
        <span className="text-primary">
          <Icon className="size-5" />
        </span>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-4">{children}</div>
    </Panel>
  );
}

function MiniPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-muted/50 p-3.5 dark:bg-background/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-1 text-xs font-medium text-muted-foreground dark:bg-background/60">
      {children}
    </span>
  );
}

/* ---------- left rail ---------- */

const BARS = [38, 52, 30, 62, 46, 88, 44];
const BAR_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function AutoPublishCard() {
  return (
    <FeatureCard
      icon={Clock}
      title="Auto publish"
      desc="Set it once. We'll publish your Shorts at the best times for engagement."
    >
      <MiniPanel>
        <p className="text-xs text-muted-foreground">Best time to post</p>
        <p className="mt-0.5 text-2xl font-bold text-foreground">6:30 PM</p>
        <p className="text-xs text-muted-foreground">Today</p>
        <div className="mt-3 flex items-end gap-1.5">
          {BARS.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-16 w-full items-end">
                <div
                  className={cn(
                    "w-full rounded-sm",
                    i === 5
                      ? "bg-primary"
                      : "bg-foreground/15 dark:bg-muted-foreground/25",
                  )}
                  style={{ height: `${h}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {BAR_LABELS[i]}
              </span>
            </div>
          ))}
        </div>
      </MiniPanel>
    </FeatureCard>
  );
}

const BATCH_ITEMS = [
  { label: "10 ideas generated", img: "/images/space.jpg" },
  { label: "Scripts ready", img: "/images/history.jpg" },
  { label: "Voiceovers added", img: "/images/lion.jpg" },
  { label: "Visuals created", img: "/images/travel.jpg" },
  { label: "Ready to schedule", img: "/images/city.jpg" },
];

function BatchCard() {
  return (
    <FeatureCard
      icon={Layers}
      title="Batch generation"
      desc="Create weeks of Shorts in minutes and queue them with one click."
    >
      <MiniPanel className="space-y-2.5">
        {BATCH_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="relative size-7 shrink-0 overflow-hidden rounded-md">
              <Image src={item.img} alt="" fill sizes="28px" className="object-cover" />
            </span>
            <span className="flex-1 text-sm text-foreground">{item.label}</span>
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-3" strokeWidth={3} />
            </span>
          </div>
        ))}
      </MiniPanel>
    </FeatureCard>
  );
}

/* ---------- center: calendar ---------- */

const DAYS = [
  { name: "Mon", num: "12" },
  { name: "Tue", num: "13" },
  { name: "Wed", num: "14", active: true },
  { name: "Thu", num: "15" },
  { name: "Fri", num: "16" },
  { name: "Sat", num: "17" },
  { name: "Sun", num: "18" },
];

const TIMES = ["9 AM", "12 PM", "3 PM", "6 PM", "9 PM"];

type CalEvent = { title: string; time: string; img: string };
const EVENTS: Record<string, CalEvent> = {
  "1-0": { title: "Mindset shift", time: "12:00 PM", img: "/images/mountains.jpg" },
  "0-2": { title: "Superfoods", time: "9:30 AM", img: "/images/blueberries.jpg" },
  "2-2": { title: "Space facts", time: "3:00 PM", img: "/images/space.jpg" },
  "1-4": { title: "Stay focused", time: "12:30 PM", img: "/images/lion.jpg" },
  "3-4": { title: "NYC at sunset", time: "6:00 PM", img: "/images/city.jpg" },
  "4-6": { title: "Deep work", time: "9:00 PM", img: "/images/desk.jpg" },
};
const ADD_SLOTS = new Set(["0-6", "4-0"]);

function PublishingCalendar() {
  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">
          Publishing calendar
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/60 px-1 py-1 dark:bg-background/60">
            <ChevronLeft className="size-4 text-muted-foreground" />
            <span className="px-1 text-xs font-medium text-foreground">
              May 12 – May 18, 2025
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
          <Pill>
            Week <ChevronDown className="size-3" />
          </Pill>
          <span
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-8 rounded-lg px-3 text-xs font-semibold hover:bg-primary",
            )}
          >
            New Short
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto no-scrollbar">
        <div className="min-w-[640px]">
          {/* header */}
          <div className="grid grid-cols-[2.75rem_repeat(7,minmax(0,1fr))] border-b border-border pb-2">
            <div />
            {DAYS.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"
              >
                <span>{d.name}</span>
                {d.active ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {d.num}
                  </span>
                ) : (
                  <span className="font-medium text-foreground">{d.num}</span>
                )}
              </div>
            ))}
          </div>

          {/* body */}
          <div>
            {TIMES.map((time, row) => (
              <div
                key={time}
                className="grid grid-cols-[2.75rem_repeat(7,minmax(0,1fr))] border-b border-border/60 last:border-b-0"
              >
                <div className="py-2 pr-2 text-right text-[11px] text-muted-foreground">
                  {time}
                </div>
                {DAYS.map((d, col) => {
                  const key = `${row}-${col}`;
                  const ev = EVENTS[key];
                  const isAdd = ADD_SLOTS.has(key);
                  return (
                    <div
                      key={col}
                      className="min-h-[5.5rem] border-l border-border/50 p-1"
                    >
                      {ev ? <EventCard ev={ev} /> : null}
                      {isAdd ? <AddSlot /> : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function EventCard({ ev }: { ev: CalEvent }) {
  return (
    <div className="rounded-lg border border-border bg-muted/70 p-1.5 dark:bg-background/70">
      <div className="relative h-9 w-full overflow-hidden rounded-md">
        <Image src={ev.img} alt="" fill sizes="90px" className="object-cover" />
        <PlayBadge className="absolute bottom-1 left-1 h-3 w-[17px]" />
      </div>
      <p className="mt-1 truncate text-[11px] font-medium text-foreground">
        {ev.title}
      </p>
      <p className="text-[10px] text-muted-foreground">{ev.time}</p>
    </div>
  );
}

function AddSlot() {
  return (
    <div className="flex h-full min-h-[4.5rem] items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground/60">
      <Plus className="size-4" />
    </div>
  );
}

/* ---------- center: queue ---------- */

const QUEUE = [
  { title: "Space is completely silent.", when: "May 14, 2025  ·  3:00 PM", img: "/images/space.jpg" },
  { title: "Blueberries: tiny but mighty.", when: "May 16, 2025  ·  9:30 AM", img: "/images/blueberries.jpg" },
  { title: "Discipline over motivation.", when: "May 17, 2025  ·  12:30 PM", img: "/images/lion.jpg" },
];

function UpcomingQueue() {
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Upcoming queue
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Auto-publish</span>
          <Switch defaultChecked aria-label="Auto-publish" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {QUEUE.map((q) => (
          <div
            key={q.title}
            className="rounded-xl border border-border bg-muted/50 p-2.5 dark:bg-background/50"
          >
            <div className="flex items-start gap-2.5">
              <span className="relative size-11 shrink-0 overflow-hidden rounded-lg">
                <Image src={q.img} alt="" fill sizes="44px" className="object-cover" />
              </span>
              <p className="text-sm font-medium leading-snug text-foreground">
                {q.title}
              </p>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{q.when}</span>
              <PlayBadge className="h-3.5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-2 rounded-full bg-emerald-500" />
        12 Shorts scheduled
      </div>
    </Panel>
  );
}

/* ---------- right rail ---------- */

function MetadataCard() {
  return (
    <FeatureCard
      icon={Gem}
      title="Channel-ready metadata"
      desc="Auto-generate titles, descriptions, hashtags, and thumbnails optimized for YouTube."
    >
      <MiniPanel className="space-y-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src="/images/mountains.jpg"
            alt="Generated thumbnail preview"
            fill
            sizes="280px"
            className="object-cover"
          />
          <PlayBadge className="absolute bottom-2 right-2 h-4 w-6" />
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Title</p>
          <p className="text-sm font-medium text-foreground">Nature heals.</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Description</p>
          <p className="text-sm text-foreground/90">
            A moment of calm in a chaotic world.
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Hashtags</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {["#nature", "#calm", "#shorts"].map((t) => (
              <span
                key={t}
                className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-[11px] text-muted-foreground">Visibility</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
            Public <ChevronDown className="size-3 text-muted-foreground" />
          </span>
        </div>
      </MiniPanel>
    </FeatureCard>
  );
}

const STATS = [
  { label: "Views", value: "128.4K", delta: "18.6%" },
  { label: "Avg. retention", value: "62%", delta: "7.2%" },
  { label: "Subscribers", value: "+3.2K", delta: "24.1%" },
];

function PerformanceCard() {
  return (
    <FeatureCard
      icon={ChartColumnIncreasing}
      title="Performance snapshots"
      desc="Track what's working and double down on what drives growth."
    >
      <MiniPanel>
        <div className="flex gap-4">
          <div className="flex-1 space-y-3">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-foreground">
                    {s.value}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    ↑ {s.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex w-24 items-center">
            <Sparkline />
          </div>
        </div>
      </MiniPanel>
    </FeatureCard>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 100 60" className="h-full w-full" aria-hidden="true">
      <polyline
        points="0,50 16,42 30,46 46,30 60,34 76,16 100,6"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- bottom CTA bar ---------- */

function CtaBar() {
  return (
    <Panel className="mt-5 p-5 sm:p-6">
      <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-3">
          <span className="text-primary">
            <Zap className="size-5" />
          </span>
          <p className="text-base font-medium text-foreground">
            Automate your content. Grow your channel. Save hours every week.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
          <a
            href="#pricing"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-11 rounded-xl px-6 text-sm font-semibold glow-red hover:bg-primary",
            )}
          >
            Start automating
          </a>
          <a
            href="#features"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "h-11 rounded-xl px-6 text-sm font-semibold",
            )}
          >
            See the dashboard
          </a>
        </div>
      </div>
    </Panel>
  );
}

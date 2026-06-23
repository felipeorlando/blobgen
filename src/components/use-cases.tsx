import Image from "next/image";
import {
  ArrowRight,
  Captions,
  CalendarClock,
  Cpu,
  Landmark,
  Lightbulb,
  type LucideIcon,
  Mic,
  Play,
  Plane,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UseCase = {
  title: string;
  icon: LucideIcon;
  src: string;
  alt: string;
};

const USE_CASES: UseCase[] = [
  { title: "Motivation", icon: Star, src: "/images/motivation.jpg", alt: "Sunrise over mountains" },
  { title: "Facts", icon: Lightbulb, src: "/images/hourglass.jpg", alt: "Hourglass with running sand" },
  { title: "Finance", icon: TrendingUp, src: "/images/finance.jpg", alt: "Charging bull statue" },
  { title: "Tech", icon: Cpu, src: "/images/tech.jpg", alt: "Circuit board close-up" },
  { title: "Travel", icon: Plane, src: "/images/travel.jpg", alt: "Tropical beach at sunset" },
  { title: "History", icon: Landmark, src: "/images/history.jpg", alt: "Ancient ruins at golden hour" },
];

const FEATURES = [
  { title: "AI hooks", icon: Zap, desc: "Scroll-stopping ideas that get views." },
  { title: "Voiceover", icon: Mic, desc: "Natural, on-brand voice that fits your niche." },
  { title: "Auto captions", icon: Captions, desc: "Crisp, accurate captions that keep viewers watching." },
  { title: "Schedule to YouTube", icon: CalendarClock, desc: "We publish on autopilot so you stay consistent." },
];

export function UseCases() {
  return (
    <section id="use-cases" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Use cases"
          eyebrowIcon={Play}
          title={
            <>
              <span className="text-grad-light">One engine. </span>
              <span className="text-grad-accent">Endless Short ideas.</span>
            </>
          }
          subtitle="blobgen.ai adapts to any niche—generating ideas, building your Short, and getting it live so you can scale what works."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map(({ title, icon: Icon, src, alt }) => (
            <article
              key={title}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-card via-card/40 to-transparent" />
              </div>
              <div className="flex items-start gap-4 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Hooks, visuals, captions, and upload handled for you.
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Feature strip */}
        <div className="mt-10 rounded-2xl border border-border bg-card card-surface">
          <div className="grid divide-y divide-border md:grid-cols-4 md:divide-x md:divide-y-0">
            {FEATURES.map(({ title, icon: Icon, desc }) => (
              <div key={title} className="flex items-start gap-3.5 p-6">
                <span className="mt-0.5 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="#pricing"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-12 rounded-xl px-7 text-base font-semibold glow-accent hover:bg-primary",
            )}
          >
            Explore use cases
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Check, Play, Rocket, Tag, ShieldCheck, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Switch } from "@/components/ui/switch";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  shorts: string;
  icon: typeof Play;
  features: string[];
  cta: string;
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    tagline: "Perfect for getting started.",
    monthly: 29,
    annual: 23,
    shorts: "30 Shorts",
    icon: Play,
    features: [
      "1 YouTube channel",
      "Scripts, captions & visuals",
      "Auto-scheduling",
      "Basic analytics",
    ],
    cta: "Start Starter",
  },
  {
    name: "Growth",
    tagline: "Built to grow your audience.",
    monthly: 79,
    annual: 63,
    shorts: "120 Shorts",
    icon: TrendingUp,
    features: [
      "Up to 3 YouTube channels",
      "Premium voices",
      "Advanced analytics",
      "Auto-publish to YouTube",
      "Priority support",
    ],
    cta: "Start Growth",
    popular: true,
  },
  {
    name: "Scale",
    tagline: "For creators & teams scaling fast.",
    monthly: 199,
    annual: 159,
    shorts: "500 Shorts",
    icon: Rocket,
    features: [
      "Up to 10 YouTube channels",
      "Team access (5 seats)",
      "API access",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start Scale",
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          eyebrowIcon={Tag}
          title={
            <>
              <span className="text-grad-light">Simple pricing for </span>
              <span className="text-grad-accent">creators who want consistency.</span>
            </>
          }
          subtitle="Turn any idea into high-quality YouTube Shorts—script, visuals, captions, and scheduling—on autopilot."
        />

        {/* Billing toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              annual ? "text-muted-foreground" : "text-primary",
            )}
          >
            Monthly
          </span>
          <Switch
            checked={annual}
            onCheckedChange={setAnnual}
            aria-label="Toggle annual billing"
          />
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              annual ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Annual <span className="text-primary">(20% off)</span>
          </span>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl items-start gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = annual ? plan.annual : plan.monthly;
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-6 sm:p-7",
                  plan.popular
                    ? "border-primary/60 shadow-[0_0_60px_-20px_var(--primary)]"
                    : "border-border card-surface",
                )}
              >
                {plan.popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                    Most Popular
                  </span>
                ) : null}

                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.tagline}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-foreground">
                    ${price}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {plan.shorts}
                  </span>{" "}
                  / month
                </p>

                <div className="my-6 h-px bg-border" />

                <ul className="flex-1 space-y-3.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/onboarding"
                  className={cn(
                    buttonVariants({
                      variant: plan.popular ? "default" : "secondary",
                    }),
                    "mt-7 h-11 rounded-xl text-sm font-semibold",
                    plan.popular && "glow-accent hover:bg-primary",
                  )}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          <span>
            Cancel anytime. No long-term contracts. Start free, upgrade later.
          </span>
        </div>
      </div>
    </section>
  );
}

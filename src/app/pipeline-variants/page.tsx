import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Eyebrow } from "@/components/section-heading";
import { VariantSplit } from "@/components/variants/variant-split";
import { VariantPhone } from "@/components/variants/variant-phone";
import { VariantFlow } from "@/components/variants/variant-flow";
import { VariantConsole } from "@/components/variants/variant-console";
import { VariantBento } from "@/components/variants/variant-bento";
import { VariantSpotlight } from "@/components/variants/variant-spotlight";

export const metadata: Metadata = {
  title: "Pipeline — step-by-step concepts",
  robots: { index: false },
};

const VARIANTS = [
  {
    n: 1,
    title: "Auto-advancing showcase",
    desc: "Steps on the left, a rich panel on the right that slides between them automatically. Hover to pause, click a step to jump.",
    Component: VariantSplit,
  },
  {
    n: 2,
    title: "Assembling phone",
    desc: "A segmented timeline up top while the Short builds itself layer by layer—topic, script, voiceover, b-roll, captions, then scheduled.",
    Component: VariantPhone,
  },
  {
    n: 3,
    title: "Flowing pipeline",
    desc: "Connected nodes with a pulse travelling the wire. The active node lights up and a detail card glides into place beneath it.",
    Component: VariantFlow,
  },
  {
    n: 4,
    title: "Render console",
    desc: "The Short builds like a deployment: a dividers-only run log on the left, a live terminal pane on the right streaming each stage's output line by line.",
    Component: VariantConsole,
  },
  {
    n: 5,
    title: "Focus bento",
    desc: "An asymmetric tile grid where focus glides from stage to stage. The active tile elevates and runs its own perpetual micro-interaction.",
    Component: VariantBento,
  },
  {
    n: 6,
    title: "Stage spotlight",
    desc: "A 3D coverflow rail. The active stage scales to centre under a cursor-tracked spotlight while neighbours angle back.",
    Component: VariantSpotlight,
  },
];

export default function PipelineVariantsPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden">
        <div className="glow-radial" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Eyebrow icon={Sparkles}>Step-by-step concepts</Eyebrow>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              <span className="text-grad-light">Three ways to show the </span>
              <span className="text-grad-red">pipeline.</span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Each concept loops through the six steps automatically. Pick the one
              that fits—they all share the same content and design tokens.
            </p>
          </div>

          <div className="mt-16 flex flex-col gap-20">
            {VARIANTS.map(({ n, title, desc, Component }) => (
              <section key={n}>
                <div className="mb-8 flex flex-col gap-2 border-l-2 border-primary pl-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Version {n}
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {title}
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
                <Component />
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

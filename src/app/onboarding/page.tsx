import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "Set up your faceless YouTube channel with blobgen.ai — pick a niche, name your channel, and generate your first Short on autopilot.",
};

function OnboardingFallback() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-primary motion-reduce:animate-none" />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <OnboardingFlow />
    </Suspense>
  );
}

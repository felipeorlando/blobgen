"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  stepMeta,
  suggestCompetitors,
  WIZARD_STEPS,
} from "@/lib/onboarding";
import {
  OnboardingProvider,
  useOnboarding,
  type OnboardingState,
} from "./onboarding-context";
import { WizardShell } from "./wizard-shell";
import { AuthStep } from "./steps/auth-step";
import { ConnectStep } from "./steps/connect-step";
import { AnalyzeStep } from "./steps/analyze-step";
import { DescribeStep } from "./steps/describe-step";
import { CompetitorsStep } from "./steps/competitors-step";

// Mirrors the studio's channel persistence key (see studio-context.tsx), so the
// connected channel is already active when the user lands in the studio.
const STUDIO_CHANNEL_KEY = "blobgen-studio-channel";

// Sequence: account → connect → channel (analyze/describe) → competitors.
const AUTH_INDEX = 0;
const FIRST_WIZARD = 1;
const LAST_INDEX = WIZARD_STEPS.length; // 3 (competitors)

export function OnboardingFlow() {
  const params = useSearchParams();
  const mode = params.get("mode") === "signin" ? "signin" : "signup";
  return (
    <OnboardingProvider initialAuthMode={mode}>
      <FlowInner />
    </OnboardingProvider>
  );
}

function FlowInner() {
  const router = useRouter();
  const { state, set, isNew, topicKey, studioChannelId } = useOnboarding();
  const [index, setIndex] = useState(AUTH_INDEX);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index]);

  function next() {
    const target = Math.min(index + 1, LAST_INDEX);
    // Pre-seed AI-suggested competitors when arriving at the competitors step.
    if (
      WIZARD_STEPS[target - FIRST_WIZARD]?.id === "competitors" &&
      state.competitorIds.length === 0
    ) {
      set({ competitorIds: suggestCompetitors(topicKey).map((c) => c.id) });
    }
    setDirection(1);
    setIndex(target);
  }

  function back() {
    setDirection(-1);
    setIndex((i) => Math.max(i - 1, AUTH_INDEX));
  }

  function finish() {
    try {
      localStorage.setItem(STUDIO_CHANNEL_KEY, studioChannelId);
    } catch {
      /* storage unavailable — the studio falls back to its default channel */
    }
    router.push("/studio");
  }

  if (index === AUTH_INDEX) {
    return <AuthStep onNext={next} />;
  }

  const wizardIndex = index - FIRST_WIZARD; // 0..2
  const stepDef = WIZARD_STEPS[wizardIndex];
  const meta = stepMeta(stepDef.id, isNew);
  const isFinal = index === LAST_INDEX;

  return (
    <WizardShell
      index={wizardIndex}
      step={{ id: stepDef.id, ...meta }}
      direction={direction}
      isFinal={isFinal}
      canContinue={canContinue(stepDef.id, isNew, state)}
      onBack={back}
      onContinue={isFinal ? finish : next}
    >
      {stepDef.id === "connect" ? <ConnectStep /> : null}
      {stepDef.id === "channel" ? (
        isNew ? (
          <DescribeStep />
        ) : (
          <AnalyzeStep key={state.selectedChannelId ?? "none"} />
        )
      ) : null}
      {stepDef.id === "competitors" ? <CompetitorsStep /> : null}
    </WizardShell>
  );
}

function canContinue(
  id: (typeof WIZARD_STEPS)[number]["id"],
  isNew: boolean,
  state: OnboardingState,
): boolean {
  switch (id) {
    case "connect":
      return state.selectedChannelId !== null;
    case "channel":
      return isNew
        ? state.newName.trim().length > 0 && state.newAbout.trim().length > 0
        : state.analysisDone;
    case "competitors":
      return true;
  }
}

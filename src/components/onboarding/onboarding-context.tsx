"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { getChannel } from "@/lib/studio";
import { NEW_CHANNEL_ID } from "@/lib/onboarding";

export type OnboardingState = {
  authMode: "signup" | "signin";
  name: string;
  email: string;

  connected: boolean;
  /** A detected channel id, NEW_CHANNEL_ID, or null before a pick. */
  selectedChannelId: string | null;

  /** Existing-channel path: editable AI summary + completion flag. */
  analysisSummary: string;
  analysisDone: boolean;

  /** New-channel path. */
  newName: string;
  newHandle: string;
  newAbout: string;
  newAvatar: string;

  /** Selected competitor ids. */
  competitorIds: string[];
};

const INITIAL: OnboardingState = {
  authMode: "signup",
  name: "",
  email: "",

  connected: false,
  selectedChannelId: null,

  analysisSummary: "",
  analysisDone: false,

  newName: "",
  newHandle: "",
  newAbout: "",
  newAvatar: "/images/tech.jpg",

  competitorIds: [],
};

type OnboardingValue = {
  state: OnboardingState;
  set: (patch: Partial<OnboardingState>) => void;
  /** True when the user chose "start a new channel". */
  isNew: boolean;
  /** Topic/niche key used to suggest competitors (channel id or about text). */
  topicKey: string;
  /** The studio channel to activate on finish (existing pick, else default). */
  studioChannelId: string;
};

const Ctx = createContext<OnboardingValue | null>(null);

export function OnboardingProvider({
  initialAuthMode = "signup",
  children,
}: {
  initialAuthMode?: "signup" | "signin";
  children: React.ReactNode;
}) {
  const [state, setState] = useState<OnboardingState>({
    ...INITIAL,
    authMode: initialAuthMode,
  });

  const value = useMemo<OnboardingValue>(() => {
    const isNew = state.selectedChannelId === NEW_CHANNEL_ID;
    const isExisting = !!state.selectedChannelId && !isNew;

    return {
      state,
      set: (patch) => setState((prev) => ({ ...prev, ...patch })),
      isNew,
      topicKey: isExisting ? state.selectedChannelId! : state.newAbout,
      // New channels have no studio data; fall back to the first demo channel.
      studioChannelId: isExisting ? state.selectedChannelId! : getChannel("").id,
    };
  }, [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOnboarding(): OnboardingValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useOnboarding must be used within <OnboardingProvider>");
  }
  return ctx;
}

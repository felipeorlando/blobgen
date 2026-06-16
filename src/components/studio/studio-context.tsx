"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CHANNELS, getChannel, type Channel } from "@/lib/studio";

const STORAGE_KEY = "blobgen-studio-channel";

type StudioValue = {
  channels: Channel[];
  channel: Channel;
  channelId: string;
  setChannelId: (id: string) => void;
};

const StudioContext = createContext<StudioValue | null>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  // Default deterministically so SSR and first client render agree.
  const [channelId, setChannelId] = useState<string>(CHANNELS[0].id);

  // Restore the last-used channel after mount (avoids hydration mismatch).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && CHANNELS.some((c) => c.id === stored)) {
        setChannelId(stored);
      }
    } catch {
      /* storage unavailable — keep the default */
    }
  }, []);

  const value = useMemo<StudioValue>(
    () => ({
      channels: CHANNELS,
      channel: getChannel(channelId),
      channelId,
      setChannelId: (id: string) => {
        setChannelId(id);
        try {
          localStorage.setItem(STORAGE_KEY, id);
        } catch {
          /* ignore */
        }
      },
    }),
    [channelId],
  );

  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}

export function useStudio(): StudioValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used within <StudioProvider>");
  return ctx;
}

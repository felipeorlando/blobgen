import type { Metadata } from "next";
import { VoiceLabView } from "@/components/studio/voice-lab-view";

export const metadata: Metadata = {
  title: "Voice lab",
};

export default function VoiceLabPage() {
  return <VoiceLabView />;
}

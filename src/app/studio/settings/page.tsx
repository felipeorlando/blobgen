import type { Metadata } from "next";
import { SettingsView } from "@/components/studio/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Autopilot, generation defaults, and channel preferences.",
};

export default function SettingsPage() {
  return <SettingsView />;
}

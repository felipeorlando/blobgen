import type { Metadata } from "next";
import { ScheduleView } from "@/components/studio/schedule-view";

export const metadata: Metadata = {
  title: "Schedule",
};

export default function SchedulePage() {
  return <ScheduleView />;
}

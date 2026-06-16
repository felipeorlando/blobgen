import type { Metadata } from "next";
import { AnalyticsView } from "@/components/studio/analytics-view";

export const metadata: Metadata = {
  title: "Channel analytics",
};

export default function AnalyticsPage() {
  return <AnalyticsView />;
}

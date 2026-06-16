import type { Metadata } from "next";
import { AudienceView } from "@/components/studio/audience-view";

export const metadata: Metadata = {
  title: "Audience",
};

export default function AudiencePage() {
  return <AudienceView />;
}

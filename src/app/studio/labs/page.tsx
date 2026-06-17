import type { Metadata } from "next";
import { LabsHomeView } from "@/components/studio/labs-home-view";

export const metadata: Metadata = {
  title: "Labs",
  description: "Create images, video, voices, and music with AI.",
};

export default function LabsPage() {
  return <LabsHomeView />;
}

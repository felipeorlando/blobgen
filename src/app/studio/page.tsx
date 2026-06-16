import type { Metadata } from "next";
import { NewIdeaView } from "@/components/studio/new-idea-view";

export const metadata: Metadata = {
  title: "New idea",
};

export default function NewIdeaPage() {
  return <NewIdeaView />;
}

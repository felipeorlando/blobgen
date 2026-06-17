import type { Metadata } from "next";
import { EditorProjectsView } from "@/components/studio/editor-projects-view";

export const metadata: Metadata = {
  title: "Editor",
  description: "Edit pre-generated videos with sources from Labs and media.",
};

export default function EditorPage() {
  return <EditorProjectsView />;
}

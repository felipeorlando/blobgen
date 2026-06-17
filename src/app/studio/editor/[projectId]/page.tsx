import type { Metadata } from "next";
import { EditorCanvasView } from "@/components/studio/editor-canvas-view";

export const metadata: Metadata = {
  title: "Editor",
};

// In Next 16, dynamic `params` is a Promise and must be awaited.
export default async function EditorProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <EditorCanvasView projectId={projectId} />;
}

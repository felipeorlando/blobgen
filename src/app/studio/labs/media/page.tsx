import type { Metadata } from "next";
import { MediaBrowserView } from "@/components/studio/media-browser-view";

export const metadata: Metadata = {
  title: "Media",
  description: "Browse generated and stock images, video, and sound.",
};

export default function MediaPage() {
  return <MediaBrowserView />;
}

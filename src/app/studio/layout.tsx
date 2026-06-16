import type { Metadata } from "next";
import { StudioShell } from "@/components/studio/studio-shell";

export const metadata: Metadata = {
  title: "Studio",
  description: "Plan, generate, and analyze your channels with blobgen.ai.",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudioShell>{children}</StudioShell>;
}

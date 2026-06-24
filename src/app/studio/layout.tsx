import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StudioShell } from "@/components/studio/studio-shell";
import { auth } from "@/server/auth";

export const metadata: Metadata = {
  title: "Studio",
  description: "Plan, generate, and analyze your channels with blobgen.ai.",
};

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <StudioShell>{children}</StudioShell>;
}

import type { Metadata } from "next";
import { GeneratorLab } from "@/components/studio/generator-lab";

export const metadata: Metadata = {
  title: "Video studio",
};

export default function VideoLabPage() {
  return <GeneratorLab slug="video" />;
}

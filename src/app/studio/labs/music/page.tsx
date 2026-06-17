import type { Metadata } from "next";
import { GeneratorLab } from "@/components/studio/generator-lab";

export const metadata: Metadata = {
  title: "Music & songs",
};

export default function MusicLabPage() {
  return <GeneratorLab slug="music" />;
}

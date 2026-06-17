import type { Metadata } from "next";
import { GeneratorLab } from "@/components/studio/generator-lab";

export const metadata: Metadata = {
  title: "Image studio",
};

export default function ImageLabPage() {
  return <GeneratorLab slug="image" />;
}

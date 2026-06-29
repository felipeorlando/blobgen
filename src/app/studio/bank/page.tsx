import type { Metadata } from "next";
import { BankView } from "@/components/studio/bank-view";

export const metadata: Metadata = {
  title: "Image bank",
};

export default function BankPage() {
  return <BankView />;
}

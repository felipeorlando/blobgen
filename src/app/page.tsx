import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { UseCases } from "@/components/use-cases";
import { ControlCenter } from "@/components/control-center";
import { Pricing } from "@/components/pricing";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <UseCases />
        <ControlCenter />
        <Pricing />
      </main>
      <SiteFooter />
    </>
  );
}

import { ArrowRight } from "lucide-react";
import {
  InstagramIcon,
  LinkedInIcon,
  Logo,
  XIcon,
  YouTubeIcon,
} from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Examples", href: "#use-cases" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Templates", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Affiliate Program", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Refund Policy", href: "#" },
      { label: "GDPR", href: "#" },
    ],
  },
];

const SOCIALS = [
  { label: "YouTube", icon: YouTubeIcon },
  { label: "X", icon: XIcon },
  { label: "LinkedIn", icon: LinkedInIcon },
  { label: "Instagram", icon: InstagramIcon },
];

export function SiteFooter() {
  return (
    <footer id="footer" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)_1.6fr]">
          {/* Brand */}
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              AI video autopilot for YouTube. Create, publish, and grow on
              autopilot.
            </p>
            <div className="mt-5 flex gap-2.5">
              {SOCIALS.map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA card */}
          <div className="rounded-2xl border border-border bg-card p-6 card-surface">
            <h4 className="text-lg font-semibold text-foreground">
              Start creating today
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Join creators who automate and scale with AI.
            </p>
            <a
              href="/onboarding"
              className={cn(
                buttonVariants({ variant: "default" }),
                "mt-5 h-11 w-full rounded-xl text-sm font-semibold glow-red hover:bg-primary",
              )}
            >
              Start for free
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-5 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p className="order-last sm:order-first">
            © 2025 blobgen.ai. All rights reserved.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <p className="inline-flex items-center gap-1.5">
              Made with <span className="text-primary">♥</span> for creators
            </p>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}

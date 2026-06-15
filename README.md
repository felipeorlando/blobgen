# blobgen.ai

Marketing homepage for **blobgen.ai** — _"Keyword in. YouTube Short out."_ — an
AI tool that turns any topic into a finished YouTube Short (script, voiceover,
visuals, captions) and schedules or publishes it on autopilot.

This is a faithful, fully responsive implementation of the provided dark / red
landing-page design.

## Stack

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack) + **React 19**
- **[Bun](https://bun.sh)** as the package manager / runtime
- **[Tailwind CSS v4](https://tailwindcss.com)** with a CSS-variable theme
- **[shadcn/ui](https://ui.shadcn.com)** (Base UI primitives) + **lucide-react** icons
- **next/font** (Geist) and **next/image** for optimized assets

## Theme

A single dark theme is configured in `src/app/globals.css` using OKLCH design
tokens — a true-black background with a YouTube-red primary, plus helper
utilities for the white→grey and red gradient headlines and the red CTA glow.

## Sections

`src/components/` contains one component per section:

| Component | Section |
| --- | --- |
| `site-header.tsx` | Sticky navbar (with mobile menu) |
| `hero.tsx` | Hero + image showcase grid |
| `use-cases.tsx` | "One engine. Endless Short ideas." |
| `control-center.tsx` | Scheduling dashboard (calendar, queue, metadata, stats) |
| `pricing.tsx` | Pricing with monthly/annual toggle |
| `site-footer.tsx` | Footer + CTA |

## Getting started

```bash
bun install
bun run dev      # http://localhost:3000
```

```bash
bun run build    # production build
bun run start    # serve the production build
```

## Image credits

Photography from [Unsplash](https://unsplash.com); the Wall Street "Charging
Bull" photo is Creative Commons via [Openverse](https://openverse.org). All
images are stored locally in `public/images/`.

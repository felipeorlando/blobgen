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

## Getting started (frontend only)

```bash
bun install
bun run dev      # http://localhost:3000
```

```bash
bun run build    # production build
bun run start    # serve the production build
```

## Backend & the generation pipeline

The studio is backed by a real, staged generation pipeline (the
"pre-production brain"): **Research → Script → Materials → Storyboard**, with
**Production / Distribution** stubbed in the same engine for later waves. Each
stage is gated per channel (`manual` / `auto` / `ai_review`), metered by a
credits ledger, and runs as a background job.

**Stack:** Postgres + [Drizzle ORM], Auth.js v5 (Google/YouTube + dev login),
a swappable job runner (in-process by default, BullMQ/Redis optional) and blob
storage (local filesystem, S3/R2-ready), with provider adapters for OpenRouter
(LLM), Tavily/Exa (research), the YouTube Data API, and Replicate/Pexels.

> Every external provider has a **keyless mock fallback in dev**, so the whole
> pipeline runs end-to-end with no API keys. Add keys to `.env.local` to switch
> any stage to real output.

### Run it locally

```bash
docker compose up -d            # Postgres (+ Redis, Adminer)
cp .env.example .env.local      # optional — sensible defaults already match compose
bun run db:migrate              # apply the schema
bun run db:seed                 # seed demo channels + 500 credits for the dev user

bun run dev                     # http://localhost:3000
# Optional, only if JOB_DRIVER=bullmq:
bun run worker
```

Open **/studio**, sign in with **Continue as Dev (local)**, enter an idea on the
New Idea page, pick formats, and **Generate**. You'll land on the project
pipeline view where each stage runs, pauses for approval, and shows its output
(brief, script, materials, storyboard) while credits are deducted.

### Useful scripts

| Script | Purpose |
| --- | --- |
| `bun run db:generate` | generate a migration from the Drizzle schema |
| `bun run db:migrate` / `db:push` | apply migrations / push schema |
| `bun run db:seed` | seed demo channels, competitors, dev credits |
| `bun run db:studio` | open Drizzle Studio |
| `bun run worker` | BullMQ worker (when `JOB_DRIVER=bullmq`) |
| `bun run typecheck` · `bun test` · `bun run lint` | checks |

See `.env.example` for every configurable key (LLM, search, YouTube, Replicate,
job driver, storage, credits).

[Drizzle ORM]: https://orm.drizzle.team

## Image credits

Photography from [Unsplash](https://unsplash.com); the Wall Street "Charging
Bull" photo is Creative Commons via [Openverse](https://openverse.org). All
images are stored locally in `public/images/`.

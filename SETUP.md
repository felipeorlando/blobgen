# Setup & API Keys

Everything in blobgen **boots keyless** — Dev Login + mocked AI stages run the
whole product with zero configuration. You only add keys to unlock *real* stages.
This guide is tiered: **do only the tier you need.**

The stack is three runtimes:

```
blobgen Studio (Bun/Next, :3000) ──opens──▶ eve-agent (Node 24) ──drives──▶ OpenMontage (Python)
   productization shell                       durable orchestrator            creative engine
   auth · credits · Image Bank · publish      pauses/approvals · cron          tools · pipelines
```

| | What it is | When you need it |
|---|---|---|
| **blobgen** | the app you run + use | always |
| **eve-agent** | the agent that drives OpenMontage | only to turn on the OpenMontage core |
| **OpenMontage** | the creative engine (12 pipelines, 52 tools) | only for real multi-format production |

## Contents

1. [Prerequisites](#1-prerequisites)
2. [Tiers — pick what you need](#2-tiers)
3. [Quick start (Tier 0 — zero-key)](#3-quick-start-tier-0--zero-key)
4. [blobgen keys (Tiers 1–2)](#4-blobgen-keys-tiers-12)
5. [eve-agent (Tier 3)](#5-eve-agent-tier-3)
6. [OpenMontage (Tier 3)](#6-openmontage-tier-3)
7. [Wire the three together](#7-wire-the-three-together)
8. [Verification checklist](#8-verification-checklist)
9. [Security notes](#9-security-notes)

---

## 1. Prerequisites

| Tool | Needed for | Install |
|---|---|---|
| **Bun 1.3+** | blobgen | https://bun.sh |
| **Docker** | Postgres + Redis (via `docker-compose.yml`) | https://docs.docker.com/get-docker/ |
| **Node 24+** | eve-agent only | `nvm install 24` — https://github.com/nvm-sh/nvm |
| **Python 3.10+** | OpenMontage only | https://www.python.org/downloads/ |
| **ffmpeg** | rendering | bundled (`ffmpeg-static`); override with `FFMPEG_PATH` |

---

## 2. Tiers

| Tier | Unlocks | Keys you add |
|---|---|---|
| **0 — zero-key** | Whole UI + pipeline shape, all AI mocked | none (just Postgres) |
| **1 — real blobgen pipeline** | Real research, script, voiceover, images | OpenRouter, Tavily/Exa, Pexels, Replicate |
| **2 — publishing** | Real YouTube upload + scheduling | Google OAuth (+ YouTube Data API) |
| **3 — OpenMontage core** | The 12-pipeline creative engine via the eve agent | Anthropic (or Vercel AI Gateway) + OpenMontage providers |

---

## 3. Quick start (Tier 0 — zero-key)

```bash
cp .env.example .env.local      # defaults match docker-compose; no keys needed
docker compose up -d            # Postgres (+ Redis)
bun install
bun run db:migrate              # apply schema (incl. media_bank, projects.pipeline)
bun run db:seed                 # demo channels + dev credits
bun run dev                     # http://localhost:3000
```

Open `http://localhost:3000/login` → **Dev Login** (no OAuth needed). Create a
project — every AI stage runs with deterministic mocks, so you get a finished
(placeholder) video end-to-end. The **Image bank** and **pipeline picker** are
fully live in this tier.

---

## 4. blobgen keys (Tiers 1–2)

Add these to **`.env.local`** (never commit it). Each is independent — set only
what you want. Reference: [`.env.example`](.env.example).

| Variable | Powers | Tier | Where to get it |
|---|---|---|---|
| `DATABASE_URL` | Postgres | 0 (required) | Docker default; or a hosted Postgres like [Neon](https://neon.tech) |
| `AUTH_SECRET` | session signing | 0 (optional in dev) | run `openssl rand -base64 32` |
| `AUTH_DEV_LOGIN` | password-less dev login | 0 | leave `true` locally |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | sign-in + **YouTube upload** | 2 | [Google Cloud Console](https://console.cloud.google.com) — steps below |
| `YOUTUBE_API_KEY` | YouTube public data (channel search) | 2 (optional) | same console → API key |
| `OPENROUTER_API_KEY` | LLM (research/script) | 1 | https://openrouter.ai/keys |
| `OPENROUTER_MODEL` | which model | 1 | pick from https://openrouter.ai/models (default `anthropic/claude-3.5-sonnet`) |
| `SEARCH_PROVIDER` + `TAVILY_API_KEY` | web research (default) | 1 | https://app.tavily.com → **API Keys** |
| `EXA_API_KEY` | web research (alternative) | 1 | https://dashboard.exa.ai → **API Keys** (set `SEARCH_PROVIDER=exa`) |
| `REPLICATE_API_TOKEN` | TTS + image generation | 1 | https://replicate.com/account/api-tokens |
| `REPLICATE_IMAGE_MODEL` | image model slug | 1 | https://replicate.com/explore — e.g. `black-forest-labs/flux-schnell` |
| `REPLICATE_TTS_MODEL` | TTS model slug | 1 | e.g. `minimax/speech-02-turbo` |
| `PEXELS_API_KEY` | stock images | 1 | https://www.pexels.com/api/ → **Get Started** |
| `JOB_DRIVER` / `REDIS_URL` | background queue | optional | `inprocess` (default) needs nothing; `bullmq` needs Redis + `bun run worker` |
| `STORAGE_DRIVER` / `STORAGE_DIR` | blob storage | 0 | `fs` (default) |
| `FFMPEG_PATH` | render binary | 0 | blank = bundled `ffmpeg-static` |
| `STARTING_CREDITS` | dev credit grant | 0 | default `500` |

> **Replicate note:** real voiceover/images activate only when **both** the token
> **and** the model slug are set; otherwise the Production stage stays on mocks.

### Google Cloud OAuth + YouTube (for Tier 2)

The Google sign-in covers **both** login and YouTube upload (the scopes are
already configured in `src/server/auth/index.ts`).

1. Go to **https://console.cloud.google.com** → create a project.
2. **APIs & Services → Library** → enable **YouTube Data API v3**.
3. **APIs & Services → OAuth consent screen:**
   - User type **External**; fill app name + your support email.
   - **Add scopes:** `https://www.googleapis.com/auth/youtube.readonly` and
     `https://www.googleapis.com/auth/youtube.upload`.
   - Under **Test users**, add the Google account you'll sign in with.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID:**
   - Application type **Web application**.
   - **Authorized redirect URIs:** add
     `http://localhost:3000/api/auth/callback/google` (and your production domain's
     equivalent).
   - Copy the **Client ID** → `AUTH_GOOGLE_ID` and **Client secret** →
     `AUTH_GOOGLE_SECRET`.
5. *(Optional)* **Create credentials → API key** → `YOUTUBE_API_KEY` (public data only).
6. ⚠️ If you already signed in with Google before adding the upload scope, you
   must **re-consent** (the refresh token is requested via `access_type=offline`
   `prompt=consent`).

---

## 5. eve-agent (Tier 3)

The durable orchestrator. Runs on **Node 24** (keep blobgen on Bun — separate
toolchains).

```bash
cd eve-agent
nvm install 24 && nvm use        # reads .nvmrc → 24
npm install                      # then pin the "eve" version in package.json
cp .env.example .env
```

Fill in `eve-agent/.env`:

| Variable | Powers | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | the agent's model | https://console.anthropic.com → **Settings → API Keys** |
| *(or)* `AI_GATEWAY_API_KEY` | model via Vercel AI Gateway | https://vercel.com/docs/ai-gateway |
| `BLOBGEN_URL` | where to report progress | e.g. `http://localhost:3000` |
| `BLOBGEN_CALLBACK_SECRET` | HMAC for the bridge | any strong string — **must match** blobgen's `EVE_CALLBACK_SECRET` |
| `OPENMONTAGE_DIR` | the creative engine | path to your OpenMontage clone (§6) |
| `PYTHON_BIN` | python for the bridge | usually `python3` |

Run it (eve docs: https://eve.dev/docs/getting-started):

```bash
PORT=3001 npm run dev            # see the port note in §7
```

---

## 6. OpenMontage (Tier 3)

The creative engine. Cloned + installed **separately**, then pointed to via
`OPENMONTAGE_DIR`.

```bash
git clone https://github.com/calesthio/OpenMontage
cd OpenMontage
make setup                       # installs Python deps + Remotion + Piper; writes its own .env
```

**Zero-key path — no API keys required:** Piper TTS, FFmpeg, Remotion,
Archive.org, NASA, Wikimedia Commons (and free stock via dev keys below). The
`documentary_montage`, `clip_factory`, `talking_head`, `podcast_repurpose` and
`screen_demo` pipelines all run on this free path.

Optional **paid** providers (set in **OpenMontage's own `.env`**, not blobgen's):

| Variable | Powers | Get a key |
|---|---|---|
| `FAL_KEY` | image/video gateway (FLUX, Veo, Kling, Recraft) | https://fal.ai/dashboard/keys |
| `ELEVENLABS_API_KEY` | premium TTS / music / SFX | https://elevenlabs.io/app/settings/api-keys |
| `OPENAI_API_KEY` | DALL·E 3 + OpenAI TTS | https://platform.openai.com/api-keys |
| `XAI_API_KEY` | Grok image/video | https://console.x.ai |
| `GOOGLE_API_KEY` | Imagen + Google TTS (700+ voices) | https://aistudio.google.com/app/apikey |
| `SUNO_API_KEY` | music generation | https://suno.com (API access) |
| `HEYGEN_API_KEY` | avatar / talking-head | https://app.heygen.com → **Settings → API** |
| `RUNWAY_API_KEY` | Gen-4 video | https://dev.runwayml.com |
| `PEXELS_API_KEY` | free stock | https://www.pexels.com/api/ |
| `PIXABAY_API_KEY` | free stock | https://pixabay.com/api/docs/ |
| `UNSPLASH_ACCESS_KEY` | free stock | https://unsplash.com/developers |

Confirm what's available for your environment with `make preflight`.

---

## 7. Wire the three together

Turn on the OpenMontage core once all three are installed.

**blobgen `.env.local`:**

```bash
EVE_ENABLED="true"
EVE_URL="http://localhost:3001"          # the eve-agent's port (see note)
EVE_CALLBACK_SECRET="<a-strong-shared-secret>"
OPENMONTAGE_DIR="/absolute/path/to/OpenMontage"
```

**eve-agent `.env`:**

```bash
BLOBGEN_URL="http://localhost:3000"
BLOBGEN_CALLBACK_SECRET="<the-same-shared-secret>"   # must match the above
OPENMONTAGE_DIR="/absolute/path/to/OpenMontage"
```

> **⚠️ Port conflict:** blobgen (Next) **and** eve both default to `:3000`. Run
> eve on another port (`PORT=3001 npm run dev`) and point `EVE_URL` at it, as
> shown above.

**Flow:** Studio creates a project → blobgen opens an eve session → the agent
drives OpenMontage's pipeline → each checkpoint POSTs to `/api/eve/callback`
(HMAC) → blobgen mirrors it into `stage_runs`, meters credits, runs the approval
gates → the kept distribution stage publishes/schedules to YouTube. Visual assets
are reused from / saved to the **Image Bank** via `/api/bank`.

---

## 8. Verification checklist

| Tier | Command | Expect |
|---|---|---|
| **0** | `bun run dev` → Dev Login → create a project | stages advance with mocks; a placeholder MP4; **Image bank** + pipeline picker work |
| **1** | set OpenRouter + Pexels + Replicate, re-run | a real script, voiceover and images on the project |
| **2** | set Google OAuth, sign in with Google, run a project | a real **unlisted** YouTube upload appears on the Schedule calendar |
| **3** | `cd eve-agent && PORT=3001 npm run dev`; set `EVE_ENABLED=true` | a `documentary_montage` project rendered by OpenMontage's zero-key path, mirrored live in the Studio |

---

## 9. Security notes

- **Never commit secrets.** `.env.local` (blobgen) and `eve-agent/.env` are
  git-ignored — keep them that way.
- `EVE_CALLBACK_SECRET` / `BLOBGEN_CALLBACK_SECRET` must be a strong random string
  and **identical** on both sides; it authenticates every bridge call (HMAC).
- OAuth tokens are read only server-side (`src/server/**`) and never sent to the
  browser.
- Each runtime has its **own** `.env` — the eve-agent never reads blobgen's.

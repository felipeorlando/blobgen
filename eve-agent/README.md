# blobgen eve-agent

The **durable orchestrator** in the "OpenMontage core · eve orchestrator · blobgen
shell" architecture. This agent plays the role a human-in-an-IDE plays for
OpenMontage today — it reads the pipeline, runs the tools, self-reviews,
checkpoints, and pauses for approval — but durably (eve's Workflow SDK) and
deployably (HTTP / cron / Slack).

```
blobgen Studio ──opens──▶ eve session ──drives──▶ OpenMontage tools (Python)
      ▲                        │                         (creative engine)
      └──── callbacks ─────────┘  (stage_runs mirror, credits, gates, Image Bank)
```

- **Creative work** is OpenMontage's (`tools/` Python classes via the registry).
  This agent wraps them through a small Python bridge (`agent/lib/run_tool.py`).
- **Productization** is blobgen's: every checkpoint is POSTed to
  `${BLOBGEN_URL}/api/eve/callback` (HMAC-signed) so blobgen mirrors progress
  into `stage_runs`, meters credits, and runs the approval gates. Assets are
  reused from / saved to blobgen's **Image Bank** via `${BLOBGEN_URL}/api/bank`.
- **Zero-key**: with no paid keys, OpenMontage's free path (Piper/FFmpeg/Remotion/
  Archive.org) still produces a real video.

## Run (requires Node 24)

```bash
nvm install 24 && nvm use            # eve needs Node 24; blobgen stays on Bun
npm install
# (optional) clone + set up the creative engine:
#   git clone https://github.com/calesthio/OpenMontage && (cd OpenMontage && make setup)
#   then set OPENMONTAGE_DIR in .env
cp .env.example .env                 # fill in a model key + BLOBGEN_* 
npm run dev                          # eve dev server — POST /eve/v1/session
```

Trigger a production:

```bash
curl -sN localhost:3000/eve/v1/session \
  -d '{"message":"Produce a 30s documentary montage about deep-sea creatures",
       "input":{"projectId":"<id>","channelId":"<id>","userId":"<id>","pipeline":"documentary_montage"}}'
```

## Layout

```
agent/
  agent.ts            # model + runtime config
  instructions.md     # the OpenMontage state-machine loop (system prompt)
  tools/              # thin defineTool shims over agent/lib (the swappable core)
  skills/             # per-pipeline stage-director guidance + the reviewer
  lib/                # framework-agnostic: OpenMontage bridge, blobgen callback,
                      #   Image Bank client, the run_tool.py Python shim
  sandbox/            # scratch space for subprocess + intermediate artifacts
```

Everything that does real work lives in `agent/lib/` (no eve imports), so eve is
only an orchestration shell and stays swappable. The eve package version should
be pinned in `package.json` after the first `npm install`.

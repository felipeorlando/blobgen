# Pipeline: documentary_montage (zero-key capable)

Real-footage documentary assembly from free archives + narration. No paid
providers required — this is the default demo pipeline.

| Stage      | Goal                             | OpenMontage tools (examples)          |
|------------|----------------------------------|---------------------------------------|
| idea       | Brief: angle, hook, ~duration    | research / web search                 |
| script     | Narration with sections + timing | script writer                         |
| scene_plan | Ordered shots, each with a query | scene planner                         |
| assets     | Footage + narration per shot     | Archive.org / Pexels stock, Piper TTS |
| edit       | Cuts + captions + light music    | subtitle (WhisperX), mixer            |
| compose    | 1080×1920 (or 16:9) MP4          | VideoCompose (FFmpeg) / Remotion      |

Rules:

- Prefer real archival/stock footage over generation — that's the format's point.
- Use `gather_assets` for every shot so the brand Image Bank is reused and grown.
- Keep narration tight; let the footage carry the story.
- Default gates: human approval on `script` and before `compose`.

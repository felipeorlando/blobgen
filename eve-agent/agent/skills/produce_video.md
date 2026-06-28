# Skill: produce_video

The end-to-end procedure for turning a topic into a finished, published video.

## Inputs (from the session)

`projectId`, `channelId`, `userId`, `pipeline`, and the topic/prompt.

## Procedure

1. `om_preflight` — confirm capabilities + rough cost. If a paid stage is needed,
   estimate it and request budget approval via `publish_progress` (`awaiting_human`).
2. **idea** → research the topic; produce a `brief` (hook, audience, duration,
   tone). Checkpoint it.
3. **script** → write the narration `script` (sections, timing). Checkpoint.
4. **scene_plan** → order scenes with timings + the asset each needs. Checkpoint.
5. **assets** → for each scene call `gather_assets` (bank-first). Narration via
   the zero-key TTS unless premium is approved. Produce an `asset_manifest`.
6. **edit** → assemble cuts, captions (word-level timing), music → `edit_decisions`.
7. **compose** → render the final MP4 (FFmpeg/Remotion) → `render_report` with the
   output ref. Verify it (duration, audio, resolution).
8. `publish_progress` `session_completed` with the final video ref — blobgen's
   distribution stage publishes/schedules it to YouTube.

Honor every `manual` gate: stop at `awaiting_human` and wait to be resumed.

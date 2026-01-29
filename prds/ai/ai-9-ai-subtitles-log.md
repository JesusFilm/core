# AI-9 AI Subtitles — Work Log

Date: 2026-01-29

## Summary of work completed
- Implemented most of the AI subtitles PRD and checked off tasks in `prds/ai/ai-9-ai-subtitles.md` (only “Verify Watch playback” remained unchecked).
- Added dependencies `@mux/ai@0.5.1` and `workflow@4.0.1-beta.50` in `package.json` and `pnpm-lock.yaml`.
- Prisma updates:
  - `MuxSubtitleTrackStatus` now includes `not_requested`, `queued`, `processing`, `ready`, `errored`.
  - `MuxSubtitleTrack.trackId` nullable.
  - Added `workflowRunId`, `vttUrl`, `errorMessage`.
  - Added composite unique constraint on `[muxVideoId, bcp47, source]`.
  - Migration created at `libs/prisma/media/db/migrations/20260128154000_ai_subtitles/migration.sql`.
- GraphQL changes:
  - Added `requestMuxAiSubtitles` mutation in `apis/api-media/src/schema/mux/subtitle/subtitle.ts` with admin token validation (`AI_SUBTITLE_ADMIN_TOKEN`).
  - Language code validation uses `isValidMuxGeneratedSubtitleLanguageCode`.
  - Upsert `MuxSubtitleTrack` as queued; start workflow via `workflow/api` (dynamic import); store `workflowRunId`.
  - VideoId resolution uses muxVideoId + optional videoVariantId and edition; errors on ambiguity.
  - Legacy status mapping for `getMyGeneratedMuxSubtitleTrack` (queued/not_requested => processing).
- Context changes:
  - `authorization` header added to GraphQL context in `apis/api-media/src/schema/builder.ts` and `apis/api-media/src/yoga.ts`.
  - New helper `apis/api-media/src/lib/dynamicImport.ts` for ESM dynamic import.
- New workflow worker service:
  - Added `apis/api-media/src/workers/muxSubtitles/` with `constants.ts`, `workflow.ts`, `workflowBundle.ts`, `steps.ts`, `worker.ts`.
  - Worker handles workflow endpoints, registers steps, calls Mux `generateSubtitles`, polls until ready, builds VTT URL, updates DB and `VideoSubtitle.vttSrc`.
- Added Nx target `mux-subtitles-worker` in `apis/api-media/project.json`.

## Files touched (key)
- `package.json`
- `pnpm-lock.yaml`
- `libs/prisma/media/db/migrations/20260128154000_ai_subtitles/migration.sql`
- `apis/api-media/src/schema/mux/subtitle/subtitle.ts`
- `apis/api-media/src/schema/builder.ts`
- `apis/api-media/src/yoga.ts`
- `apis/api-media/src/lib/dynamicImport.ts`
- `apis/api-media/src/workers/muxSubtitles/*`
- `apis/api-media/project.json`
- `prds/ai/ai-9-ai-subtitles.md`

## Next step recommendations
1) Verify Watch playback end-to-end (PRD item still unchecked).
2) Confirm worker deployment wiring (`MUX_SUBTITLES_WORKER_URL` / `WORKFLOW_LOCAL_BASE_URL`) and ensure the workflow is reachable in the target environment.
3) Run tests or a minimal smoke flow: request subtitles, ensure track completes, and VTT renders on watch.

## Notes
- A prior user request was interrupted; no further changes were made after the summary.
- No tests were run during the previous work.

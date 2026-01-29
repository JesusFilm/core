Lean PRD: AI Subtitles (Mux + Workflow DevKit)

1. Objective

Enable on-demand, production-ready AI subtitle generation (WebVTT) for Mux assets using durable workflows via @mux/ai and Workflow DevKit. The workflow runs in a dedicated worker service, updates Mux text tracks, and persists the VTT URL into VideoSubtitle.vttSrc so Watch can consume it without client changes.

----

2. Scope

In Scope
- WebVTT subtitle generation only (no translation or voiceover)
- Trigger via API (GraphQL)
- Dedicated workflow worker service (new) running Workflow DevKit
- Use @mux/ai built-in workflows/primitives for AI captioning
- Automatic upload of generated subtitles to Mux text track
- Persist VTT URL into VideoSubtitle.vttSrc and return via VideoVariant.subtitle
- Language validation for Mux-generated subtitles
- Server-secret protected trigger for proof-of-concept (no Watch auth yet)

Out of Scope
- Custom S3/R2 storage staging
- Manual workers, explicit queues, or concurrency guards (other than the workflow worker)
- Admin review UI, email or human QA tooling
- Bulk backfill or webhook-driven job status

----

3. Architecture Overview

Client (internal tool/script) -> API mutation -> upsert MuxSubtitleTrack (status: queued)
     -> start workflow run (Workflow DevKit) -> worker service executes
     -> @mux/ai caption generation
     -> Mux text track creation
     -> retrieve VTT URL from Mux
     -> persist VTT URL into VideoSubtitle.vttSrc
     -> update MuxSubtitleTrack status + metadata
     -> client polls status via API



Related docs for subtitles generation:
https://www.mux.com/docs/api-reference/video/assets/generate-asset-track-subtitles
----

4. Requirements

R1 - Workflow Execution Environment
- Add a new workflow worker service (long-running process) in api-media.
- The worker runs Workflow DevKit and executes caption workflows.
- This is required; there is no existing workflow runtime in the repo.

R2 - API Trigger (Server-Secret Protected)
- Add a mutation that requires an Authorization header:
  Authorization: Bearer <AI_SUBTITLE_ADMIN_TOKEN>
- Validate against process.env.AI_SUBTITLE_ADMIN_TOKEN and reject otherwise.

R3 - Mux Integration + VTT Persistence
- Use @mux/ai to generate captions and create a Mux text track.
- Retrieve the VTT URL for the created track (via Mux API).
- Persist the VTT URL into VideoSubtitle.vttSrc for the video/edition/language.
- Watch already reads VideoVariant.subtitle.value which resolves to vttSrc, so no Watch client changes are required.

R4 - Idempotency
- Add a unique key (muxVideoId, bcp47, source) on MuxSubtitleTrack.
- Use upsert on that key so re-requests are safe.

R5 - Status States
- Extend MuxSubtitleTrackStatus to include: not_requested, queued, processing, ready, errored.
- Maintain backward compatibility by continuing to return processing/ready/errored to any existing client that is not updated.

R6 - Language Validation
- Validate bcp47 using the existing Mux language list before starting a job.
- Reject invalid codes early with a clear error response.

----

5. Data Model Changes

Prisma: libs/prisma/media/db/schema.prisma

MuxSubtitleTrack
- Add fields:
  - workflowRunId String?
  - vttUrl String?
  - errorMessage String?
- Add unique constraint:
  - @@unique([muxVideoId, bcp47, source])
- Extend enum MuxSubtitleTrackStatus:
  - not_requested
  - queued
  - processing
  - ready
  - errored

VideoSubtitle
- No schema change required.
- Update data flow: persist mux VTT URL into vttSrc for (videoId, edition, languageId).

----

6. API Shape

Mutation (api-media GraphQL)

requestMuxAiSubtitles(
  muxVideoId: ID!
  bcp47: String!
  languageId: ID!
  edition: String = "base"
  videoVariantId: ID
): MuxSubtitleTrack

Notes
- videoVariantId is optional but recommended if muxVideoId maps to multiple variants.
- languageId is required to upsert VideoSubtitle for the requested subtitle language.
- The mutation:
  1) Validates Authorization header.
  2) Validates bcp47.
  3) Upserts MuxSubtitleTrack (source: generated, status: queued).
  4) Starts workflow run and stores workflowRunId.

Status query
- Reuse getMyGeneratedMuxSubtitleTrack or add a new admin-safe query if needed.
- For POC, polling the MuxSubtitleTrack record is sufficient.

----

7. Workflow Worker Service

Location (proposed)
- apis/api-media/src/workers/muxSubtitles/
  - worker.ts (Workflow DevKit worker bootstrap)
  - generateSubtitles.workflow.ts

Workflow outline
- Input: muxVideoId, assetId, bcp47, languageId, edition
- Steps:
  1) Call @mux/ai caption generation for the Mux asset.
  2) Create text track on Mux (or use returned track).
  3) Fetch track details and VTT URL.
  4) Upsert VideoSubtitle.vttSrc for (videoId, edition, languageId).
  5) Update MuxSubtitleTrack: status=ready, vttUrl, trackId.
- On error: update MuxSubtitleTrack status=errored and errorMessage.

----

8. Watch Update Path

No Watch client changes required if we persist VTT URL into VideoSubtitle.vttSrc:
- Watch query already uses video.variant.subtitle.value, which resolves to vttSrc.
- Once vttSrc is populated, useSubtitleUpdate will fetch and add the track as it does today.

----

9. Implementation Outline

- [x] Add Workflow DevKit runtime dependency and worker entrypoint in api-media.
- [x] Extend MuxSubtitleTrack schema (fields + unique key + enum values) and run migration.
- [x] Add requestMuxAiSubtitles mutation with server-secret auth and language validation.
- [x] Implement workflow to create Mux text track, fetch VTT URL, and update VideoSubtitle.vttSrc.
- [x] Ensure idempotent upsert on (muxVideoId, bcp47, source).
- [ ] Verify Watch playback: VideoVariant.subtitle.value returns mux VTT URL and renders in HeroSubtitleOverlay.

----

10. Success Criteria

- A sample Mux video receives a generated text track.
- MuxSubtitleTrack shows status=ready with vttUrl stored.
- VideoSubtitle.vttSrc is populated and Watch renders subtitles without client changes.
- Failures surface errorMessage and status=errored.

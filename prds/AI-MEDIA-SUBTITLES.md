# PRD: AI Media Subtitles Workflow

## Overview

This PRD covers the new **AI Media** app and the **subtitles** workflow that generates, improves, and uploads subtitles for Mux-hosted videos using `@mux/ai/primitives` and a lightweight Workflow DevKit.

## Problem Statement

Teams need a straightforward, testable workflow that reliably produces subtitles for Mux videos, improves text quality using OpenAI (via Mux AI), and uploads results back to Mux. The workflow should be easy to debug and extensible with additional stages.

## Goals

- Provide a minimal Next.js app for documenting and invoking the workflow.
- Implement a subtitles workflow using clear, small stages for easy testing.
- Make each stage independently testable and mockable.
- Provide a PRD that documents scope, stages, and expected outcomes.

## Non-Goals

- Building a full UI for uploading assets.
- Implementing Mux authentication flows.
- Persisting workflow results to a database.

## Workflow Requirements

### Stage 1 — Generate Subtitles

- Input: Mux asset ID + playback ID.
- Use `@mux/ai/primitives.generateSubtitles` to produce a baseline subtitle file.
- Output includes cue data, format, and language.

### Stage 2 — Post-process Subtitles (OpenAI)

- Use `@mux/ai/primitives.improveSubtitles` to improve punctuation, casing, and readability.
- Keep cue timing intact.
- Use a sane default model (e.g., `gpt-4.1-mini`).

### Stage 3 — Upload to Mux

- Use `@mux/ai/primitives.uploadSubtitles` to send improved subtitles to Mux.
- Return the resulting subtitle ID and hosted URL.

## Technical Design

- **App location:** `apps/ai-media` (Next.js).
- **Workflow entrypoint:** `apps/ai-media/src/workflows/subtitles/workflow.ts`.
- **Stage paths:**
  - `subtitles/generate/step1/generateSubtitles.ts`
  - `subtitles/generate/step2/postProcessSubtitles.ts`
  - `subtitles/generate/step3/uploadSubtitles.ts`
- **DevKit:** lightweight workflow harness for stage logging and orchestration.

## Stages & Milestones

1. **Scaffold the AI Media app**
   - Next.js config + lint/test/type-check targets.
   - Documentation page listing workflow stages.
2. **Implement workflow stages**
   - Mux AI subtitle generation.
   - OpenAI post-processing via Mux AI.
   - Mux subtitle upload.
3. **Testing & validation**
   - Unit test to verify stage order and output wiring.
   - Documented quickstart in the app UI.

## Success Metrics

- A single workflow invocation generates, improves, and uploads subtitles.
- Each stage is callable independently and mockable in tests.
- A test suite validates the workflow entrypoint without external API calls.

## Open Questions

- Determine which Mux environment (dev/prod) should receive subtitle uploads.
- Decide whether to persist workflow metadata for auditing.

# PRD: AI Media Queue Jobs for `Translate Now`

## Overview

Build a separate Queue Job page opened by `Translate Now` that shows translation/transcribing order progress in detail, stage by stage, per media item.

The implementation is staged. Missing infrastructure is mocked first, then replaced with real execution. Workflow DevKit is used whenever possible.

## Locked Decisions

- [x] Use Workflow DevKit whenever possible.
- [x] Backend scope for this effort is `ai-media` only.
- [x] One `Translate Now` click creates one order with many jobs.
- [x] Job execution uses limited parallelism.
- [x] Failure policy is continue-on-failure (failed jobs are marked, remaining jobs continue).

## Goals

- [ ] Add a separate Queue Job page route.
- [ ] Show order-level progress and state.
- [ ] Show each media item and its current associated job/stage.
- [ ] Show clear visual distinction for running vs done vs failed.
- [ ] Wire `Translate Now` to create order and redirect to Queue Job page.

## Non-Goals

- [ ] Migrating this feature to `api-media` workers in this scope.
- [ ] Shipping production-grade durable persistence in Stage 1.
- [ ] Redesigning unrelated coverage report UI.

## Current Gaps

- [ ] `Translate Now` currently logs only in `CoverageReportClient`.
- [ ] No queue/order domain model in `ai-media`.
- [ ] No queue/order API routes in `ai-media`.
- [ ] No queue job page route/UI.
- [ ] No language ID to `bcp47` mapping in the execution path.
- [ ] No per-language subtitle presence map for accurate `missing` scope.
- [ ] No Workflow DevKit event bridge to UI progress.

## Functional Requirements

- [ ] Clicking `Translate Now` creates a translation order.
- [ ] The app navigates to `/queue-jobs/:orderId`.
- [ ] The page shows order metadata, counts, and aggregate progress.
- [ ] The page shows all jobs per media item and per target language.
- [ ] Each job shows current stage, completed stages, and timestamps.
- [ ] Failed jobs show explicit error reason.
- [ ] Running jobs are visually emphasized.
- [ ] Completed jobs are visually distinct from running jobs.
- [ ] The page updates live via polling.

## Technical Design Tasks

### Data Model

- [ ] Add `TranslationOrder` type.
- [ ] Add `TranslationJob` type.
- [ ] Add `TranslationJobStage` type.
- [ ] Add status enums for order, job, and stage states.

### API Routes

- [ ] Implement `POST /api/translation-orders`.
- [ ] Implement `GET /api/translation-orders/[orderId]`.
- [ ] Implement `POST /api/translation-orders/[orderId]/retry` (later stage).

### UI Routes

- [ ] Implement `/src/app/queue-jobs/[orderId]/page.tsx`.
- [ ] Add global order summary and progress bar.
- [ ] Add per-job stage timeline UI.
- [ ] Add running/completed/failed filters.

### `Translate Now` Integration

- [ ] Replace console-only `handleTranslate`.
- [ ] Submit selected videos/languages/scope to create-order API.
- [ ] Redirect to queue page on success.
- [ ] Show request failure state if order creation fails.

### Workflow DevKit Integration

- [ ] Add order orchestration workflow wrapper.
- [ ] Add per-job workflow wrapper.
- [ ] Emit stage lifecycle events (`started`, `completed`, `failed`).
- [ ] Persist lifecycle updates to in-memory order state.

## Milestone Checklist

### Stage 1: Mock Queue + Queue Page

- [ ] Create order/job/stage models.
- [ ] Add in-memory order repository.
- [ ] Add create/read APIs.
- [ ] Build queue page with polling.
- [ ] Build mock job workflow with deterministic staged progress.
- [ ] Wire `Translate Now` to create+redirect.

### Stage 2: Real Preflight + Missing Scope Correctness

- [ ] Extend coverage payload with per-language subtitle status map.
- [ ] Add language ID to `bcp47` resolution step.
- [ ] Implement preflight skip reasons.
- [ ] Implement accurate `missing` scope job filtering.
- [ ] Keep generate/post-process/upload mocked in this stage.

### Stage 3: Real Subtitles Execution

- [ ] Replace mocked generate/post-process/upload with real subtitles workflow.
- [ ] Keep limited parallel scheduler (default concurrency 3).
- [ ] Map Workflow DevKit stage events to UI-visible job states.
- [ ] Capture output metadata (`subtitleId`, URL) per completed job.

### Stage 4: Retry + Hardening

- [ ] Add retry endpoint for failed jobs only.
- [ ] Add retry action on queue page.
- [ ] Add order terminal summary (`completed`, `failed`, `skipped`).
- [ ] Add optional persistence adapter interface for subtitle record write-back.

## Testing Checklist

- [ ] Unit: order fan-out count is correct.
- [ ] Unit: scheduler respects limited parallelism.
- [ ] Unit: continue-on-failure behavior is correct.
- [ ] Unit: stage event mapping updates job state correctly.
- [ ] Unit: preflight skip reasons are deterministic.
- [ ] Integration: `Translate Now` creates order and redirects to queue page.
- [ ] Integration: queue page polling refreshes counts and stage states.
- [ ] Integration: retry action requeues only failed jobs.
- [ ] Regression: coverage report select/explore behavior is unchanged.

## Acceptance Criteria

- [ ] User can click `Translate Now` and land on queue page.
- [ ] User can see what is currently processing in real time.
- [ ] User can see what is already done.
- [ ] User can inspect stage-by-stage progress for each media item job.
- [ ] A failed job does not stop the whole order.

## Rollout Checklist

- [ ] Add feature flag for queue jobs UI.
- [ ] Enable Stage 1 in development.
- [ ] Enable Stage 2 in development/staging.
- [ ] Enable Stage 3 when required env vars are present.
- [ ] Validate logging for order and job correlation IDs.
- [ ] Document known limitations and fallback behavior.

## Definition of Done

- [ ] All milestone tasks complete.
- [ ] Test checklist complete.
- [ ] Acceptance criteria complete.
- [ ] PR reviewed and merged.

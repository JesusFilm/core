---
title: 'feat: Track creator reuse of past images and video uploads'
type: feat
status: completed
date: 2026-06-03
---

# feat: Track creator reuse of past images and video uploads

## Summary

Add two Google Tag Manager events that fire when a creator reuses an existing asset in the editor — selecting a past custom image from the `MediaLibrary` grid (`image_select`) and selecting a past video upload from the `MyMuxVideos` grid (`video_select`). This mirrors the existing `sendImageUploadEvent` helper (which already tracks _uploads_) so that reuse and upload are measured the same way, giving product visibility into how often creators draw from their existing media versus uploading new assets.

---

## Problem Frame

We already track new media uploads via GTM (`image_upload_success` / `image_upload_failure` in `apps/journeys-admin/src/libs/sendImageUploadEvent/`), but we have no signal for the complementary behavior: creators picking from media they uploaded previously. Without it we can't tell whether the media-library and uploads grids are actually used or how much value past assets provide, which makes it hard to justify or prioritize further investment in those surfaces.

---

## Requirements

- R1. Firing a `image_select` GTM event when a creator selects a past custom image from the `MediaLibrary` grid.
- R2. Firing a `video_select` GTM event when a creator selects a past video upload from the `MyMuxVideos` grid.
- R3. Event payloads carry minimal, non-PII identifiers only (`imageId` + `isAi` for images; `videoId` + `duration` + `source: 'mux'` for videos).
- R4. The implementation reuses the established `sendGTMEvent` helper pattern (`apps/journeys-admin/src/libs/send*Event/`) — no new analytics vendor or dependency.

---

## Scope Boundaries

- No backend/GraphQL mutation or `*EventCreate` server event — these GTM events are client-side product telemetry only.
- No Plausible goals or viewer-side analytics changes — Plausible remains for journey-visitor analytics.
- No tracking of _previews_ (opening the `VideoDetails` dialog) — only the final selection fires the event.
- No new GTM container/dashboard/reporting configuration is created by this plan (the event names are emitted; dashboard setup in GTM is operational follow-up — see below).
- No analytics added to other media surfaces (AI image generation, Unsplash, external video URLs).

### Deferred to Follow-Up Work

- Registering / building the GTM dashboard or report that consumes `image_select` and `video_select`: GTM container configuration, outside this repo.

---

## Context & Research

### Relevant Code and Patterns

- `apps/journeys-admin/src/libs/sendImageUploadEvent/sendImageUploadEvent.ts` — canonical GTM event helper to mirror. Each function builds an explicit payload and calls `sendGTMEvent({ event: '<snake_case>', ...keys })`.
- `apps/journeys-admin/src/libs/sendImageUploadEvent/sendImageUploadEvent.spec.ts` — test shape to mirror: `vi.mock('@next/third-parties/google', ...)`, assert `sendGTMEvent` called with the exact payload.
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/MediaLibrary/MediaLibrary.tsx` — `handleSelect` (line 83) is the image selection seam; `isAi` is already a prop, selected image carries `id`.
- `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromMux/MyMuxVideos/MyMuxVideos.tsx` — `handlePreviewSelect` (line 92) is the video selection seam; `previewVideo` carries `id` and `duration`.
- GTM is initialized globally in `apps/journeys-admin/pages/_app.tsx` via `<GoogleTagManager .../>`, so `sendGTMEvent` works app-wide with no extra wiring.

### Institutional Learnings

- `docs/solutions/logic-errors/plausible-analytics-event-name-mismatch-qa359.md` — analytics learning. Two takeaways apply even though we use GTM not Plausible: (1) **never spread raw input into event payloads and never send PII** — build explicit allow-listed payloads (honored by R3); (2) the event name is the contract with the downstream dashboard — keep names stable and `snake_case`, consistent with the existing `image_upload_*` family.

---

## Key Technical Decisions

- **Use `sendGTMEvent` (Google Tag Manager), not Plausible:** GTM is the established mechanism for creator/editor product-usage events in journeys-admin and there is direct adjacent precedent (`sendImageUploadEvent`). Plausible in this app is exclusively journey-visitor analytics. (User-confirmed.)
- **One shared helper module (`sendMediaSelectEvent`) exporting both functions:** images and videos are the same conceptual event family ("reuse existing media"), so co-locating `sendImageSelectEvent` and `sendVideoSelectEvent` keeps them discoverable and consistent, matching how `sendImageUploadEvent` groups success/failure.
- **Minimal, explicit payloads (no PII):** `image_select → { imageId, isAi }`, `video_select → { videoId, duration, source: 'mux' }`. (User-confirmed.)
- **`source` discriminator on `video_select` only:** unlike images (one image source today), the video picker has multiple sources — Mux uploads, YouTube, internal library — that could later emit `video_select`. Tagging `source: 'mux'` keeps the video event self-describing and unambiguous if those other paths are instrumented under the same event name. The image event omits it.
- **Event naming `image_select` / `video_select`:** `snake_case` noun_verb, consistent with the existing `image_upload_success` family.

---

## Open Questions

### Resolved During Planning

- Analytics vendor: GTM (`sendGTMEvent`). Resolved with user.
- Payload contents: minimal IDs (`imageId`/`isAi`, `videoId`/`duration`). Resolved with user.

### Deferred to Implementation

- Exact `duration` value passed for video: use `previewVideo.duration` (may be `null`); pass through as-is rather than coercing. Confirm at implementation that `null` is acceptable in the GTM payload (the existing upload helper passes `undefined` for an optional field, so `null`/optional is fine).

---

## Implementation Units

- U1. **Create the `sendMediaSelectEvent` GTM helper**

**Goal:** A reusable module exporting `sendImageSelectEvent` and `sendVideoSelectEvent` that wrap `sendGTMEvent`.

**Requirements:** R1, R2, R3, R4

**Dependencies:** None

**Files:**

- Create: `apps/journeys-admin/src/libs/sendMediaSelectEvent/sendMediaSelectEvent.ts`
- Create: `apps/journeys-admin/src/libs/sendMediaSelectEvent/index.ts`
- Test: `apps/journeys-admin/src/libs/sendMediaSelectEvent/sendMediaSelectEvent.spec.ts`

**Approach:**

- Mirror `sendImageUploadEvent.ts`. Define typed params interfaces.
- `sendImageSelectEvent({ imageId, isAi })` → `sendGTMEvent({ event: 'image_select', imageId, isAi })`.
- `sendVideoSelectEvent({ videoId, duration })` → `sendGTMEvent({ event: 'video_select', videoId, duration, source: 'mux' })` where `duration: number | null`.
- `source` is a constant set inside `sendVideoSelectEvent` (callers do not pass it). The image helper carries no `source`.
- `index.ts` re-exports both functions (barrel).

**Patterns to follow:**

- `apps/journeys-admin/src/libs/sendImageUploadEvent/sendImageUploadEvent.ts` and its `index.ts`.

**Test scenarios:**

- Happy path: `sendImageSelectEvent({ imageId: 'abc', isAi: false })` calls `sendGTMEvent` with `{ event: 'image_select', imageId: 'abc', isAi: false }`.
- Happy path: `sendImageSelectEvent` with `isAi: true` forwards `isAi: true`.
- Happy path: `sendVideoSelectEvent({ videoId: 'xyz', duration: 120 })` calls `sendGTMEvent` with `{ event: 'video_select', videoId: 'xyz', duration: 120, source: 'mux' }`.
- Edge case: `sendVideoSelectEvent({ videoId: 'xyz', duration: null })` forwards `duration: null` (with `source: 'mux'`) without throwing.

**Verification:**

- Spec passes; helper imports cleanly; no other module changed yet.

---

- U2. **Fire `image_select` from MediaLibrary**

**Goal:** Emit the image-reuse event when a creator picks a past custom image.

**Requirements:** R1, R3

**Dependencies:** U1

**Files:**

- Modify: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/MediaLibrary/MediaLibrary.tsx`
- Test: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/MediaLibrary/MediaLibrary.spec.tsx`

**Approach:**

- Import `sendImageSelectEvent` from `../../../../../../../../libs/sendMediaSelectEvent` (match the relative depth used for the existing `sendImageUploadEvent` import in the sibling `ImageUpload` component).
- In `handleSelect(img)` (line 83), call `sendImageSelectEvent({ imageId: img.id, isAi })` — `isAi` is already a component prop. Fire alongside the existing `onSelect(...)` call; do not change selection behavior.

**Patterns to follow:**

- `ImageUpload.tsx` call sites of `sendImageUploadSuccessEvent`.

**Test scenarios:**

- Happy path: clicking an image in the grid invokes `onSelect` (existing behavior) **and** `sendImageSelectEvent` with `{ imageId, isAi }`. Mock `@next/third-parties/google`'s `sendGTMEvent` (or the helper) and assert payload, including `isAi: true` when the component is rendered with `isAi`.
- Edge case: the event fires with the selected image's `id`, not a stale/previous image's id, when multiple images are present.

**Verification:**

- Selecting an image still updates the block as before; `image_select` is emitted once per selection.

---

- U3. **Fire `video_select` from MyMuxVideos**

**Goal:** Emit the video-reuse event when a creator confirms selection of a past video upload.

**Requirements:** R2, R3

**Dependencies:** U1

**Files:**

- Modify: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromMux/MyMuxVideos/MyMuxVideos.tsx`
- Test: `apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromMux/MyMuxVideos/MyMuxVideos.spec.tsx`

**Approach:**

- Import `sendVideoSelectEvent` from the new lib.
- In `handlePreviewSelect` (line 92), call `sendVideoSelectEvent({ videoId: previewVideo.id, duration: previewVideo.duration ?? null })`. This is the confirmed-selection seam (after the preview dialog), so it counts deliberate selections, not previews. Do not alter the existing `onSelect`/`endAt` reset logic.

**Patterns to follow:**

- U1 helper; existing `handlePreviewSelect` structure.

**Test scenarios:**

- Happy path: opening a video's preview and confirming selection invokes `onSelect` (existing behavior) **and** `sendVideoSelectEvent` with `{ videoId, duration }` (helper appends `source: 'mux'`).
- Edge case: a video whose `duration` is `null` still fires `video_select` with `duration: null` and selection succeeds.
- Integration: clicking a grid thumbnail alone (opening preview, `handleClick`) does **not** fire `video_select` — only the confirm step does.

**Verification:**

- Selecting a past video still applies the duration/endAt reset; `video_select` fires once on confirm.

---

## System-Wide Impact

- **Interaction graph:** Both call sites are additive — they fire an analytics side-effect next to the existing `onSelect` callback and do not change selection/block-update behavior.
- **API surface parity:** The two new helpers complete the upload/reuse pair alongside `sendImageUploadEvent`. No other media surfaces (Unsplash, AI gen, external video URL) are instrumented by this plan; if reuse tracking is later wanted there, it follows the same helper pattern.
- **Unchanged invariants:** `onSelect` contracts, the `MediaLibrary`/`MyMuxVideos` rendering, and the video `endAt`/`duration` reset logic are untouched.

---

## Risks & Dependencies

| Risk                                                                     | Mitigation                                                                                                          |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Event fires on preview-open instead of confirm (video), inflating counts | Instrument `handlePreviewSelect` (confirm), not `handleClick` (preview); covered by an explicit U3 test scenario.   |
| PII leaks into GTM payload                                               | Explicit minimal payloads (IDs + `isAi`/`duration` only); no spreading of objects (R3).                             |
| GTM event names drift from downstream dashboard expectations             | Use stable `snake_case` names consistent with the `image_upload_*` family; names listed in Key Technical Decisions. |

---

## Documentation / Operational Notes

- After merge, the GTM container needs `image_select` and `video_select` surfaced in whatever dashboard consumes these events (operational, outside this repo — see Deferred to Follow-Up Work).
- Worth a `/ce-compound` note after landing: this is the first instrumentation of _editor media-reuse_ actions, establishing where such events live (`libs/sendMediaSelectEvent`).

---

## Sources & References

- Related code: `apps/journeys-admin/src/libs/sendImageUploadEvent/`, `apps/journeys-admin/pages/_app.tsx` (GTM init)
- Related learning: `docs/solutions/logic-errors/plausible-analytics-event-name-mismatch-qa359.md`

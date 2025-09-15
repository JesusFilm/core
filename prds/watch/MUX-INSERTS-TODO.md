# Project Plan: Background Video Inserts using MUX Playback IDs

Status: PLANNING ONLY. Do not implement until [ ] Approval is checked.  
Router: Next.js App Router.  
Secrets: None required (no MUX API calls).  
Rollout: Always-on (no feature flag).

This plan adds background-video “insert” cards to the Watch carousel using **MUX Playback IDs**. Editors will curate arrays of Playback IDs and per-insert overlay copy (`label`, `title`, `collection`, `description`). At render time we construct public playback and poster URLs; no runtime API calls or tokens.

---

## High-Level Summary

- Store Playback IDs (not full URLs) for inserts in a JSON config.  
- Build URLs at render time:
  - HLS: `https://stream.mux.com/{PLAYBACK_ID}.m3u8`  
  - Poster: `https://image.mux.com/{PLAYBACK_ID}/thumbnail.jpg?time=1`  
- Randomly pick one Playback ID from the array for each insert (simple uniform random).  
- Render overlay text fields: `label`, `title`, `collection`, `description`.  
- Respect reduced motion and provide poster-first fallbacks.

---

## Scope

**In scope**  
- New slide source: `"mux"`  
- Insert configuration JSON and schema validation  
- Random uniform selection per insert  
- HLS playback (or MP4 fallback) in `<video>` or existing player  
- Overlay content (`label`, `title`, `collection`, `description`)  
- Error/fallback visuals  
- Tests, Storybook, docs

**Out of scope**  
- Upload automation to MUX  
- Analytics beyond basic logs  
- Dynamic API resolution, caching, or rate limiting  
- Per-user personalization

---

## Acceptance Criteria

- Given an insert with `source: "mux"` and ≥1 Playback ID, the carousel renders a background video with overlay fields.  
- First visible insert renders without jank; offscreen inserts lazy-load.  
- `prefers-reduced-motion` disables autoplay and uses poster-only until user interaction.  
- No secrets appear in client bundles.  
- Insert config is schema-validated at build; invalid config fails CI.  
- Overlay meets WCAG AA contrast.

---

## Risks & Mitigations

- **Broken/removed assets** → editors maintain JSON; fallback poster shows if video fails.  
- **Large renditions** → allow MP4 fallback ≤1080p for constrained networks.  
- **Visual flicker** → stable random choice seeded per session.

---

## Phase 0 — Planning Artifact

- [ ] Create this plan at `/prds/watch/MUX-INSERTS-TODO.md`  

Rollback: delete the file.

---

## Phase 1 — Types, Config, and Schema

**Goal:** define data shapes and validation; no UI changes.  

Tasks  
- [ ] Add discriminated union for `source: "mux"` to slide types.  
- [ ] Introduce insert config with Playback IDs and overlay fields (`label`, `title`, `collection`, `description`).  
- [ ] Add schema validation (Zod or JSON Schema) enforced in CI.  
- [ ] Add simple RNG utility to pick one Playback ID uniformly.  

Files  
- `apps/watch/src/types/inserts.ts`  
- `apps/watch/config/video-inserts.mux.json`  
- `apps/watch/src/lib/validation/insertMux.schema.ts`  
- `apps/watch/src/lib/rng/randomPick.ts`  

Validation  
- Schema tests pass; CI fails on invalid JSON.

Rollback  
- Remove types, schema, and config.

Reference config:

```json
{
  "version": "1.0.0",
  "inserts": [
    {
      "id": "welcome-start",
      "enabled": true,
      "source": "mux",
      "playbackIds": [
        "J3WBxqGgXxi01201FYmW0202ayeL7PGXfuuXR02nvjQCE7bI",
        "R2ILwLVZJ9015NMx00cEP7Dk99As6T2EYWkJhUa4PC6RI"
      ],
      "overlay": {
        "label": "Today’s Pick",
        "title": "Morning Nature Background",
        "collection": "Daily Inspirations",
        "description": "A calm intro before your playlist."
      },
      "trigger": { "type": "sequence-start" }
    }
  ]
}


⸻

Phase 2 — URL Builders and Selection Logic

Goal: deterministic URL builder and random selection.

Tasks
	•	Implement buildMuxUrls(playbackId) → { hls, poster }.
	•	Implement pickPlaybackId(array, seed?) uniform random (session-seeded).
	•	Add logging hook for chosen ID (dev-only).

Files
	•	apps/watch/src/lib/mux/buildPlaybackUrls.ts
	•	apps/watch/src/lib/mux/pickPlaybackId.ts

Validation
	•	Unit tests for URL builder and random pick.

Rollback
	•	Remove libs and tests.

⸻

Phase 3 — Insert Integration

Goal: merge inserts into the carousel data flow.

Tasks
	•	Implement triggers: sequence-start and after-count.
	•	Merge inserts without disrupting existing order.
	•	Use RNG to pick one Playback ID per insert for the session.
	•	Allow optional poster override.

Files
	•	apps/watch/src/components/VideoHero/libs/useCarouselVideos/insertMux.ts
	•	apps/watch/src/components/VideoHero/libs/useCarouselVideos/useCarouselVideos.ts

Validation
	•	Inserts appear in correct positions; baseline unaffected when disabled.

Rollback
	•	Revert integration and remove insertMux.ts.

⸻

Phase 4 — Card Rendering

Goal: render MUX background card with overlay.

Tasks
	•	Add branch in carousel for source: "mux".
	•	Create MuxVideoCard:
	•	<video> tag with HLS src; MP4 fallback optional.
	•	Attributes: autoplay, muted, loop, playsInline, preload=“metadata”.
	•	Poster shown until canplay; fallback on error.
	•	IntersectionObserver for offscreen inserts.
	•	Overlay block rendering:
	•	label (accent small text)
	•	title (headline)
	•	collection (secondary line)
	•	description (paragraph)

Files
	•	apps/watch/src/components/VideoCarousel/VideoCarousel.tsx
	•	apps/watch/src/components/VideoCard/MuxVideoCard.tsx

Validation
	•	Existing slides unaffected; MUX cards loop smoothly; posters visible.

Rollback
	•	Remove MuxVideoCard and revert carousel.

⸻

Phase 5 — Accessibility & Fallbacks

Goal: meet a11y guidelines and degrade gracefully.

Tasks
	•	Respect prefers-reduced-motion: no autoplay; poster-only with play control.
	•	Decorative background video aria-hidden="true".
	•	Overlay semantics: <h2>/<h3> for title, <p> for description.
	•	Fallback card if video fails.
	•	MP4 fallback ≤1080p optional.

Files
	•	apps/watch/src/components/VideoCard/MuxVideoCard.tsx
	•	apps/watch/src/components/VideoCard/MuxVideoFallback.tsx

Validation
	•	Axe checks pass; reduced-motion test shows poster-only.

Rollback
	•	Revert a11y/fallback changes.

⸻

Phase 6 — Testing

Goal: prevent regressions.

Tasks
	•	Unit: URL builder, random pick.
	•	Component: MuxVideoCard (happy path, reduced motion, error fallback).
	•	Integration: carousel with inserts merged correctly.
	•	Visual: overlay legibility on dark/light footage.

Files
	•	apps/watch/src/lib/mux/buildPlaybackUrls.spec.ts
	•	apps/watch/src/lib/mux/pickPlaybackId.spec.ts
	•	apps/watch/src/components/VideoCard/MuxVideoCard.spec.tsx
	•	apps/watch/src/components/VideoCarousel/VideoCarousel.spec.tsx

Validation
	•	CI green; coverage ≥ 80% on new code.

Rollback
	•	Remove test suites.

⸻

Phase 7 — Docs & Editorial Guide

Goal: editors can add inserts easily.

Tasks
	•	README section: how to upload to MUX, copy Playback ID, and add to JSON.
	•	Document triggers.
	•	Storybook stories for inserts (dark/light overlays).

Files
	•	apps/watch/README.md
	•	apps/watch/src/components/VideoCard/MuxVideoCard.stories.tsx

Validation
	•	New editor can add an insert end-to-end in <15 minutes.

Rollback
	•	Revert docs and stories.

⸻

Build & CI Guards
	•	Build validates video-inserts.mux.json against schema.
	•	Optional lint/test: disallow hardcoded full playback URLs; require Playback IDs.

⸻

Implementation Notes

HLS URL:
https://stream.mux.com/{PLAYBACK_ID}.m3u8

Poster URL:
https://image.mux.com/{PLAYBACK_ID}/thumbnail.jpg?time=1

MP4 fallback (optional):
https://stream.mux.com/{PLAYBACK_ID}/medium.mp4
https://stream.mux.com/{PLAYBACK_ID}/high.mp4

Overlay fields:
	•	label
	•	title
	•	collection
	•	description

⸻

Approval Gate
	•	Approval: Implement according to this plan

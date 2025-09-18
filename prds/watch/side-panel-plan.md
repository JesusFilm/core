# Watch Single Video Page – Next Steps Side Panel Plan

_Last updated: 2025-09-17_

## Goal
Design and implement a sliding "Next steps" side panel on `/watch` single video pages that appears shortly before a video ends, shifting the player left in a YouTube TV–style layout and counting down to autoplay the next video.

---

## Current Page Architecture
- `apps/watch/pages/watch/[part1]/[part2].tsx` fetches the selected video, loads audio/subtitle options, and renders either `NewVideoContentPage` (modern layout) or `VideoContainerPage` inside `WatchProvider`, `VideoProvider`, and `PlayerProvider`. 
- `NewVideoContentPage` (default path for HLS variants) renders:
  - `VideoContentHero` → `HeroVideo` (video.js player) + `ContentHeader` overlay.
  - Content stack (`ContentMetadata`, `DiscussionQuestions`, etc.) below the hero.
- `VideoControls` (inside `HeroVideo`) owns the video.js event wiring, updates `PlayerContext`, and exposes play/progress state used across the page (e.g., header visibility).
- Related videos (potential "Up next") are fetched via `useVideoChildren`, returning the current container's child variants for the carousel.

## Key Data & Utilities
- Video metadata and variant info come from the `VideoProvider` context (`useVideo`).
- Playback state lives in `PlayerContext` (`usePlayer`), including `progress`, `durationSeconds`, and `progressPercentNotYetEmitted`.
- `getWatchUrl` builds deep links for other videos.
- `useVideoChildren` provides the array of sibling/child videos to surface as next options.

---

## UX & Product Notes
- Side panel should animate in as the video approaches completion (configurable threshold, e.g., 20 seconds remaining or 90% progress).
- Video player shrinks/shifts left to reveal panel width; panel content includes:
  - Title, thumbnail, and CTA for "Next up" video.
  - Countdown timer (5 → 1) before autoplay triggers.
  - Secondary actions (e.g., "Play now", "Cancel autoplay").
- Panel must be dismissible or allow canceling autoplay.
- Behavior should degrade gracefully if no next video is available (hide panel / show end actions instead).

---

## Implementation Plan (Living Checklist)

### 1. Trigger & State Management
- [x] Audit existing `PlayerContext` values to confirm remaining time calculations (`durationSeconds - progress`).
- [x] Decide where to store side panel UI state (e.g., extend `PlayerContext` or create `useUpNextPanel` hook scoped to `VideoContentHero`).
- [x] Emit a custom event/state flag when playback crosses the threshold (handled via `VideoContentHero` state derived from `progress`/`durationSeconds` without new dispatches).
- [x] Reset the flag when the user seeks earlier, replays, or navigates away.

### 2. Selecting the "Next Up" Video
- [x] Define selection rules (e.g., first item from `useVideoChildren` excluding the current video; fallback to container metadata or curated list).
- [x] Ensure needed fields (title, duration, images, slug) are available; extend `VideoChildFields` query if additional data is required. *(Existing fields were sufficient.)*
- [x] Add utility to derive human-readable time remaining and next video's watch URL.

- [x] Update `VideoContentHero` layout to accommodate a sliding side panel while keeping fullscreen mode unaffected.
  - Files: `apps/watch/src/components/NewVideoContentPage/VideoContentHero/VideoContentHero.tsx`, `.../HeroVideo/HeroVideo.tsx`.
- [x] Create new `UpNextPanel` component (e.g., under `NewVideoContentPage/VideoContentHero/UpNextPanel/`).
  - Accept props for countdown, next video metadata, autoplay handlers, and cancel action.
  - Use CSS transitions (Tailwind classes or Framer Motion if available) to mirror YouTube TV slide-in.
- [x] Apply responsive adjustments (panel may overlay on smaller screens instead of shifting layout).

### 4. Countdown & Autoplay Behavior
- [x] Implement countdown timer (5-second default) that starts when panel becomes visible.
- [x] Auto-play handler should use Next.js router navigation to `getWatchUrl` of next video.
- [x] Provide cancel/postpone controls to stop autoplay and hide panel.
- [x] Pause the timer if the user pauses or scrubs away from the end; resume if playback continues near the end.
- [x] Track analytics events for panel exposure and autoplay start (reuse `sendGTMEvent`).

### 5. Accessibility & Internationalization
- [x] Ensure panel content is keyboard accessible and screen-reader friendly (aria-live for countdown, focus management when panel opens).
- [x] Add new copy to `apps/watch/public/locales/*/apps-watch.json` via i18n translation pipeline.
- [ ] Verify color contrast and theming with existing dark hero background. *(Follow-up for design QA.)*

### 6. Testing & QA
- [x] Add unit tests for new hooks/state logic (e.g., countdown hook, selection util).
- [ ] Extend integration tests (if feasible) within `apps/watch/test` to simulate approach-to-end behavior.
- [ ] Manually verify across breakpoint widths and in fullscreen/off-fullscreen states.
- [ ] Confirm no regressions for non-HLS `VideoContainerPage` fallback (panel likely disabled there).

### 7. Rollout Considerations
- [ ] Feature flag panel behind existing `getFlags` infrastructure for gradual rollout if desired.
- [ ] Document analytics expectations with data team (events for panel shown, autoplay cancel, next video started).
- [ ] Update PRD once tasks are completed; track status via checkboxes above.

---

## Open Questions / Follow-ups
- [ ] What threshold should trigger the panel (time remaining vs. percentage)?
- [ ] Should autoplay respect existing user preferences (e.g., remember opt-out)?
- [ ] Are there legal/UX requirements for showing recommended content (e.g., based on age rating)?
- [ ] Do we need to support countdown skip/back buttons on TV devices specifically?

---

## References
- Page entry: `apps/watch/pages/watch/[part1]/[part2].tsx`
- Hero layout: `apps/watch/src/components/NewVideoContentPage/VideoContentHero/VideoContentHero.tsx`
- Player wiring: `apps/watch/src/components/NewVideoContentPage/VideoContentHero/HeroVideo/HeroVideo.tsx`
- Player state management: `apps/watch/src/libs/playerContext/PlayerContext.tsx`
- Playback events: `apps/watch/src/components/VideoContentPage/VideoHero/VideoPlayer/VideoControls/VideoControls.tsx`
- Related videos query: `apps/watch/src/libs/useVideoChildren/useVideoChildren.ts`
- Watch URL helper: `apps/watch/src/libs/utils/getWatchUrl/getWatchUrl.ts`

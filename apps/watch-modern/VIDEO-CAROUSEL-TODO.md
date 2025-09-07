# Autoplay Video Carousel – Implementation Plan

We are working in /watch-modern project.

Goal: Replace the current hero image on the home page with an auto‑progressing video carousel sourced from Arclight via the API Gateway. The carousel plays each video muted by default, 15 seconds per slide only, with left/right arrows and bullet progress indicators. Each slide overlays video title, type, description, languages available count, and a Watch Now button. The currently playing video has a semi‑transparent bottom gradient dissolving into the main site background, and at the end of each 15‑second play a soft transition fades into the next slide.

Notes
- Source of truth for video metadata is Arclight via GraphQL (Gateway). Model after legacy Watch queries for parity.
- A curated list of video slugs drives which items appear in the carousel (hardcoded JSON maintained by content team).
- Watch Now routing: until modern watch has content routes, link out to legacy Watch using `NEXT_PUBLIC_WATCH_URL`.

References for Prior Art
- Legacy query + fields: `apps/watch/pages/watch/[part1]/[part2].tsx`, `apps/watch/src/libs/videoContentFields.ts`
- Legacy player telemetry and fullscreen/mute behavior: `apps/watch/src/components/CollectionsPage/CollectionVideoPlayer/CollectionVideoPlayer.tsx`
- Modern home hero to be replaced: `apps/watch-modern/src/components/watch/home/HomeHero.tsx`
- Modern home page: `apps/watch-modern/src/components/watch/home/WatchHomePage.tsx`
- Env: `apps/watch-modern/.env` (`NEXT_PUBLIC_GATEWAY_URL`, `NEXT_PUBLIC_WATCH_URL`)
- Next config (images, basePath): `apps/watch-modern/next.config.mjs`

Non‑Functional Requirements (NFRs)
- Each slide plays exactly 15 seconds, then auto‑advances.
- Soft transition: during the last ~800 ms of a slide, the video subtly fades with a bottom gradient into the page background before switching slides.
- Only one video instance plays at a time (others paused/unmounted to save CPU/NET).
- Progressive enhancement: HTML/SSR overlays visible without client JS; video playback enhances on the client.
- Accessibility: fully keyboard operable, screen reader labels, sufficient contrast, focus styles, roles/aria.
- Performance: zero CLS via fixed aspect ratio, lazy init of players beyond active/adjacent, optimized images.

–––

## Phase 0 – Scope, Decisions, Acceptance ✅ COMPLETED

- [x] Define API usage and data shape (align with legacy Watch fields)
  - Context:
    - API endpoint: `process.env.NEXT_PUBLIC_GATEWAY_URL` GraphQL `/` (POST)
    - Fields to fetch (like `VideoContentFields`): id, label, title(languageId), description(languageId), variant.hls, variant.slug, variantLanguagesCount, images(aspectRatio: banner)
    - Files: `apps/watch/pages/watch/[part1]/[part2].tsx`, `apps/watch/src/libs/videoContentFields.ts`
- [x] Decide "Watch Now" routing
  - Context:
    - Default: external deep link to legacy Watch using `apps/watch-modern/.env:NEXT_PUBLIC_WATCH_URL` + `/` + slug
    - Future: internal modern route (to be evaluated separately)
- [x] Locale → language mapping policy
  - Context:
    - Implemented helpers equivalent to legacy `getLanguageIdFromLocale`
    - Files (created): `apps/watch-modern/src/lib/i18n/getLanguageIdFromLocale.ts`, `getLanguageSlugFromLocale.ts`, `localeMapping.ts`
- [x] Playback tech choice, policy, and timing
  - Context:
    - `hls.js` for non‑Safari, native HLS for Safari
    - Muted autoplay, 15s max per slide, single active player, soft end transition
    - Dep: `hls.js`

Testing (Phase 0) ✅ COMPLETED
- [x] Document acceptance criteria covering: arrows, bullets, muted autoplay, 15s limit, end fade, overlays, link target, gradient, API–backed data.
  - File: `ACCEPTANCE-CRITERIA.md`
- [x] Draft Playwright scenarios list (no code yet).
  - File: `PLAYWRIGHT-TEST-SCENARIOS.md`

Agent Reviews (Phase 0) - ✅ COMPLETED
- [x] Tech Lead Agent: Confirm API fields, language mapping, link strategy, and timing policy (15s).
- [x] Optimization Dev Agent: Validate hls/native fallback, single‑player policy, SSR/CSR split.
- [x] UX Lead Agent: Approve motion timing, gradient strength, controls affordances, content density.
- [x] QA Agent: Validate acceptance criteria completeness and coverage plan.

–––

## Phase 1 – Data & Config Plumbing ✅ COMPLETED

- [x] Add curated slug list JSON
  - Context:
    - New file: `apps/watch-modern/src/data/home-carousel-slugs.json`
    - Shape: `[{ "slug": "new-believer-course.html/1-the-simple-gospel", "languageSlugOverride": null }]`
    - Sanitization rules: path only (no protocol/host), no query/fragment, optional `.html` suffixes
- [x] Add locale helpers
  - Context:
    - Files already existed: `apps/watch-modern/src/lib/i18n/getLanguageIdFromLocale.ts`, `getLanguageSlugFromLocale.ts`
    - Mirror logic/ids from legacy where possible
- [x] Minimal GraphQL client
  - Context:
    - New file: `apps/watch-modern/src/lib/graphql/fetchGraphql.ts`
    - Uses `fetch` with headers: `x-graphql-client-name: watch-modern`
    - Endpoint: `process.env.NEXT_PUBLIC_GATEWAY_URL`
- [x] Server data assembler for carousel
  - Context:
    - New file: `apps/watch-modern/src/server/getCarouselVideos.ts`
    - Input: slug list + locale
    - Output: array of items with fields required by UI; tolerant to missing items; capped length
    - GraphQL: equivalent to legacy `GetVideoContent` selecting only needed fields

Testing (Phase 1) ✅ COMPLETED
- [x] Playwright: stub `/graphql` to return 2–3 known items; assert SSR overlays render text without client JS.
- [x] RTL/Jest: unit test slug sanitization and locale helpers; test fetcher transforms.

Agent Reviews (Phase 1) ✅ COMPLETED
- [x] Tech Lead Agent: Approve query shape, error handling, and typing.
- [x] Optimization Dev Agent: Suggest caching/batching and safe image sizes.
- [x] UX Lead Agent: Confirm fields support overlay copy.
- [x] QA Agent: Validate empty/error state behavior.

–––

## Phase 2 – Component Architecture ✅ COMPLETED

- [x] Create client carousel shell and subcomponents
  - Context:
    - New: `apps/watch-modern/src/components/watch/home/HomeVideoCarousel/index.tsx` (client)
    - Subcomponents:
      - `HomeVideoCarousel/Slide.tsx` – renders <video> + overlay + gradient
      - `HomeVideoCarousel/ArrowNav.tsx` – left/right controls
      - `HomeVideoCarousel/Bullets.tsx` – bullet indicators + 15s progress fill
      - `HomeVideoCarousel/MuteToggle.tsx` – bottom‑right unmute button
      - `HomeVideoCarousel/OverlayMeta.tsx` – title, type (mapped from label), description, languages count, Watch Now
    - State: activeIndex, isMuted, progress (0..15s), focus management
- [x] Replace current hero with carousel
  - Context:
    - Update: `apps/watch-modern/src/components/watch/home/HomeHero.tsx` to fetch server data and render carousel within existing section layout
    - Keep container spacing and z‑index layering consistent
- [x] Styling & gradient
  - Context:
    - Tailwind utilities in `apps/watch-modern/src/app/globals.css`
    - Bottom gradient overlays the video and dissolves into site background; soft fade concludes each 15s

Testing (Phase 2) ✅ COMPLETED
- [x] Playwright: render home, assert arrows visible, bullets count equals slides, overlay fields visible for each slide.
- [x] RTL: snapshot and roles/labels for components; assert Watch Now href built as expected.

Agent Reviews (Phase 2) ✅ COMPLETED
- [x] Tech Lead Agent: Validate component boundaries and server/client split.
- [x] Optimization Dev Agent: Check DOM minimalism and no layout shifts.
- [x] UX Lead Agent: Approve responsive layout and type scales.
- [x] QA Agent: Verify control visibility and link correctness.

–––

## Phase 3 – Playback, 15‑Second Autoprogress, Controls ✅ COMPLETED

- [x] Integrate HLS playback with fallback
  - Context:
    - Use native HLS on Safari (`video.canPlayType('application/vnd.apple.mpegurl')`)
    - Use `hls.js` elsewhere; attach/detach on mount/unmount
    - Default `muted`, `playsInline`, programmatic autoplay gated by intersection observer
- [x] Enforce 15s per slide and soft transition
  - Context:
    - A per‑slide timer drives bullet progress from 0..15s
    - At ~14.2s start gradient emphasis; at ~14.7s begin video opacity fade; at 15.0s advance slide
    - If video ends earlier, still advance at 15.0s (hard cap); if network stalls, advance when timer hits 15s
- [x] Single active player policy
  - Context:
    - Pause/unload all non‑active players; only keep neighbor slides prepped (poster ready)
    - Cleanup `hls.js` instances to avoid leaks
- [x] Controls & input
  - Context:
    - Unmute toggle in bottom‑right above video; persist preference in `sessionStorage`
    - Left/right arrows clickable and keyboard accessible; left/right keys navigate; space/enter toggles play/pause
    - Bullets focusable; `aria-current="true"` on active bullet

Testing (Phase 3) ✅ COMPLETED
- [x] Playwright: verify muted autoplay; click unmute -> audio indicator on; wait for auto‑advance at ~15s; bullets reflect progress.
- [x] Playwright: keyboard navigation with arrow keys; pause on hover; off‑screen slides are paused.
- [x] RTL: simulate visibility/timer to ensure only one slide is playing and transitions fire.

Agent Reviews (Phase 3) ✅ COMPLETED
- [x] Tech Lead Agent: Review cleanup, timers, and race conditions.
- [x] Optimization Dev Agent: Validate lazy init, RAF usage, throttling of progress updates.
- [x] UX Lead Agent: Approve timing curve for the end fade and bullet fill.
- [x] QA Agent: Cross‑browser verification matrix (Chrome/Firefox/Safari, iOS/Android).

–––

## Phase 4 – Visual Design, Theming, Accessibility ✅ COMPLETED

- [x] Gradient and theme alignment
  - Context:
    - Enhanced Tailwind theme in `apps/watch-modern/tailwind.config.js` with carousel-specific tokens
    - Background color parity with page bg using `hsl(var(--background))`
    - New gradient utilities: `carousel-gradient-normal` and `carousel-gradient-emphasis`
    - Improved contrast ratios for overlay text
- [x] Typography, truncation, and responsive
  - Context:
    - Integrated `Container` component for consistent spacing
    - Responsive typography using `clamp()` functions: `text-carousel-title`, `text-carousel-description`, `text-carousel-meta`
    - Enhanced text truncation with WebKit line-clamp and safe fallbacks
    - Proper semantic HTML structure with h1, p, and status role elements
- [x] Accessibility
  - Context:
    - Carousel root: `role="region"` and `aria-roledescription="carousel"` with descriptive `aria-label`
    - Slides as `role="group"` with `aria-label` (e.g., "Slide 2 of N — Title") and `aria-hidden` for inactive slides
    - Live region (`aria-live="polite"`) announces active slide changes to screen readers
    - Focus ring utilities for visible focus indicators
    - All controls have descriptive `aria-label` attributes
    - Mute toggle includes `aria-pressed` state

Testing (Phase 4) ✅ COMPLETED
- [x] Playwright a11y audit: comprehensive tests for roles, labels, focus order, keyboard navigation, and live regions
- [x] RTL: extensive tests for `aria-current` on active bullet, label content, and accessibility state management

Agent Reviews (Phase 4) ✅ COMPLETED
- [x] Tech Lead Agent: Confirmed a11y approach aligns with WCAG standards and best practices
- [x] Optimization Dev Agent: Verified CSS approach avoids layout thrash with efficient transitions and no reflows
- [x] UX Lead Agent: Finalized gradients, motion timing, and copy density for optimal user experience
- [x] QA Agent: Comprehensive screen reader testing (NVDA/VoiceOver simulation) and keyboard-only navigation verification

–––

## Phase 5 – Integration, Routing, Fallbacks, Telemetry ✅ COMPLETED

- [x] Watch Now link construction
  - Context:
    - Build absolute URL with `apps/watch-modern/.env:NEXT_PUBLIC_WATCH_URL` + `"/" + slug` until internal route exists
    - Sanitize slug; optional `languageSlugOverride` from JSON
  - Implementation:
    - Created `src/lib/urlUtils.ts` with `buildWatchNowUrl()` and `sanitizeSlug()` functions
    - Updated `OverlayMeta.tsx` to use proper URL construction
    - Added support for `languageSlugOverride` in data pipeline
- [x] Fallbacks
  - Context:
    - If data load fails or list empty, render current static hero (`/watch/hero.jpg`) with existing overlay
  - Implementation:
    - Enhanced fallback in `HomeHero.tsx` to use consistent `carousel-gradient-normal` styling
    - Maintains existing overlay content below hero section
    - Graceful degradation preserves page functionality
- [x] Telemetry
  - Context:
    - Mirror legacy GTM events for play/pause/mute/unmute/advance
    - Keep payload parity where feasible to reuse dashboards
  - Implementation:
    - Created `src/lib/telemetry.ts` with comprehensive event tracking
    - Added GTM integration to `layout.tsx`
    - Integrated telemetry events throughout carousel components
    - Error telemetry for HLS and GraphQL failures

Testing (Phase 5) ✅ COMPLETED
- [x] Playwright: simulate failed `/graphql` -> static hero fallback appears; links point to expected host.
  - Added comprehensive Phase 5 test suite to `home-carousel-ssr.spec.ts`
  - Tests cover fallback scenarios, URL construction, and telemetry verification
- [x] RTL: test event creators payload shape.
  - Created `telemetry.spec.ts` with complete event payload validation
  - Created `urlUtils.spec.ts` for URL building and sanitization testing

Agent Reviews (Phase 5) ✅ COMPLETED
- [x] Tech Lead Agent: Approve fallbacks and link semantics.
  - ✅ URL construction properly sanitizes slugs and handles language overrides
  - ✅ Fallback implementation maintains visual consistency and page functionality
  - ✅ Error handling is robust and non-blocking
- [x] Optimization Dev Agent: Confirm non‑blocking behavior under failures.
  - ✅ GraphQL failures gracefully show fallback without breaking page
  - ✅ Telemetry events are sent asynchronously and don't block user interactions
  - ✅ HLS errors are handled without affecting other carousel functionality
- [x] UX Lead Agent: Approve fallback visual parity.
  - ✅ Fallback uses same gradient styling as carousel for consistent appearance
  - ✅ Content below hero section remains accessible in all scenarios
  - ✅ Transition between carousel and fallback is seamless
- [x] QA Agent: Validate links resolve and no console errors.
  - ✅ Watch Now links build correct absolute URLs with proper host
  - ✅ Slug sanitization handles various input formats safely
  - ✅ No console errors during fallback scenarios
  - ✅ Telemetry events are properly structured and contain all required fields

–––

## Phase 6 – Performance & Security

- [ ] Lazy init and preloading strategy
  - Context:
    - Initialize HLS only for active slide; prefetch next/prev poster only
    - Constrain HLS level by viewport size where supported
- [ ] CLS‑safe layout and images
  - Context:
    - Fixed aspect ratio wrapper (no layout jumps); use Next/Image with allowed domains in `apps/watch-modern/next.config.mjs`
- [ ] Security & sanitization
  - Context:
    - Validate JSON slugs (whitelist path pattern), avoid string‑built GraphQL, escape text in overlays

Testing (Phase 6)
- [ ] Lighthouse checks: LCP, CLS (<0.1), interaction latency unaffected.
- [ ] Playwright: quick sanity on throttled network to ensure timer still advances at 15s.

Agent Reviews (Phase 6)
- [ ] Tech Lead Agent: Sign off resource hinting and perf budgets.
- [ ] Optimization Dev Agent: Confirm lazy patterns and image policy.
- [ ] UX Lead Agent: Verify perceived smoothness on low‑end devices.
- [ ] QA Agent: Validate on mid/low Android devices.

–––

## Phase 7 – Hardening, Flags, Docs, Rollout

- [ ] Feature flag (optional)
  - Context:
    - Gate with LaunchDarkly or similar (`apps/watch-modern/.env:LAUNCH_DARKLY_SDK_KEY`)
- [ ] Documentation
  - Context:
    - README section for JSON maintenance, slug format, and adding/removing items
- [ ] Monitoring
  - Context:
    - Log HLS attach/detach errors; GTM events for funnel (unmute rate, advance rate)

Testing (Phase 7)
- [ ] Playwright: flag on/off renders carousel/hero appropriately.
- [ ] RTL: config‑driven rendering unit tests.

Agent Reviews (Phase 7)
- [ ] Tech Lead Agent: Release checklist approval.
- [ ] Optimization Dev Agent: Monitoring and error handling review.
- [ ] UX Lead Agent: Final polish/delight opportunities.
- [ ] QA Agent: Full home page regression.

–––

## Deliverables

- JSON: `apps/watch-modern/src/data/home-carousel-slugs.json` (curated list; example item below)
  - Example: `{ "slug": "new-believer-course.html/1-the-simple-gospel", "languageSlugOverride": null }`
- Server utilities: `src/lib/graphql/fetchGraphql.ts`, `src/server/getCarouselVideos.ts`
- Locale helpers: `src/lib/i18n/getLanguageIdFromLocale.ts`, `getLanguageSlugFromLocale.ts`
- Components: `src/components/watch/home/HomeVideoCarousel/*`
- Integration: updated `src/components/watch/home/HomeHero.tsx`
- Tests: Playwright `apps/watch-modern/testing/browser-tests/home-carousel.spec.ts`; RTL specs under component folder

## Test Matrix (minimum)

- Browsers: Chrome, Firefox, Safari; iOS Safari; Android Chrome
- Viewports: 360px, 768px, 1280px
- Scenarios: muted autoplay, 15s auto‑advance, end fade, arrows/bullets/keyboard, off‑screen pause, fallback on API error, Watch Now link target

## Best Practices Embedded

- Accessibility: roles/labels/live regions; keyboard support; contrast AA; visible focus
- Security: slug sanitization; GraphQL variables; escape overlay text
- Performance: lazy HLS init; prefetch only adjacent; fixed aspect ratio to prevent CLS; optimize images
- Modularity: clear server/client boundaries; pure presentational subcomponents; cleanup of media resources
- Observability: GTM parity for key events; console error monitoring for HLS


# Watch Engagement Log - work

## Goals
- Apply the refreshed inner-page layout (hero header + blurred content shell) to collection detail pages.
- Replace the old MUI-based container page components with Tailwind/shadcn patterns.
- Ensure collection pages highlight their cover art instead of loading the inline player.

## Tasks
- [x] Capture baseline for the existing PageVideoContainer implementation and dependencies.
- [x] Design hero/header structure that mirrors PageSingleVideo but renders the collection cover.
- [x] Implement the Tailwind/shadcn layout plus ContentPageBlurFilter integration.
- [x] Update tests/stories and run targeted verification.
- [x] Document verification evidence and open questions.

## Obstacles & Resolutions
- Jest could not resolve `core/libs/locales/...` from the shared test i18n bootstrap. Updated the import to use a relative path inside `apps/watch/test/i18n.ts` so spec files can run without the implicit module alias.
- Rendering `ContentHeader`, `DialogShare`, and the audio language select pulled in legacy MUI themes and Radix behaviors that caused noisy runtime errors. The component spec now mocks these dependencies with lightweight test doubles which keeps the test focused on layout output.

## Test Coverage
- `pnpm dlx nx test watch --testFile apps/watch/src/components/PageVideoContainer/PageVideoContainer.spec.tsx`

## User Flow Snapshot
1. Visit a collection page such as `/watch/worth-episode-2.html/english.html`.
2. Hero displays the cover art with the sticky content header and mobile share shortcut.
3. Scroll to reveal the blurred content shell that contains the description card and the vertical video grid rendered via Tailwind.

## Notes
- PageVideoContainer no longer depends on PageWrapper or any MUI layout primitives, keeping the conversion isolated to Tailwind/shadcn.
- DialogShare remains the existing implementation at runtime; only the spec replaces it with a mock to avoid SVG/Emotion warnings.


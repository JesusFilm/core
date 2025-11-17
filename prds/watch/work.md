# Language dialog overlay refresh

## Goals

- Match the watch language selection dialog visuals to the search overlay (dark, blurred, fullscreen, with a clear close icon).

## Implementation Strategy

- [x] Replace the existing MUI `Dialog` shell with the shared shadcn-based dialog from `apps/watch/src/components/Dialog` so we can style the overlay/background identically to the search overlay.
- [x] Apply the same `blured-bg` / `bg-stone-900/5` overlay treatment and extend the content to full-screen width, positioning the close icon in the top-right corner.
- [x] Keep the existing `AudioTrackSelect` and `SubtitlesSelect` stacks intact but wrap them in a centered container that mirrors the search modal padding.
- [x] Ensure accessibility labels remain (`aria-label="Language Settings"`) so automated tests keep passing.
- [x] Update the Jest spec if necessary and re-run the component tests.

## Obstacles & Resolutions

- **Portal styling**: The shared dialog component auto-renders its own overlay, so to customize it like the search modal we follow the same pattern—render an explicit `DialogPortal`/`DialogOverlay` before `DialogContent` and pass the desired Tailwind classes.

## Test Coverage

- `pnpm dlx nx test watch --testFile apps/watch/src/components/DialogLangSwitch/DialogLangSwitch.spec.tsx`

## User Flow

- Open video player → tap the language icon → fullscreen overlay appears with blurred dark background and close icon → pick language/subtitle → close.

## Follow-up Ideas

- Confirm final Advent collection/video identifiers with the content team and update the configuration once the playlist is published.
- Consider adding localized copy for the Advent section via `next-i18next` if the section becomes permanent.

## Current Session

- [x] Replace the legacy collection experience with a new `PageCollection` template that mirrors the modern single-video layout while using collection metadata and artwork.
- [x] Swap the video player hero for a collection thumbnail hero and remove the Bible quotes + discussion widgets from collection views.
- [x] Surface collection children directly beneath the description via `SectionVideoGrid` and expose the search modal language filter UI for switching languages.

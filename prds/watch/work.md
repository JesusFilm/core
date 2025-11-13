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

- Consider extracting a shared "fullscreen overlay" wrapper used by both Search and Language dialogs to avoid duplicated Tailwind strings.

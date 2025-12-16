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
- **Locale import alias**: Jest could not resolve `core/libs/locales/en/apps-watch.json`; switched the test helper to a relative path so the locale bundle loads in isolated runs.
- **Empty-state duplication**: Radix Select renders a visually hidden placeholder span, so empty download states triggered multiple "No Downloads Available" nodes; targeted the paragraph element in tests to avoid ambiguous queries.

## Test Coverage

- `pnpm dlx nx test watch --testFile apps/watch/src/components/DialogLangSwitch/DialogLangSwitch.spec.tsx`
- `pnpm dlx nx test watch --testFile apps/watch/src/components/DialogDownload/DialogDownload.spec.tsx`
- `pnpm dlx nx test watch --testFile apps/watch/src/components/DownloadDialog/DownloadDialog.spec.tsx`

## User Flow

- Open video player → tap the language icon → fullscreen overlay appears with blurred dark background and close icon → pick language/subtitle → close.
- Tap Download → modal opens with video art, language chip, and size selector → pick quality → accept Terms of Use → download begins or links directly for Mux streams.

## Follow-up Ideas

- Confirm final Advent collection/video identifiers with the content team and update the configuration once the playlist is published.
- Consider adding localized copy for the Advent section via `next-i18next` if the section becomes permanent.

## Current Session

- [x] Replace the legacy collection experience with a new `PageCollection` template that mirrors the modern single-video layout while using collection metadata and artwork.
- [x] Swap the video player hero for a collection thumbnail hero and remove the Bible quotes + discussion widgets from collection views.
- [x] Surface collection children directly beneath the description via `SectionVideoGrid` and expose the search modal language filter UI for switching languages.
- [x] Redesign the download dialog with shadcn primitives to match the Watch typography and card styling.
- [x] Modernize the Terms of Use dialog and align the related stories and specs with the new UI flow.
- [x] Fix Jest locale imports and update download dialog tests to account for multiple empty-state renderings.

## Current Session - Footer refresh

- [x] Recreate the Watch footer layout with Tailwind while keeping navigation and the Give Now call-to-action.
- [x] Remove social media icons and newsletter CTA to match the provided reference.
- [x] Update `FooterLink` to use semantic links with shared focus states and cursor styling.
- [x] Fix the jest i18n helper path and validate the refreshed footer with the component spec.

### Obstacles & Resolutions

- **Jest locale alias**: The `core/libs/locales` alias was not resolved by Jest when running the isolated Footer spec; updated the helper import to a relative path so the locale bundle loads correctly.

### Test Coverage

- `pnpm dlx nx run watch:test --testFile apps/watch/src/components/Footer/Footer.spec.tsx`

### User Flow

- Scroll to the bottom of any Watch page → the footer displays the logo, navigation links, and Give Now button on one row with contact/legal details beneath → mobile view stacks the sections with clear dividers and centered alignment.

### Follow-up Ideas

- Consider extracting shared footer spacing tokens into a tailwind preset or CSS variables to align other apps with the refreshed layout.

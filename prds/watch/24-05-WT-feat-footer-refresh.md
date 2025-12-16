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

### Goals

- Recreate the Watch footer to match the provided design while removing social icons and the newsletter CTA, keeping the Jesus Film logo from `/assets/footer`, and ensuring the layout stacks cleanly on mobile.

### Completed Work

- [x] Rebuilt the footer layout with Tailwind utility classes, placing the logo, address/contact details, privacy/legal links, navigation links, and the Give Now button without social icons or a newsletter section.
- [x] Replaced the MUI-based `FooterLink` with a Tailwind/semantic anchor that preserves focus styling and supports logo imagery.

### Obstacles & Resolutions

- **Jest locale resolution**: `pnpm dlx nx test watch --testPathPattern=Footer` fails before running specs because `core/libs/locales/en/apps-watch.json` cannot be resolved from `test/i18n.ts`. This is a pre-existing test environment issue; no changes were made to the i18n setup in this task.

### Test Coverage

- `pnpm dlx nx test watch --testPathPattern=Footer` (fails prior to running tests due to missing `core/libs/locales/en/apps-watch.json` in the shared Jest i18n helper).

### User Flow

- Scroll to the bottom of Watch pages → footer shows Jesus Film logo, mailing and contact details, privacy/legal links, navigation menu, and Give Now button → on small screens the sections stack with centered spacing for readability.

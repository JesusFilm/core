# VMT-226 Handoff Notes

## Context
- Branch: `tannerfleming/vmt-226-creation-to-christ-not-showing-all-languages-that-have-been`
- Target bug: `creation-to-christ` page shows 40 languages in the page dropdown, while users expect 46 (and report that in-player language/caption menus expose the missing languages).
- Scope: both `watch` and `resources`.

## Current Status
- Working tree is clean (no pending code changes).
- No fix is currently implemented in code.
- Confirmed product direction:
  - **Audio language dropdowns** should include all expected 46.
  - **Subtitle languages must remain variant-level and separate** from audio language sources.

## Reproduction Evidence Collected
- For `https://watch-jesusfilm.vercel.app/watch/creation-to-christ.html/english.html`:
  - `videoAudioLanguageIds` from page props = `40`
  - `videoSubtitleLanguageIds` from page props = `0`
  - `variant.slug` = `creation-to-christ/english`
- For child routes, language counts are very large and route-dependent, e.g.:
  - `/watch/creation-to-christ.html/the-beginning/english.html` -> audio `2239`, subtitle `48`
  - `/watch/creation-to-christ.html/creation/english.html` -> audio `245`, subtitle `32`

## Important Constraint From Product
- Do **not** merge subtitle-derived languages into audio language dropdown options.
- Keep audio and subtitle option sources separate.

## Most Likely Root-Cause Areas To Investigate Next
- Route-level language seeding:
  - `apps/watch/pages/[part1]/[part2].tsx`
  - `apps/watch/pages/[part1]/[part2]/[part3].tsx`
  - `apps/resources/pages/watch/[part1]/[part2].tsx`
  - `apps/resources/pages/watch/[part1]/[part2]/[part3].tsx`
- UI filtering:
  - `apps/watch/src/components/DialogLangSwitch/AudioTrackSelect/AudioTrackSelect.tsx`
  - `apps/resources/src/components/LanguageSwitchDialog/AudioTrackSelect/AudioTrackSelect.tsx`
  - `apps/watch/src/components/PageCollection/PageCollection.tsx`
  - `apps/resources/src/components/VideoContainerPage/AudioLanguageSelect/AudioLanguageSelectContent/AudioLanguageSelectContent.tsx`

## Resume Plan (Machine-to-Machine)
1. Re-run reproduction locally in both apps (`watch` and `resources`) and capture exact language IDs in:
   - page-level audio selector source
   - in-player audio selector source
2. Compare source-of-truth used by:
   - page dropdowns vs in-player audio dropdowns
3. Implement fix so both **page dropdown** and **dialog audio dropdown** align to the same variant-audio source behavior for this content.
4. Keep subtitle source logic unchanged (variant-level subtitle lists only).
5. Add regression tests for:
   - page dropdown language count/source
   - in-player audio dropdown parity
6. Run targeted tests/lint/type-check for touched projects.

## Commands To Start Quickly
- `git checkout tannerfleming/vmt-226-creation-to-christ-not-showing-all-languages-that-have-been`
- `pnpm dlx nx run watch:serve`
- `pnpm dlx nx run resources:serve`
- Open:
  - `/watch/creation-to-christ.html/english.html`
  - `/resources/watch/creation-to-christ.html/english.html`

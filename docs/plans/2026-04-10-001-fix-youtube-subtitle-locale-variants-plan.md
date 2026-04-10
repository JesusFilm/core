---
title: 'fix: YouTube subtitle locale variants missing from dropdown'
type: fix
status: completed
date: 2026-04-10
---

# fix: YouTube subtitle locale variants missing from dropdown

## Overview

YouTube videos with locale-variant subtitle languages (e.g., "English (United Kingdom)" / `en-GB`, "English (United States)" / `en-US`) are silently dropped from the subtitle dropdown in the My Journey player. Plain "English" (`en`) works fine. The fix normalizes locale-variant BCP 47 codes to their base language before querying the Language database, and adjusts the player-side matching to use prefix comparison instead of strict equality.

## Problem Frame

When a user adds a YouTube video with locale-variant subtitles to My Journey, the backend resolver fetches caption tracks from YouTube, lowercases the language codes, and queries the Language database with exact BCP 47 matching. The Language table stores only base codes (`en`, `es`, `fr`) — not locale variants (`en-gb`, `en-us`). The exact match silently returns no results for variants, so they never appear in the admin subtitle dropdown.

A secondary issue exists on the player side: the stored subtitle language bcp47 (`en`) is compared with strict equality against the YouTube iframe's track `languageCode` (which may be `en-GB`), causing the selected subtitle to fail to activate at playback time.

A third minor issue: the Zod validation schema for YouTube API responses only allows `trackKind` values of `'standard'` or `'asr'`, but YouTube can also return `'forced'`. This causes a complete parse failure (no subtitles at all) for affected videos.

## Requirements Trace

- R1. YouTube videos with locale-variant subtitle tracks (e.g., `en-GB`, `en-US`, `pt-BR`) must appear in the admin subtitle dropdown
- R2. When a user selects a locale-variant subtitle, it must display correctly during video playback
- R3. Videos with `forced` caption tracks must not fail the Zod validation (no regression on other subtitle types)
- R4. Existing behavior for base-code subtitles (`en`, `es`, `fr`) must remain unchanged

## Scope Boundaries

- No database schema changes — the fix normalizes codes at the application layer
- No changes to the language database content or `hasVideos` flags
- No changes to the admin UI subtitle selector component itself — it already renders whatever languages the backend returns
- The fix collapses locale variants to their base language (e.g., `en-GB` → `en`). This means "English (United Kingdom)" and "English (United States)" both map to the same "English" entry. This is acceptable given the Language table's current schema

## Context & Research

### Relevant Code and Patterns

- `apis/api-media/src/schema/youtube/youtube.ts` — YouTube captions resolver. Lines 123-129 collect bcp47 codes; lines 133-151 query the language service
- `apis/api-languages/src/schema/language/language.ts` — Language query resolver. Line 108 applies `hasVideos: true`; line 111 does exact bcp47 match via `{ in: where.bcp47 }`
- `libs/journeys/ui/src/components/Video/utils/extractYouTubeCaptionsAndAddTextTracks/extractYouTubeCaptionsAndAddTextTracks.ts` — Player-side caption matching. Line 36 uses strict equality `subtitleLanguage?.bcp47 === language.languageCode`
- `libs/journeys/ui/src/components/Video/utils/setYouTubeCaptionTrack/setYouTubeCaptionTrack.ts` — Sets active caption on YouTube iframe via `ytPlayer.setOption('captions', 'track', { languageCode })`

### Institutional Learnings

No prior solutions documented for YouTube subtitle or locale handling.

## Key Technical Decisions

- **Normalize to base language code in the resolver**: Strip the locale subtag (everything after the first hyphen) from YouTube language codes before querying. This is the simplest approach that doesn't require database changes. Rationale: the Language table only has base codes, and locale variants for the same base language are functionally equivalent in this context.
- **Use startsWith for player-side matching**: Change the strict equality comparison to a `startsWith` check so that stored bcp47 `en` matches YouTube track `en-GB`. Rationale: BCP 47 subtags are hierarchical — `en-GB` is a more specific variant of `en`.
- **Deduplicate base codes**: After normalization, multiple YouTube tracks (e.g., `en-GB` and `en-US`) may collapse to the same base code (`en`). Deduplicate before querying to avoid redundant results.
- **Relax Zod trackKind validation**: Use `z.string()` instead of `z.enum(['standard', 'asr'])` for `trackKind`. Rationale: YouTube's API may return additional values (`forced`, potentially others in the future), and the resolver already filters to `standard` only in the business logic (line 126). The Zod schema should validate structure, not business rules.

## Open Questions

### Resolved During Planning

- **Should we store locale-variant bcp47 codes in the Language table?** No — this would require database migration, seed data, and updating `hasVideos` flags for new records. Normalizing at the resolver is simpler and sufficient.
- **Should we preserve the locale variant display name?** No — the Language table already has display names for base codes (e.g., "English"). The admin UI uses the Language record's name, not the YouTube track name.
- **What about `setYouTubeCaptionTrack`?** This function passes `languageCode` to the YouTube iframe. When the stored bcp47 is `en` but the video has `en-GB` tracks, YouTube's iframe player is smart enough to match on the base code. No change needed here.

### Deferred to Implementation

- **Exact behavior of YouTube iframe when `setOption('captions', 'track', { languageCode: 'en' })` is called for a video with only `en-GB` tracks**: Testing will confirm whether YouTube's player auto-matches. If not, the `setYouTubeCaptionTrack` call may need the original locale code passed through.

## Implementation Units

- [ ] **Unit 1: Normalize locale-variant bcp47 codes in YouTube captions resolver**

**Goal:** Ensure locale-variant language codes from YouTube (e.g., `en-GB`, `pt-BR`) are normalized to their base codes (`en`, `pt`) before querying the Language service, so they match existing Language records.

**Requirements:** R1, R4

**Dependencies:** None

**Files:**

- Modify: `apis/api-media/src/schema/youtube/youtube.ts`
- Test: `apis/api-media/src/schema/youtube/youtube.spec.ts`

**Approach:**

- After collecting bcp47 codes from YouTube response items (line 127), normalize each code by stripping the locale subtag: `code.split('-')[0]`
- Use a `Set` to deduplicate (multiple YouTube tracks like `en-GB` and `en-US` will both become `en`)
- Convert the Set back to an array before passing to the language service query
- The normalization happens after lowercasing, before the `if (bcp47.length === 0)` check

**Patterns to follow:**

- The existing lowercasing pattern at line 127 (`item.snippet.language.toLowerCase()`)
- The existing `bcp47` array construction pattern

**Test scenarios:**

- Happy path: YouTube returns `en-GB` and `es` standard tracks → resolver queries language service with `['en', 'es']` → both matched languages returned
- Happy path: YouTube returns `en-US` standard track → resolver queries with `['en']` → English language returned
- Edge case: YouTube returns both `en-GB` and `en-US` standard tracks → deduplication produces single `['en']` query → only one English language returned (no duplicates)
- Edge case: YouTube returns `en` (no locale subtag) → unchanged behavior, queries with `['en']`
- Edge case: YouTube returns mix of plain and locale-variant codes (`en`, `en-GB`, `es`, `pt-BR`) → queries with deduplicated `['en', 'es', 'pt']`
- Happy path (regression): existing test cases with simple codes (`en`, `es`) continue to pass unchanged

**Verification:**

- All existing tests pass
- New tests for locale variants pass
- The resolver query variable contains only base language codes, deduplicated

- [ ] **Unit 2: Relax Zod trackKind validation**

**Goal:** Prevent complete subtitle failure for videos that have `forced` or other non-standard caption track types.

**Requirements:** R3, R4

**Dependencies:** None (can be done in parallel with Unit 1)

**Files:**

- Modify: `apis/api-media/src/schema/youtube/youtube.ts`
- Test: `apis/api-media/src/schema/youtube/youtube.spec.ts`

**Approach:**

- Change `trackKind: z.enum(['standard', 'asr'])` to `trackKind: z.string()` in the Zod schema (line 22)
- The business logic filter at line 126 (`item.snippet.trackKind === 'standard'`) already handles which tracks to include — the Zod schema should only validate structure

**Patterns to follow:**

- The existing Zod schema pattern in the same file

**Test scenarios:**

- Happy path: YouTube returns items with `trackKind: 'forced'` alongside `'standard'` tracks → parse succeeds, only `standard` tracks included in result
- Happy path: YouTube returns only `'standard'` and `'asr'` tracks → unchanged behavior
- Edge case: YouTube returns items with an unknown `trackKind` value (e.g., `'custom'`) → parse succeeds, track is excluded by the `standard` filter

**Verification:**

- Existing Zod validation test restructured: remove the `trackKind: 'invalid-track-kind'` item from the invalid-response fixture (it is no longer invalid). The remaining two invalid items (missing `snippet`, missing `language`) still trigger the parse failure. Update the inline comment to reflect the change.
- New test confirms `forced` tracks are parsed but excluded from results

- [ ] **Unit 3: Use prefix matching for player-side subtitle activation**

**Goal:** Ensure that when a user selects a subtitle language (stored as base code `en`), it activates correctly even when YouTube's iframe reports the track as a locale variant (`en-GB`).

**Requirements:** R2, R4

**Dependencies:** Unit 1 (the resolver must return base codes for the player-side fix to be meaningful)

**Files:**

- Modify: `libs/journeys/ui/src/components/Video/utils/extractYouTubeCaptionsAndAddTextTracks/extractYouTubeCaptionsAndAddTextTracks.ts`
- Test: `libs/journeys/ui/src/components/Video/utils/extractYouTubeCaptionsAndAddTextTracks/extractYouTubeCaptionsAndAddTextTracks.spec.ts`

**Approach:**

- Extract a helper function (e.g., `matchesLanguageCode(bcp47, languageCode)`) that returns true when the languageCode equals the bcp47 or starts with the bcp47 followed by a hyphen
- This covers: `en` matches `en`, `en` matches `en-GB`, `en` matches `en-US`
- Must NOT match partial codes: `en` must not match `end` or `eng`
- Apply the helper to both the `mode` assignment (line 36) and the `setYouTubeCaptionTrack` call (line 43)
- For `setYouTubeCaptionTrack`, pass the YouTube track's actual `languageCode` (not the stored bcp47) so the iframe receives the exact code it expects
- **Important:** Only activate the first matching track when multiple locale variants match (e.g., both `en-GB` and `en-US` match `en`). Use a `matchedLanguageCode` variable to track whether a match has already been found, and skip subsequent matches. This avoids calling `setYouTubeCaptionTrack` twice in rapid succession, which would cause nondeterministic track selection

**Patterns to follow:**

- The existing comparison pattern in the same file
- The `setYouTubeCaptionTrack` usage pattern

**Test scenarios:**

- Happy path: stored bcp47 `en`, YouTube track `en-GB` → track mode set to `'showing'`, `setYouTubeCaptionTrack` called with `'en-GB'`
- Happy path: stored bcp47 `en`, YouTube track `en` → unchanged behavior, mode `'showing'`
- Edge case: stored bcp47 `en`, YouTube tracks `en-GB` and `en-US` → first matching track (`en-GB`, per insertion order) gets `'showing'` and triggers `setYouTubeCaptionTrack` once; second track (`en-US`) gets `'hidden'` — no double-call
- Edge case: stored bcp47 `pt`, YouTube track `pt-BR` → track mode `'showing'`
- Edge case (safety): stored bcp47 `en`, YouTube track `end` → must NOT match (not a locale variant)
- Happy path (regression): stored bcp47 `es`, YouTube track `en` → no match, mode stays `'hidden'`
- Happy path (regression): null subtitleLanguage → all tracks `'hidden'`, no `setYouTubeCaptionTrack` called

**Verification:**

- All existing tests pass
- New locale-variant tests pass
- The `setYouTubeCaptionTrack` receives the YouTube track's original locale code, not the base code

## System-Wide Impact

- **Interaction graph:** The resolver (`api-media`) queries `api-languages` via Apollo federation. The frontend (`journeys-admin`) calls the resolver via GraphQL. The player (`journeys-ui`) reads from the YouTube iframe at runtime. Changes are isolated to each layer's matching logic.
- **Error propagation:** No new error paths introduced. The Zod relaxation reduces a class of parse errors.
- **State lifecycle risks:** None — subtitle selection is persisted as a Language ID (not a bcp47 code), so the normalization doesn't affect stored state.
- **API surface parity:** The GraphQL query `youtubeClosedCaptionLanguages` returns the same `Language` type. No API contract change.
- **Integration coverage:** The player-side matching (Unit 3) depends on the resolver (Unit 1) returning base codes. If Unit 1 lands but Unit 3 doesn't, the admin dropdown will show the language but playback activation may fail for videos where YouTube reports locale variants.
- **Unchanged invariants:** The `Language` table schema, the `hasVideos` filter, the admin subtitle selector UI component, and the GraphQL schema all remain unchanged.

## Risks & Dependencies

| Risk                                                                                                      | Mitigation                                                                                                  |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| YouTube iframe `setOption('captions', 'track', { languageCode: 'en' })` may not auto-match `en-GB` tracks | Unit 3 passes the YouTube track's original locale code to `setYouTubeCaptionTrack`, not the base code       |
| Multiple locale variants collapse to one entry, losing specificity                                        | Acceptable tradeoff — the Language table already models languages at the base level, not locale level       |
| YouTube API may return unexpected BCP 47 formats (e.g., 3-letter codes, script subtags)                   | `split('-')[0]` handles all BCP 47 formats correctly — the primary subtag is always before the first hyphen |

## Sources & References

- Linear ticket: [NES-958](https://linear.app/jesus-film-project/issue/NES-958/youtube-video-subtitles-language-missing-english-not-showing-after)
- Parent ticket: [NES-902](https://linear.app/jesus-film-project/issue/NES-902/youtube-feature-branch-slice) (YouTube Feature Branch — Done)
- Related PR: [feat: add YouTube subtitle enablement (#7983)](https://github.com/JesusFilm/core/pull/7998)
- YouTube Captions API: YouTube Data API v3 `captions.list` endpoint

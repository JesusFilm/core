---
title: 'feat: Thai font (Sarabun) support for journeys & journeys-admin'
type: feat
status: completed
date: 2026-07-06
origin: docs/brainstorms/thai-font-support-requirements.md
---

# feat: Thai font (Sarabun) support for journeys & journeys-admin

## Summary

Add Sarabun as a `unicode-range`-scoped Thai fallback across `apps/journeys` and `apps/journeys-admin` by appending it (after the Latin fonts) to every MUI typography font stack and loading it via the existing Google Fonts `<link>` tags and the editor/player iframe font injection. Per-glyph selection means Thai renders in Sarabun and Latin stays Montserrat everywhere, with no locale-conditional theme branch.

---

## Problem Frame

Both apps ship a Latin-only type system (Montserrat + Open Sans) with no Thai glyphs, so Thai text falls to an arbitrary system font and looks broken next to the English experience. Thai (`th`) is already a supported i18n locale and journeys can carry Thai content, so Thai text reaches the viewer, the admin editor canvas, and the UI chrome today. The theme system branches fonts only for RTL scripts (Arabic/Urdu); there is no path for LTR non-Latin scripts. (See origin: `docs/brainstorms/thai-font-support-requirements.md`.)

---

## Requirements

- R1. Sarabun loaded globally in both apps so the fallback works regardless of journey language or UI locale.
- R2. Sarabun loaded so its `unicode-range` subsetting is preserved — the Sarabun Thai `.woff2` downloads only when Thai (or other Sarabun-only) glyphs render; Basic-Latin-only pages download no Sarabun file.
- R3. Thai glyphs resolve to Sarabun while Latin glyphs continue resolving to Montserrat, per glyph.
- R4. Per-script fallback applies to all default-stack roles (header, body, label) across both apps.
- R5. Fallback applies to author-selected fonts (`journeyTheme.headerFont/bodyFont/labelFont`): Thai in a journey with an author-picked Latin font still resolves to Sarabun.
- R6. The player theme (`journeyUi`) applies the Thai fallback (it does not consume author `fontFamilies`, so this is wired in the player path explicitly).
- R7. The editor canvas preview (iframe-portal render path) loads Sarabun and applies the fallback.
- R8. No locale- or journey-language-conditional typography variant is introduced; per-glyph `unicode-range` is the sole mechanism.

**Origin actors:** A1 (journey visitor), A2 (journey author), A3 (Thai-locale UI user)
**Origin acceptance examples:** AE1 (covers R3, R8), AE2 (covers R1, R5), AE3 (covers R2), AE4 (covers R6, R7), AE5 (covers R1)

---

## Scope Boundaries

- No generalized script→font mapping for other non-Latin scripts (CJK, Devanagari, etc.); Sarabun only.
- No new Thai-specific options in the author font picker.
- No migration from Google Fonts `<link>` to `next/font`.
- No authoring/translation of Thai UI or content strings (i18n `th` strings already exist).
- No change to existing Arabic/Urdu RTL font behavior — those branches are left untouched.
- Sarabun does not lead any stack; English within a Thai surface stays Montserrat (the per-script decision, see origin Key Decisions).

---

## Context & Research

### Relevant Code and Patterns

- `libs/shared/ui/src/libs/themes/base/tokens/typography.ts` — `createFontFamilyString` (author-font stack builder, line 12), `baseTypography` top-level `fontFamily` (line 23) and per-variant `body1/body2/caption` fontFamily strings; `createCustomTypography` (applies author fonts). Arabic/Urdu variants live here and stay unchanged.
- `libs/shared/ui/src/libs/themes/journeyUi/tokens/typography.ts` — player LTR typography; `subtitle1/subtitle2/body2/caption` hardcode `'"Open Sans"'` with no fallback (lines 21–44).
- `libs/shared/ui/src/libs/themes/journeysAdmin/tokens/typography.ts` — admin chrome typography; explicit fontFamily strings on top-level, `subtitle3`, `body1`, `body2`, `overline2`, `caption`.
- `libs/shared/ui/src/libs/themes/base/theme.ts` / `journeyUi/theme.ts` — RTL/locale typography selection (`rtl ? (ur ? Urdu : Arabic) : LTR`). No change needed (R8) — Thai stays on the LTR branch.
- `libs/shared/ui/src/libs/themes/journeysAdmin/tokens/components.ts` — component-level font overrides on `MuiButton` root (~L17) and `MuiListItemText` primary (~L205) hardcode `'Montserrat', sans-serif`, applied above typography defaults. (`base/tokens/components.ts` L102 uses `createFontFamilyString` — already covered by U2.)
- `apps/journeys/pages/_document.tsx` — conditional Google Fonts links; LTR (`else`) branch loads Montserrat + Open Sans (lines 47–59). `getInitialProps` never populates `pageProps`, so `rtl` is always `false` and the `else` branch is effectively unconditional today.
- `apps/journeys/pages/home/[journeySlug].tsx` — standalone published-journey viewer; builds its **own** Google Fonts URL from a local `defaultFonts` array (~L38–59) and injects a `<link>` (~L74), independent of `_document` and `FramePortal`.
- `apps/journeys/src/components/Conductor/Conductor.tsx` — player: chrome via `journeyUi` `ThemeProvider` (L216, no `fontFamilies`); card content via nested `ThemeProvider` with `getStepTheme` (defaults `base`) + author `fontFamilies` (L256–262). Confirms content renders through the base theme.
- `apps/journeys-admin/pages/_document.tsx` — single Montserrat + Open Sans link (lines 22–25).
- `libs/journeys/ui/src/components/FramePortal/FramePortal.tsx` — `defaultFonts = ['Montserrat', 'Open Sans', 'El Messiri']` (line 35) drives the dynamic Google Fonts URL injected into the editor/player iframe.

### Institutional Learnings

- No relevant `docs/solutions/` entries for fonts/i18n/typography.

### External References

- Not gathered — `unicode-range` subsetting via the Google Fonts `css2` API is a well-established, decided mechanism (see origin Key Decisions / Dependencies).

---

## Key Technical Decisions

- **Append, never lead; order after Latin fonts.** Sarabun is placed after Montserrat/Open Sans in every stack. Because its `@font-face` is `unicode-range`-scoped to the Thai block, Latin glyphs resolve to Montserrat (Sarabun's Latin subset is never used, so never downloaded) and only Thai glyphs fall to Sarabun. This is what makes R2 and R3 hold simultaneously. Reversing the order would download Sarabun's Latin subset and change the English look — regression.
- **Shared constants over scattered literals.** Introduce a single `THAI_FALLBACK_FONT` constant (typography name) and a single Sarabun Google-Fonts family-query constant, imported by the typography tokens, both `_document.tsx` files, and `FramePortal`. Avoids drift across ~12 font strings and 3 load sites (DRY).
- **No theme branch (R8).** `base/theme.ts` and `journeyUi/theme.ts` selection logic is untouched; the fallback lives in the token strings themselves, so it applies on the LTR branch that Thai already uses.
- **Player content uses the base theme; `journeyUi` is chrome only.** In `Conductor.tsx`, journey _card content_ renders through a nested `ThemeProvider` using `getStepTheme` (defaults to `ThemeName.base`) with author `fontFamilies` — so R5 (author-font Thai fallback) is delivered by `createFontFamilyString` in the **base** theme, not by `journeyUi`. `journeyUi` styles only the player _chrome_ (header/footer/nav) and takes no `fontFamilies`. It still needs patching because its chrome strings must carry the fallback, and it inherits base's top-level `fontFamily` + `body1` via `...baseTypography.typography` spread — so base's top-level and `body1` edits are load-bearing for `journeyUi`, while its own `subtitle1/subtitle2/body2/caption` overrides need direct edits.
- **Thai metrics: accept shared line-heights, verify visually, adjust only on clipping.** Line-height stays a single shared value per role (no locale branch — preserves R8, and it's per-block so mixed lines can't be per-script anyway). Implementation includes a visual-QA pass rendering real stacked-tone-mark Thai (e.g. "ก้อนน้ำแข็ง") in each role across the surfaces; bump an individual line-height only where clipping/crowding is observed. Body roles (~1.5) are low-risk; tight headings (~1.25) are the ones to check. Mixed-script x-height/baseline balance and the `display=swap` FOUT reflow for Thai are accepted trade-offs (consistent with existing `display=swap` usage), noted in the QA pass rather than pre-engineered.
- **Sarabun weight list is a visual-matching decision, not incidental.** The Sarabun Google-Fonts query must request a superset of every numeric `fontWeight` used across the base/journeyUi/admin tokens (400, 500, 600, 700, 800) — omitting one makes the browser synthesize-bold Thai, compounding mismatch. Numeric-weight parity is necessary but not sufficient: Sarabun and Montserrat render different visual boldness at the same numeric weight, so bold Thai headings need a visual spot-check against their Montserrat counterparts.

---

## Open Questions

### Resolved During Planning

- Where does the fallback live so it applies without a locale branch? In the token font-family strings + `createFontFamilyString`, which the existing LTR selection path already uses.
- Do we touch the Arabic/Urdu variants? No — Thai never reaches the RTL branch; leaving them unchanged avoids regression.

### Deferred to Implementation

- Whether the shared constants module is a new file under `libs/shared/ui/src/libs/themes/` or an export added to an existing tokens file, and whether to extract a shared `DEFAULT_FONTS` for U5/U6 — implementer's call based on import ergonomics.
- Whether to keep the redundant `baseTypography.body2`/`caption` fallback edits (see U2 Approach) as defense-in-depth or drop them.

<!-- Resolved: Sarabun weight list — must be a superset of every fontWeight used (400,500,600,700,800). See Key Technical Decisions. -->
<!-- Resolved: apps/journeys _document — Sarabun added to the LTR else-branch, which is unconditional today (see U4 Approach). -->

<!-- Resolved: Thai vertical metrics — accept shared line-heights + visual-QA pass, adjust only on observed clipping. No locale branch (R8 preserved). See Key Technical Decisions. -->

- Which specific heading line-heights (if any) need bumping for Thai — determined empirically during the visual-QA pass, not pre-decided.

---

## Implementation Units

- U1. **Shared Sarabun constants**

**Goal:** Single source of truth for the Thai fallback font name and the Sarabun Google-Fonts family query, so typography tokens and all load sites reference one value.

**Requirements:** R1, R3 (supports)

**Dependencies:** None

**Files:**

- Create or extend: `libs/shared/ui/src/libs/themes/` (e.g. a small `fonts` constants module) exporting `THAI_FALLBACK_FONT` (e.g. `'"Sarabun"'`) and the Sarabun Google-Fonts family query fragment.

**Approach:**

- Export a typography-side constant (the quoted family name for font stacks) and a loader-side constant (the `family=Sarabun:wght@...` fragment). Re-export from the themes barrel so `_document.tsx` and `FramePortal` can import cleanly.

**Patterns to follow:**

- Existing named exports from `libs/shared/ui/src/libs/themes/index.ts`.

**Test scenarios:**

- Test expectation: none — pure constants, exercised via the units that consume them.

**Verification:**

- Constants importable from both apps and from `FramePortal`; typecheck passes.

---

- U2. **Thai fallback in base + player typography**

**Goal:** Thai glyphs resolve to Sarabun in the viewer content and player, including author-selected fonts.

**Requirements:** R3, R4, R5, R6, R8

**Dependencies:** U1

**Files:**

- Modify: `libs/shared/ui/src/libs/themes/base/tokens/typography.ts` — append `THAI_FALLBACK_FONT` (after Latin fonts, before `sans-serif`) in `createFontFamilyString`, in `baseTypography` top-level `fontFamily`, and in the `body1/body2/caption` fontFamily strings.
- Modify: `libs/shared/ui/src/libs/themes/journeyUi/tokens/typography.ts` — append the fallback to the `subtitle1/subtitle2/body2/caption` strings that currently hardcode `'"Open Sans"'`.
- Test: `libs/shared/ui/src/libs/themes/base/tokens/typography.spec.ts` (new)

**Approach:**

- Leave Arabic/Urdu token variants untouched. `createCustomTypography` overrides per-variant fontFamily via `createFontFamilyString`, so fixing that helper covers author + default header/body/label roles; the top-level `fontFamily` covers variants that inherit it.
- Load-bearing edits: `createFontFamilyString`, `baseTypography` top-level `fontFamily`, and `baseTypography.body1` (the last reaches `journeyUi.body1` via the `...baseTypography.typography` spread). Note: `baseTypography.body2`/`caption` static strings are overridden by `createCustomTypography` in the base theme and overridden again by `journeyUi`'s own `body2`/`caption` — appending the fallback there is harmless but redundant; keep it only for defense-in-depth if a future refactor drops those overrides.

**Patterns to follow:**

- Existing `createFontFamilyString` structure and the inline fontFamily strings already present in these tokens.

**Test scenarios:**

- Happy path: `createFontFamilyString('Custom')` returns a stack containing `"Custom"`, then `Montserrat`, `"Open Sans"`, then `THAI_FALLBACK_FONT`, then `sans-serif`, in that order.
- Happy path: `createFontFamilyString('')` returns `Montserrat,"Open Sans",<Sarabun>,sans-serif` (no empty leading entry).
- Edge case: `THAI_FALLBACK_FONT` appears after `"Open Sans"` and before `sans-serif` in `baseTypography` top-level `fontFamily` and in `body1/body2/caption`.
- Covers AE1, AE2. Edge case: `journeyUi` `subtitle1/subtitle2/body2/caption` fontFamily strings include the Thai fallback after `"Open Sans"`.

**Verification:**

- Every base and player token font stack ends with `...,<Sarabun>,sans-serif` (or `...,<Sarabun>` where no `sans-serif` was present); Arabic/Urdu variants unchanged.
- Visual QA: render stacked-tone-mark Thai (e.g. "ก้อนน้ำแข็ง") in heading and body roles; confirm no tone-mark clipping/crowding. Bump an individual role's line-height only if clipping is observed.

---

- U3. **Thai fallback in admin typography and component overrides**

**Goal:** Thai UI chrome (menus, buttons, labels) in the `th` locale renders in Sarabun — including components whose font stack is set at the components layer, not typography.

**Requirements:** R1, R3, R4

**Dependencies:** U1

**Files:**

- Modify: `libs/shared/ui/src/libs/themes/journeysAdmin/tokens/typography.ts` — append the Thai fallback (after Latin fonts, before `sans-serif`) to the top-level `fontFamily` and the `subtitle3/body1/body2/overline2/caption` fontFamily strings.
- Modify: `libs/shared/ui/src/libs/themes/journeysAdmin/tokens/components.ts` — append the Thai fallback to the hardcoded `'Montserrat', sans-serif` stacks on `MuiButton` root (~L17) and `MuiListItemText` primary (~L205). These are applied at higher specificity than typography variant defaults, so typography-only edits do not reach them.
- Test: `libs/shared/ui/src/libs/themes/journeysAdmin/tokens/typography.spec.ts` (new)

**Approach:**

- Mirror U2 ordering. Variants without an explicit fontFamily inherit the top-level stack, so both the top-level and the explicit strings need the fallback.
- Component-level font stacks bypass typography entirely — MUI applies `components` overrides above variant defaults. Buttons and list/menu items are exactly the admin chrome R3/R4 name, so their hardcoded stacks must carry the fallback too. (`base/tokens/components.ts` uses `createFontFamilyString` and is already covered by U2.)
- Bounded residual sweep: grep the admin app for inline `fontFamily:` literals (known: `apps/journeys-admin/src/components/LabelChip/LabelChip.tsx:41`, `CollectionDialog.tsx:68`) and append the fallback where a stack ends in a bare `sans-serif` without it.

**Patterns to follow:**

- U2; existing admin token and component-override strings.

**Test scenarios:**

- Covers AE5. Edge case: admin top-level `fontFamily` and each explicit-fontFamily variant include the Thai fallback after `"Open Sans"`/Latin fonts and before `sans-serif`.
- Edge case: `MuiButton` and `MuiListItemText` component-override font stacks include the Thai fallback before the terminal `sans-serif`.

**Verification:**

- All admin token AND theme-level component-override font stacks carry the Thai fallback in the correct position; no theme-level stack ends in a bare `sans-serif` without it.

---

- U4. **Load Sarabun stylesheet in both apps**

**Goal:** The Sarabun stylesheet is present on every page so the fallback is available (with lazy Thai `.woff2`).

**Requirements:** R1, R2

**Dependencies:** U1

**Files:**

- Modify: `apps/journeys/pages/_document.tsx` — add the Sarabun family query to the LTR (`else`) branch links (both `rel="stylesheet"` and `rel="preload"`).
- Modify: `apps/journeys-admin/pages/_document.tsx` — add the Sarabun family query to the single Montserrat/Open Sans link.

**Approach:**

- Append `&family=Sarabun:wght@...` to the existing `css2` URLs using the U1 loader constant, preserving `display=swap`. Google returns per-subset `@font-face` with `unicode-range`, so the Thai `.woff2` stays deferred until Thai is painted.
- In `apps/journeys/pages/_document.tsx`, add Sarabun to the LTR (`else`) branch. Note the current reality: `getInitialProps` never populates `pageProps`, so `getJourneyRTL(undefined)` yields `rtl = false` and the `else` branch renders **unconditionally** for every journey today — so the Sarabun link is always present (satisfies R1). This means the plan's correctness does not depend on branch selection. **Caveat:** if `pageProps` is ever wired up so RTL journeys correctly hit the RTL branch, U4's change must also add Sarabun to the RTL branch to keep R1 for Thai embedded in RTL-locale content.

**Patterns to follow:**

- Existing `css2?family=...&display=swap` link composition in both files.

**Test scenarios:**

- Test expectation: none (SSR `<link>` markup) — covered by AE3 in end-to-end verification below rather than a unit test.

**Verification:**

- Covers AE3. In the running apps: a **Basic-Latin-only** page loads the Sarabun stylesheet but downloads no Sarabun `.woff2` (Network tab); a page with Thai text downloads the Sarabun Thai subset and renders Thai in Sarabun with Latin still in Montserrat.

---

- U5. **Load Sarabun in the editor/player iframe**

**Goal:** Authored Thai text renders in Sarabun in the admin editor canvas preview and the iframe-portal player.

**Requirements:** R2, R6, R7

**Dependencies:** U1

**Files:**

- Modify: `libs/journeys/ui/src/components/FramePortal/FramePortal.tsx` — add Sarabun to `defaultFonts` so the injected Google Fonts URL always includes it.
- Test: `libs/journeys/ui/src/components/FramePortal/FramePortal.spec.tsx` (extend)

**Approach:**

- Add `'Sarabun'` to the `defaultFonts` array; existing `getSortedValidFonts`/`formatFontName`/URL builder handle the rest. The fallback is applied by the theme (U2) inside the iframe; this unit only guarantees the font is loaded.

**Patterns to follow:**

- Existing `defaultFonts` merge and URL construction in `FramePortal.tsx`; existing assertions in `FramePortal.spec.tsx`.

**Test scenarios:**

- Covers AE4. Happy path: the injected Google Fonts `<link>` href includes `family=Sarabun` even when no author `fontFamilies` are supplied.
- Edge case: with author `fontFamilies` provided, the href includes both the author fonts and Sarabun, de-duplicated and sorted as today.

**Verification:**

- Editor canvas preview renders authored Thai text in Sarabun; injected iframe href contains Sarabun.

---

- U6. **Load Sarabun on the standalone journey page**

**Goal:** The published standalone journey viewer loads Sarabun so Thai journey content renders correctly on the primary viewer surface.

**Requirements:** R1, R2

**Dependencies:** U1

**Files:**

- Modify: `apps/journeys/pages/home/[journeySlug].tsx` — this page builds its **own** Google Fonts URL from a local `defaultFonts = ['Montserrat', 'Open Sans', 'El Messiri']` array (~L38–59) and injects a `<link>` (~L74), independent of both `_document.tsx` (U4) and `FramePortal` (U5). Add Sarabun via the U1 constant.
- Test: co-located spec if one exists; otherwise verify in the running app.

**Approach:**

- This is the third and final Google Fonts load site (confirmed: `grep -rln defaultFonts` returns `FramePortal.tsx`, this page, and the typography token file). Without it, Thai content on a published journey downloads no Sarabun and tofus — the exact AE1/AE2 surface.
- The `defaultFonts` array here duplicates `FramePortal`'s. Prefer extracting a shared `DEFAULT_FONTS` (including Sarabun) into the U1 module and consuming it in both `FramePortal` (U5) and this page, so Sarabun is added once — consistent with U1's DRY rationale. If extraction is disproportionate, add Sarabun to this local array directly.

**Patterns to follow:**

- `FramePortal.tsx` font-URL builder (`getSortedValidFonts`, `formatFontName`); U5.

**Test scenarios:**

- Covers AE1, AE2. Happy path: the page's injected Google Fonts href includes `family=Sarabun`.

**Verification:**

- A published journey containing Thai renders Thai in Sarabun on the standalone `[journeySlug]` page; injected href contains Sarabun.

---

## System-Wide Impact

- **Interaction graph:** Touches shared theme typography tokens (`base`, `journeyUi`, `journeysAdmin`) and the admin `components` overrides, consumed via `ThemeProvider`, plus **three** Google Fonts load sites — the two `_document.tsx` loaders (U4), the `FramePortal` iframe injector (U5), and the standalone `home/[journeySlug].tsx` builder (U6). No theme selection-logic change.
- **API surface parity:** `apps/journeys` viewer (both the `_document` shell and the standalone journey page), `apps/journeys-admin` editor + chrome (typography + component overrides), and the iframe-portal player must all carry the fallback — covered by U2–U6.
- **Unchanged invariants:** Arabic/Urdu typography variants and the RTL/locale theme-selection branches are explicitly unchanged; English-only rendering is byte-for-byte the same font stack lead (Montserrat), so existing English journeys are visually unaffected.
- **State lifecycle risks:** None — static token strings and stylesheet links; no runtime state.

---

## Risks & Dependencies

| Risk                                                                                                                                                               | Mitigation                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sarabun placed before Latin fonts → English renders in Sarabun and Latin subset downloads (regression, breaks R2/R3).                                              | Ordering is a stated decision and a test scenario in U2/U3 asserts position (after `"Open Sans"`, before `sans-serif`).                                                   |
| Font stacks set at the **components** layer (admin `MuiButton`/`MuiListItemText`) or inline in app code bypass the typography tokens → Thai tofu in buttons/menus. | U3 patches `journeysAdmin/tokens/components.ts` and runs a bounded inline-literal sweep; verification asserts no theme-level stack ends in a bare `sans-serif`.           |
| A third Google Fonts load site (`home/[journeySlug].tsx`) builds its own font URL → Thai tofu on the published viewer.                                             | U6 adds Sarabun to that builder; `grep defaultFonts` confirmed exactly three load sites.                                                                                  |
| Player _content_ fallback missed by focusing on `journeyUi`.                                                                                                       | Corrected model: content renders via the **base** theme (`createCustomTypography`), covered by U2's `createFontFamilyString` edit; `journeyUi` chrome patched separately. |
| Google Fonts `css2` stops serving `unicode-range` subsets (assumption in origin).                                                                                  | Standard, long-stable behavior; U4 verification confirms lazy Thai-subset loading in the running app.                                                                     |
| A typography variant inherits the top-level stack and is missed.                                                                                                   | U2/U3 update both the top-level `fontFamily` and every explicit per-variant string; base `body1` (inherited by `journeyUi` via spread) is explicitly load-bearing.        |
| Latent `_document` bug (unpopulated `pageProps`) later fixed → RTL branch activates without Sarabun.                                                               | U4 Approach documents the caveat: wiring `pageProps` requires adding Sarabun to the RTL branch too.                                                                       |

---

## Sources & References

- **Origin document:** [docs/brainstorms/thai-font-support-requirements.md](docs/brainstorms/thai-font-support-requirements.md)
- Related code: `libs/shared/ui/src/libs/themes/`, `apps/journeys/pages/_document.tsx`, `apps/journeys-admin/pages/_document.tsx`, `libs/journeys/ui/src/components/FramePortal/FramePortal.tsx`

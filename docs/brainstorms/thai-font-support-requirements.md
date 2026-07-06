---
date: 2026-07-06
topic: thai-font-support
---

# Thai Font Support for journeys & journeys-admin

## Summary

Add Sarabun as a universal, `unicode-range`-scoped Thai fallback across `apps/journeys` and `apps/journeys-admin`, so Thai glyphs render in Sarabun everywhere they appear — viewer content, the admin editor canvas, and the UI chrome — while Latin text stays Montserrat. Per-glyph font selection means no locale detection or theme branching is required.

---

## Problem Frame

Both apps load a Latin-only type system (Montserrat + Open Sans) via Google Fonts `<link>` tags. These families have no Thai glyphs, so any Thai character falls through to whatever system font the browser happens to pick. The result reads as visually broken next to the polished English experience — inconsistent weight, mismatched metrics, and no relationship to the surrounding Latin type.

Thai (`th`) is already a supported i18n locale in both apps, and journeys can carry a Thai `language.bcp47` and Thai-authored content, so Thai text reaches all three surfaces today. The theme system already branches fonts for RTL scripts (Arabic → `El Messiri`/`Tajawal`, Urdu → `Arial`) but has no path for LTR non-Latin scripts like Thai. Thai users see degraded rendering in the viewer, in the editor while authoring, and in the app UI whenever the interface is shown in Thai.

---

## Actors

- A1. Journey visitor: views a published journey in the viewer app; may see Thai content, mixed Thai/English content, or all-English content.
- A2. Journey author: builds a journey in the admin editor, previewing Thai (or mixed) content on the canvas as they type.
- A3. Thai-locale UI user: uses journeys-admin or the viewer with the interface set to the Thai (`th`) locale.

---

## Requirements

**Font availability**
- R1. Sarabun must be loaded via the Google Fonts `<link>` on every page of both apps (a global link), so the fallback works for any Thai text regardless of the journey's language or the UI locale.
- R2. Sarabun must be loaded such that its `unicode-range` (Thai block) subsetting is preserved, so the Thai `.woff2` downloads only when Thai characters are actually rendered — English-only pages must not download the Thai font file.

**Font application (per-script)**
- R3. Sarabun must be appended to the application-default type stack so that Thai glyphs resolve to Sarabun while Latin glyphs continue to resolve to Montserrat, per glyph.
- R4. The per-script fallback must apply to all typography roles that carry the default stack — header, body, and label — across both apps.
- R5. The fallback must also apply to author-selected fonts (`journeyTheme.headerFont`/`bodyFont`/`labelFont`): when an author picks a Latin font for a journey, Thai characters within that journey must still resolve to Sarabun rather than a system fallback.
- R6. The journey player theme (`journeyUi`) must apply the Thai fallback. It currently does not consume author `fontFamilies`, so the fallback must be wired into the player path explicitly, not only into the `base` theme.
- R7. The editor canvas preview (the iframe-portal render path used by the admin editor) must load Sarabun and apply the same fallback, so authored Thai text renders correctly while building a journey.

**No locale branching**
- R8. Thai support must not introduce a locale- or journey-language-conditional typography variant (unlike the existing Arabic/Urdu branches). Per-glyph `unicode-range` selection is the sole mechanism; the same font stack is used regardless of locale.

---

## Acceptance Examples

- AE1. **Covers R3, R8.** Given a journey card containing "สวัสดี Welcome", when it renders in the viewer, then the Thai characters display in Sarabun and the Latin characters display in Montserrat within the same line, with no system-fallback tofu.
- AE2. **Covers R1, R5.** Given a journey whose `language.bcp47` is English and whose author selected a Latin body font, when a visitor views a card that contains a Thai phrase, then the Thai phrase renders in Sarabun.
- AE3. **Covers R2.** Given an all-English, all-Latin journey, when a visitor loads it, then no Sarabun font file (`.woff2`) is downloaded (only the shared Google Fonts stylesheet, if not already cached).
- AE4. **Covers R6, R7.** Given an author typing Thai text into a card in the admin editor, when the canvas preview updates, then the Thai text renders in Sarabun in the preview.
- AE5. **Covers R1.** Given the journeys-admin UI set to the Thai (`th`) locale, when any Thai chrome string renders (menus, buttons, labels), then it displays in Sarabun.

---

## Success Criteria

- Thai text on all three surfaces (viewer content, editor canvas, UI chrome) is legible and visually coherent with the surrounding design — no boxes, no arbitrary system fallback.
- English-only journeys are visually unchanged and incur no additional font download; the Thai `.woff2` loads only when Thai characters are present.
- A downstream implementer can identify every insertion point (both `_document.tsx` files, the base typography fallback and `createFontFamilyString`, the `journeyUi` player theme, and the editor/player dynamic font injection) without needing to reverse-engineer product intent.

---

## Scope Boundaries

- Not building a generalized script→font mapping framework for other non-Latin scripts (CJK, Devanagari, etc.); this ships Sarabun only.
- Not adding Thai-specific options to the author-facing font picker; authors keep the existing picker, and Thai fallback applies underneath whatever they choose.
- Not migrating font loading from Google Fonts `<link>` tags to `next/font`.
- Not authoring or translating Thai UI strings or journey content; the i18n `th` locale strings already exist.
- Not changing the existing Arabic/Urdu RTL font behavior.
- Not promoting Sarabun to lead the stack on Thai surfaces (English within a Thai surface stays Montserrat — the per-script decision).

---

## Key Decisions

- Typeface is Sarabun: reads as native and professional to Thai readers; the Thai government's official document font.
- Universal fallback over locale branching: because `unicode-range` selects fonts per glyph, a single global stack (`Montserrat, Sarabun, sans-serif`) renders Thai in Sarabun and Latin in Montserrat automatically. This makes the Arabic-style locale-conditional typography variant redundant for Thai — less code, and it also covers mixed content and author-picked Latin fonts for free.
- Global `<link>` over conditional loading: the stylesheet is included on every page so the fallback is truly universal (Thai text in a non-Thai journey still renders). Cost is near-zero because `unicode-range` subsetting keeps the Thai `.woff2` from downloading until Thai characters are painted.
- Per-script rendering (Thai→Sarabun, English→Montserrat) over unified Sarabun: keeps the established English look unchanged and puts each script in a font designed for it; the least-visual-change option.

---

## Dependencies / Assumptions

- Assumes Google Fonts serves Sarabun with per-subset `unicode-range` `@font-face` rules (its standard behavior for the `css2` API), which is what enables lazy Thai-file loading.
- Assumes Sarabun's Latin glyph coverage is not relied upon, since Latin continues to resolve to Montserrat under the per-script decision.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R1, R2][Technical] Exact `<link>` composition — whether Sarabun is added to the existing conditional Google Fonts link blocks or a single unconditional link, in each `_document.tsx`.
- [Affects R6, R7][Technical] How the player/editor dynamic font injection (the iframe-portal font list) should include Sarabun and whether the fallback belongs in the injected stylesheet, the theme stack, or both.
- [Affects R2][Needs research] Confirm in the running app that an all-English journey downloads no Sarabun `.woff2` (verify the `unicode-range` gating behaves as expected end-to-end).

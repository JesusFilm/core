---
title: "fix: Hausa language should render LTR, not RTL"
type: fix
status: active
date: 2026-04-27
origin: https://linear.app/jesus-film-project/issue/QA-361/nextsteps-hausa-language-is-left-to-right-not-right-to-left
---

# fix: Hausa language should render LTR, not RTL

## Overview

QA-361 reports that journeys in Hausa render right-to-left, but Hausa should render left-to-right. The reporter's clarifying comment confirms the intent: change the journey language preset for Hausa from RTL to LTR.

Hausa is written predominantly in the Boko (Latin) script, which is LTR. The legacy Ajami (Arabic) script form is RTL but is not what NextSteps journeys use. Treating `'ha'` as RTL was incorrect.

---

## Problem Frame

`getLocaleRTL` in `libs/shared/ui/src/libs/rtl/rtl.ts` returns `true` for `'ha'` (Hausa), causing every Hausa journey to render in RTL layout. Stakeholders confirmed this is wrong — Hausa journeys must render LTR.

---

## Requirements Trace

- R1. `getLocaleRTL('ha')` returns `false`
- R2. All other RTL locales (Arabic, Aramaic, Dhivehi, Persian, Hebrew, Khowar, Kashmiri, Kurdish, Pashto, Urdu, Yiddish) continue to return `true`
- R3. A Hausa journey rendering in the journeys app uses LTR layout (no regression of `getJourneyRTL`)

---

## Scope Boundaries

- No changes to which other locales are classified RTL
- No DB migration, no language metadata changes in `libs/prisma/languages`
- No UI copy changes
- No support for Hausa-Ajami (RTL form). If that becomes a requirement, it would need a different signal than the bcp47 base subtag

---

## Context & Research

### Relevant Code and Patterns

- `libs/shared/ui/src/libs/rtl/rtl.ts` — single source of truth for locale RTL classification (switch on bcp47 base subtag)
- `libs/shared/ui/src/libs/rtl/rtl.spec.tsx` — covers RTL and LTR cases for this function
- `libs/journeys/ui/src/libs/rtl/rtl.ts` — `getJourneyRTL` wraps `getLocaleRTL` with the journey's `language.bcp47`. No code change needed here; behavior follows automatically once `getLocaleRTL('ha')` flips to `false`
- `libs/journeys/ui/src/components/StepFooter/HostTitleLocation/HostTitleLocation.spec.tsx` — uses Arabic (`bcp47: 'ar'`) as the RTL fixture, so unaffected by this change

### Institutional Learnings

- None matched in `docs/solutions/`

### External References

- [Hausa language — Wikipedia](https://en.wikipedia.org/wiki/Hausa_language) — modern Hausa is written in Boko (Latin) script, LTR. Ajami (Arabic) script is historical and minority

---

## Key Technical Decisions

- **Fix at the source-of-truth function** (`getLocaleRTL`) rather than at any caller. Every consumer (`getJourneyRTL`, etc.) flows through this switch, so a one-line removal fixes all surfaces consistently.
- **Drop `'ha'` entirely** rather than guarding on script subtag. We have no signal in the codebase that distinguishes Hausa-Latin from Hausa-Arabic, and the product only uses Hausa-Latin.

---

## Open Questions

### Resolved During Planning

- *Should we keep the case and return `false` explicitly?* — No. The `default` branch already returns `false`; removing the case keeps the switch tidy and consistent with how other LTR locales are handled.

### Deferred to Implementation

- None.

---

## Implementation Units

- [ ] U1. **Remove Hausa from the RTL locale list**

**Goal:** Make `getLocaleRTL('ha')` return `false` so Hausa journeys render LTR.

**Requirements:** R1, R2, R3

**Dependencies:** None

**Files:**
- Modify: `libs/shared/ui/src/libs/rtl/rtl.ts`
- Modify: `libs/shared/ui/src/libs/rtl/rtl.spec.tsx`

**Approach:**
- Delete the `case 'ha':` line from the switch in `getLocaleRTL`
- In the spec, move the `'ha'` assertion from the RTL block to the LTR (default-false) block, asserting `toBe(false)`

**Patterns to follow:**
- Existing structure of `getLocaleRTL` and its spec — keep the alphabetical grouping and matching test coverage style

**Test scenarios:**
- Happy path: `getLocaleRTL('ha')` returns `false`
- Happy path: `getLocaleRTL('HA')` returns `false` (case-insensitivity preserved)
- Happy path: `getLocaleRTL('ha-Latn')` returns `false` (subtag stripping preserved)
- Edge case: every other RTL locale in the existing spec (`ar`, `arc`, `dv`, `fa`, `he`, `khw`, `ks`, `ku`, `ps`, `ur`, `yi`) still returns `true`

**Verification:**
- `npx jest --config libs/shared/ui/jest.config.ts --no-coverage 'libs/shared/ui/src/libs/rtl/rtl.spec.tsx'` passes
- `npx jest --config libs/journeys/ui/jest.config.ts --no-coverage 'libs/journeys/ui/src/libs/rtl/rtl.spec.tsx'` still passes (downstream wrapper unaffected)

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| A consumer somewhere relies on Hausa being RTL | Grep showed `getLocaleRTL` / `getJourneyRTL` are the only RTL gatekeepers; flipping the source of truth is the correct lever |
| Hausa-Ajami users (RTL script) get wrong layout | Out of scope — current product uses Hausa-Latin only. Documented in Scope Boundaries |

---

## Sources & References

- **Origin issue:** [QA-361 — NextSteps Hausa language is left to right not right to left](https://linear.app/jesus-film-project/issue/QA-361/nextsteps-hausa-language-is-left-to-right-not-right-to-left)
- Related code: `libs/shared/ui/src/libs/rtl/rtl.ts`, `libs/journeys/ui/src/libs/rtl/rtl.ts`

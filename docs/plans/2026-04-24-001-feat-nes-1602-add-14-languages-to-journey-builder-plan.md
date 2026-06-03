---
title: 'feat(journeys): add new translation target languages (NES-1602)'
type: feat
status: active
date: 2026-04-24
linear: NES-1602
---

# Add new translation target languages (NES-1602)

## Overview

Add languages to the journey builder's translation target allowlist so Core Teams can translate journeys into them. Languages were requested by Lucinda Mason for the World Cup journeys. Lucinda confirmed these are **translation target languages** (journey content), not admin UI locales.

Lucinda's full list contained 14 languages. After validating each against Gemini's supported-languages list and empirical live testing of variant rows, the final scope is **11 shipping + 3 deferred**.

## Final Scope

### Shipping (11)

| #   | Language        | DB ID   | Notes                                                                    |
| --- | --------------- | ------- | ------------------------------------------------------------------------ |
| 1   | Amharic         | `4791`  | —                                                                        |
| 2   | Hausa           | `1341`  | —                                                                        |
| 3   | Kazakh          | `371`   | —                                                                        |
| 4   | Mongolian       | `18259` | Halh (Khalkha) variant — official Mongolian                              |
| 5   | Sinhala         | `13172` | —                                                                        |
| 6   | Tagalog         | `12551` | —                                                                        |
| 7   | Tajik           | `24309` | —                                                                        |
| 8   | Tamil           | `5871`  | —                                                                        |
| 9   | Urdu (Pakistan) | `407`   | Default Urdu = Pakistani Urdu (Indian variant `22563` is a separate row) |
| 10  | Uzbek           | `3888`  | Northern Uzbek (Uzbekistan official)                                     |
| 11  | Yoruba          | `1308`  | —                                                                        |

### Deferred (3)

| #   | Language              | DB ID    | Reason                                                                                                                                                                                                                                                                                                                           |
| --- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12  | Bangla                | `176243` | Unclear whether Gemini distinguishes Bangla from Indian Bengali. Google's docs list a single `bn` entry with no Bangladeshi/Indian variant split. Empirical output comparison still pending.                                                                                                                                     |
| 13  | Portuguese (Portugal) | `21064`  | **Empirically confirmed broken.** Live testing showed both `21064` (Portugal) and `584` (Brazil) produce identical `targetLanguageName: 'Português'` Gemini prompts because the frontend's `nativeName ?? localName` resolution collapses both rows' identical primary names. Output is Brazilian regardless of which is picked. |
| 14  | Fula                  | `5048`   | Not on Gemini's supported-languages list at all. No `ff` / `fuc` / `fuf` / etc. entry. Translation would fail or hallucinate.                                                                                                                                                                                                    |

### Decision rationale

The principle: **only ship languages where Gemini both supports the language AND can honor the variant Lucinda requested**. Adding rows that surface to users as a UI option but don't deliver the promised variant is a worse UX than not offering them at all.

**Empirical evidence (Portuguese):** captured live via temporary debug logs added to `LanguageScreen.tsx`, `TranslateJourneyDialog.tsx`, `journeyAiTranslate.ts`, and `translateCustomizationFields.ts`. Both Portugal and Brazil runs produced byte-identical `targetLanguageName: 'Português'` prompts to Gemini. Logs were removed before the final commit.

**Tracker references (followups):**

- `[NES-XXXX]` — Disambiguate dialect variants in AI translation prompts. Investigates whether to swap to `localName`, concatenate, use `bcp47`, or add explicit prompt context. Includes Bangla and Portuguese (Portugal) as the test cases.
- `[NES-YYYY]` — Empty `sourceLanguageName` in AI translation prompts for English-source journeys. The frontend's `find(({primary}) => !primary)?.value ?? ''` returns empty string for languages with only a primary entry (e.g. English `529`). Affects all 4 translation surfaces.

## Problem Statement

Core Teams building journeys for the World Cup cannot select these 14 languages in the journey builder's language picker. The picker is filtered server-side by `SUPPORTED_LANGUAGE_IDS`, a hardcoded allowlist in the frontend. Languages exist in the `prisma-languages` database already; the blocker is purely the allowlist.

## Proposed Solution

Extend the `SUPPORTED_LANGUAGE_IDS` array at `libs/journeys/ui/src/libs/useJourneyAiTranslateSubscription/supportedLanguages.ts` with 14 new entries — one per language — following the exact pattern set by prior single-language additions (Malay #8971, Myanmar #8413, Nepali #8398).

### Why this is sufficient (no schema/API changes)

- All four call sites (`LanguageScreen`, `TranslateJourneyDialog`, `CopyToTeamDialog`, `CreateJourneyButton`) read from this same constant and spread it into the `useLanguagesQuery` GraphQL `ids` filter. Adding to the array automatically propagates to every picker.
- Specs (4 `.spec.tsx` files) mock the GraphQL response using `[...SUPPORTED_LANGUAGE_IDS]` spread, so new IDs are included in mocks without manual test edits.
- Languages already exist in the `prisma-languages` Postgres DB with `id`, `bcp47`, `iso3`, `slug`, plus translated names via `LanguageName`. No DB migration or data import required.
- AI translation support (`api-journeys-modern` subscription) is driven by the same allowlist — the AI model handles any language in the DB; the allowlist is purely an editorial "show this to editors" filter.

### Approach for sourcing the 14 language IDs

The critical step is mapping each requested language to its correct numeric `id` in the `prisma-languages` DB, disambiguating variants (Portugal vs. Brazil Portuguese; Bangladeshi Bangla vs. Indian Bengali; Pakistani Urdu).

**Lookup strategy (in priority order):**

1. **Query the deployed GraphQL gateway** for each language using the `languages` query with `term` and/or `bcp47` filter. Example BCP-47 targets:
   - Amharic: `am`
   - Bangla (Bangladesh): `bn-BD` or native-name match "বাংলা" with iso3 `ben` but distinct from id `139081` (Indian Bengali)
   - Fula: `ff`
   - Hausa: `ha`
   - Kazakh: `kk`
   - Mongolian: `mn`
   - Portuguese (Portugal): `pt-PT`, iso3 `por`
   - Sinhala: `si`
   - Tagalog: `tl` (or Filipino `fil` — prefer `tl` since the user said "Tagalog")
   - Tajik: `tg`
   - Tamil: `ta`
   - Urdu (Pakistan): `ur-PK` or `ur` with country disambiguation
   - Uzbek: `uz`
   - Yoruba: `yo`

2. If a language has multiple dialect rows (e.g., Fula has Adamawa/Pulaar/etc.), pick the **macro-language** row (the one whose name most closely matches the plain requested name, or the one with `hasVideos: true` if the editorial bias is toward ones with existing content). Document the choice in the commit.

3. Cross-check by pulling the chosen row's native name and English name to verify it matches the request.

**If any language cannot be found** — stop and surface the gap. Do not invent an ID. Coordinate with Mike Allison (data/backend) on whether the row needs adding to the languages DB (separate ticket — out of scope for this plan).

### File to modify

Only one source file:

`libs/journeys/ui/src/libs/useJourneyAiTranslateSubscription/supportedLanguages.ts`

Append each new entry under the `// supported by AI model:` section, each on its own line, in the format `'<id>', // <Native name>, <English name>` (matching surrounding style).

## Technical Considerations

- **No schema changes.** No GraphQL codegen required.
- **No database changes.** Languages are already seeded.
- **Spec impact: nil.** All specs reference `[...SUPPORTED_LANGUAGE_IDS]` and will pick up new IDs automatically.
- **i18n strings: nil.** Admin UI translation is a separate system (Crowdin + `LOCALE_LANGUAGES` map in middleware) and is unaffected.

## System-Wide Impact

- **Interaction graph:** `SUPPORTED_LANGUAGE_IDS` → `useLanguagesQuery({ where: { ids } })` → 4 UI surfaces: journey duplication (`CopyToTeamDialog`), AI translate dialog (`TranslateJourneyDialog`), template customization first step (`LanguageScreen`), and "Create journey from template" (`CreateJourneyButton`). All four update in lockstep.
- **Error propagation:** None — adding array entries cannot produce errors. The `languages` GraphQL resolver silently ignores IDs that don't exist in the DB, so a typo surfaces as a missing picker entry, not an exception.
- **State lifecycle risks:** None — this is a read-only allowlist.
- **API surface parity:** All four call sites import from the same constant. No risk of drift.
- **Integration test scenarios:** QA should verify each of the 14 languages appears in the LanguageScreen picker and the TranslateJourneyDialog picker on desktop and mobile.

## Acceptance Criteria

- [x] Worktree created at `.claude/worktrees/nes-1602-languages` with branch `jianweichong/nes-1602-add-support-for-14-new-languages-in-journey-builder`
- [x] Each requested language mapped to a verified `id` from the languages DB (not guessed) — all 14 IDs resolved against the live api-gateway
- [x] For variant-sensitive languages (Bangla, Portuguese, Urdu), variant correctness empirically validated — Portuguese & Bangla confirmed dialect ambiguity at the prompt layer, Urdu's Pakistani-as-default confirmed acceptable
- [x] Comments next to each new entry include the English name, matching surrounding style
- [x] `nx run journeys-ui:test` passes (no spec changes expected)
- [x] Consumer Jest suites pass (`LanguageScreen`, `TranslateJourneyDialog`, `CopyToTeamMenuItem`, `CreateJourneyButton`, `useJourneyAiTranslateSubscription`) — 75/75 tests
- [x] ESLint + Prettier clean on the changed file
- [x] PR created, assigned to me, reviewer requested (Mike Allison)
- [ ] Lucinda informed of final scope (11 shipping, 3 deferred) and rationale
- [ ] Followup ticket filed for prompt-disambiguation investigation (Bangla + Portuguese path)
- [ ] Followup ticket filed for empty `sourceLanguageName` bug
- [ ] QA requirements posted on NES-1602 per `.claude/rules/writing-qa-requirements.dev.md`

## Risks & Mitigations

| Risk                                                                                                      | Likelihood                                       | Mitigation                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A requested language row doesn't exist in the languages DB                                                | Low-Medium (Fula and Tajik are the highest-risk) | Surface gap immediately; coordinate with Mike before proceeding. Do not ship the PR partial.                                                                     |
| Picking the wrong variant (Bangla vs. Bengali, Portugal vs. Brazil Portuguese, Pakistan Urdu vs. generic) | Medium                                           | Verify each variant-sensitive pick against BCP-47 and native name **before** committing. Document choice in PR description.                                      |
| AI translation model produces poor-quality output for rarer languages (e.g. Fula dialects)                | Medium                                           | Out of scope for this ticket — editorial decision to expose is Lucinda's. Note in PR description that translation quality for less-resourced languages may vary. |
| Tagalog vs. Filipino confusion — `fil` is the ISO macro-code and `tl` is the individual language          | Low                                              | User said "Tagalog". Prefer `tl` / `tgl` row; if only `fil` exists in DB, use that and note in PR.                                                               |

## Implementation Steps (for ce:work)

1. Create worktree:
   ```bash
   git worktree add /workspaces/core/.claude/worktrees/nes-1602-languages -b jianweichong/nes-1602-add-support-for-14-new-languages-in-journey-builder origin/main
   ```
2. `cd` into the worktree for all subsequent work.
3. Look up the 14 language IDs via the deployed `languages` GraphQL query (see strategy above). Record the mapping with bcp47 + native name for each.
4. Edit `libs/journeys/ui/src/libs/useJourneyAiTranslateSubscription/supportedLanguages.ts` — append 14 entries under the `// supported by AI model:` section, one per language, preserving surrounding comment style.
5. Run targeted tests:
   ```bash
   npx jest --config libs/journeys/ui/jest.config.ts --no-coverage libs/journeys/ui/src/libs/useJourneyAiTranslateSubscription
   npx jest --config apps/journeys-admin/jest.config.ts --no-coverage 'apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/LanguageScreen'
   npx jest --config apps/journeys-admin/jest.config.ts --no-coverage 'apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/TranslateJourneyDialog'
   npx jest --config apps/journeys-admin/jest.config.ts --no-coverage 'apps/journeys-admin/src/components/Team/CopyToTeamMenuItem'
   npx jest --config libs/journeys/ui/jest.config.ts --no-coverage 'libs/journeys/ui/src/components/TemplateView/CreateJourneyButton'
   ```
6. Run lint: `npx nx lint journeys-ui` (and for journeys-admin if touched — it shouldn't be).
7. Commit, push, and open PR per `/ce:commit-push-pr` with a clear description listing all 14 IDs with their variants + citing Lucinda's request.
8. Follow LFG post-PR workflow (assign, request reviewer, QA requirements, handoff).

## Sources & References

### Internal

- Allowlist file: `libs/journeys/ui/src/libs/useJourneyAiTranslateSubscription/supportedLanguages.ts:1`
- Call sites (all pass `[...SUPPORTED_LANGUAGE_IDS]` into `useLanguagesQuery`):
  - `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/LanguageScreen/LanguageScreen.tsx:155`
  - `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/TranslateJourneyDialog/TranslateJourneyDialog.tsx:135`
  - `libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx:108`
- Language GraphQL schema (DB model with `id`, `bcp47`, `iso3`, `slug`): `apis/api-languages/src/schema/language/language.ts`
- Languages Prisma model: `libs/prisma/languages/db/schema.prisma`

### Prior Precedents

- Malay (PR #8971, commit `0cc4fda29`) — single-line addition, zero spec changes
- Myanmar/Burmese (PR #8413, commit `a4bdf41c1`)
- Nepali (PR #8398, commit `1e9630b64`)

### Linear

- NES-1602 — this ticket, assigned to Jian Wei Chong, Triage status
- Lucinda clarification (Slack thread): confirmed translation target languages, not admin UI

### Project Rules applied

- `.claude/rules/lfg-workflow.dev.md` — PR assignment, reviewer selection, QA handoff
- `.claude/rules/writing-qa-requirements.dev.md` — QA format
- `.claude/rules/worktree-document-creation.dev.md` — plan written to main repo before worktree exists; post-worktree docs (if any follow-up) go into the worktree
- `.claude/rules/running-jest-tests.md` — use `npx jest` with `--no-coverage`, not `nx test`

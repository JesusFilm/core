---
title: 'feat(journeys): add 14 new translation target languages (NES-1602)'
type: feat
status: active
date: 2026-04-24
linear: NES-1602
---

# Add 14 new translation target languages (NES-1602)

## Overview

Add 14 languages to the journey builder's translation target allowlist so Core Teams can translate journeys into them. Languages were requested by Lucinda Mason for the World Cup journeys. Lucinda confirmed these are **translation target languages** (journey content), not admin UI locales.

Target languages:

| #   | Name                  | Notes                                                                    |
| --- | --------------------- | ------------------------------------------------------------------------ |
| 1   | Amharic               | —                                                                        |
| 2   | Bangla                | Distinct from Indian Bengali (which is already supported as id `139081`) |
| 3   | Fula                  | —                                                                        |
| 4   | Hausa                 | —                                                                        |
| 5   | Kazakh                | —                                                                        |
| 6   | Mongolian             | —                                                                        |
| 7   | Portuguese (Portugal) | Distinct from Brazilian Portuguese (already supported as id `584`)       |
| 8   | Sinhala               | —                                                                        |
| 9   | Tagalog               | —                                                                        |
| 10  | Tajik                 | —                                                                        |
| 11  | Tamil                 | —                                                                        |
| 12  | Urdu (Pakistan)       | —                                                                        |
| 13  | Uzbek                 | —                                                                        |
| 14  | Yoruba                | —                                                                        |

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

- [ ] Worktree created at `.claude/worktrees/nes-1602-languages` with branch `jianweichong/nes-1602-add-support-for-14-new-languages-in-journey-builder`
- [ ] Each of the 14 requested languages maps to a verified `id` from the languages DB (not guessed)
- [ ] For variant-sensitive languages (Bangla, Portuguese, Urdu), the chosen ID is confirmed to be the Bangladeshi / Portugal / Pakistani variant respectively, distinct from any already-supported sibling
- [ ] Comments next to each new entry include both the native name and the English name, matching surrounding style
- [ ] `SUPPORTED_LANGUAGE_IDS` array length goes from 50 → 64
- [ ] `nx run journeys-ui:test` passes (no spec changes expected, but run to confirm)
- [ ] `nx run journeys-admin:test` passes for `LanguageScreen`, `TranslateJourneyDialog`, `CopyToTeamMenuItem`, `CreateJourneyButton` suites
- [ ] `nx lint @core/journeys-ui` passes
- [ ] PR created, assigned to me, reviewer requested per LFG workflow
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

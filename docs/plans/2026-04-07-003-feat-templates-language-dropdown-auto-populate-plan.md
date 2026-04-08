---
title: "feat: Auto-populate templates language dropdown from published template languages"
type: feat
status: completed
date: 2026-04-07
ticket: NES-1537
---

# feat: Auto-populate templates language dropdown from published template languages

## Overview

Replace the hardcoded 26-language ID list in the templates page language dropdown with a dynamic query that fetches distinct languages from published templates. This ensures any template published in a new language automatically appears in the filter dropdown.

## Problem Frame

The templates page (`/templates`) language filter dropdown is hardcoded with 26 language IDs in two files that must be kept in sync. Publishers can assign templates to any of ~5000 languages via the template settings dialog, but templates in languages outside the hardcoded 26 are invisible to language-filtered browsing.

## Requirements Trace

- R1. The language dropdown dynamically shows all languages that have at least one published template
- R2. When a template is published in a new language, that language appears in the dropdown (after ISR revalidation / next page load)
- R3. The hardcoded language ID list is removed from both `HeaderAndLanguageFilter.tsx` and `pages/templates/index.tsx`
- R4. SSR pre-fetching uses the same dynamic query
- R5. No regression in dropdown UX (sorting, selection, display)

## Scope Boundaries

- Not changing how publishers assign languages to templates (MetadataTabPanel stays as-is)
- Not adding language popularity ordering or pinning "popular" languages to the top
- Not changing the TemplateSections query or filtering logic

## Context & Research

### Relevant Code and Patterns

- `libs/journeys/ui/src/components/TemplateGallery/HeaderAndLanguageFilter/HeaderAndLanguageFilter.tsx` — hardcoded language IDs (lines 176-203), fetches via `useLanguagesQuery` with `ids` filter
- `apps/journeys-admin/pages/templates/index.tsx` — duplicate hardcoded language IDs in `getStaticProps` (lines 119-146)
- `apis/api-journeys/src/app/modules/journey/journey.resolver.ts` — `journeys` query resolver with Prisma `findMany`, applies `languageId: { in: where.languageIds }` filter
- `apis/api-journeys/src/app/modules/journey/journey.graphql` — `JourneysFilter` input type, `Query.journeys`
- `libs/journeys/ui/src/libs/useLanguagesQuery/useLanguagesQuery.ts` — `GET_LANGUAGES` query, accepts `LanguagesFilter` with `ids` field
- `libs/journeys/ui/src/libs/useJourneysQuery/useJourneysQuery.ts` — `GET_JOURNEYS` query, returns `language { id, name { value, primary } }` per journey

### Institutional Learnings

- If touching `api-languages` subgraph, ensure DateTime scalar registration prerequisites are met (from `docs/solutions/integration-issues/federation-subgraph-scalar-registration-hidden-prerequisites.md`)
- Do not replace existing query args with filter inputs — add new ones alongside (breaking change risk)

## Key Technical Decisions

- **New query `journeyTemplateLanguageIds` on api-journeys**: Returns `String[]` of distinct language IDs from published templates. This is simpler than modifying the existing `journeys` query and avoids fetching full journey data just to extract language IDs. Uses Prisma `findMany` with `distinct: ['languageId']` and `select: { languageId: true }`.
- **Two-step fetch in frontend**: First fetch distinct language IDs from the new query, then pass those IDs to the existing `GET_LANGUAGES` query. This avoids modifying the languages API and reuses the existing data-fetching pattern.
- **No changes to api-languages**: The new query lives entirely in `api-journeys` since it queries the journey table. The languages API is used as-is with the fetched IDs.

## Open Questions

### Resolved During Planning

- **Should we keep a base/fallback set of languages?** No — the dropdown should show exactly the languages that have published templates. If no templates exist, the dropdown will be empty (edge case unlikely in production).
- **Where should the new query live?** In `api-journeys` since it queries the `journey` table filtered by `template=true`, `status=published`, `teamId='jfp-team'`.

### Deferred to Implementation

- Exact Prisma query performance with `distinct` on the journey table — should be fast given the table is already filtered by indexed fields (`template`, `status`, `teamId`)

## Implementation Units

- [x] **Unit 1: Add `journeyTemplateLanguageIds` GraphQL query to api-journeys** (delivered in PR #8976)

  **Goal:** Expose a new query that returns distinct language IDs from published templates

  **Requirements:** R1

  **Dependencies:** None

  **Files:**
  - Modify: `apis/api-journeys/src/app/modules/journey/journey.graphql`
  - Modify: `apis/api-journeys/src/app/modules/journey/journey.resolver.ts`
  - Test: `apis/api-journeys/src/app/modules/journey/journey.resolver.spec.ts`

  **Approach:**
  - Add `journeyTemplateLanguageIds: [String!]!` to `extend type Query` in the GraphQL schema
  - Add a resolver method that uses `prismaService.journey.findMany` with `where: { template: true, status: 'published', teamId: 'jfp-team' }`, `distinct: ['languageId']`, `select: { languageId: true }` and returns the array of language ID strings
  - This query requires no authentication (public templates page)

  **Patterns to follow:**
  - `journeys` query resolver in `journey.resolver.ts` — same Prisma service usage, filter pattern

  **Test scenarios:**
  - Happy path: Returns distinct language IDs when published templates exist in multiple languages
  - Happy path: Returns only one entry per language even when multiple templates share the same language
  - Edge case: Returns empty array when no published templates exist
  - Edge case: Does not include language IDs from draft, archived, or trashed templates
  - Edge case: Does not include language IDs from non-template journeys

  **Verification:**
  - Query returns correct distinct language IDs matching published templates in the test database

- [x] **Unit 2: Replace hardcoded language IDs in `HeaderAndLanguageFilter`** (delivered in PR #8973)

  **Goal:** Define the `GET_JOURNEY_TEMPLATE_LANGUAGE_IDS` gql constant and use it to fetch language IDs dynamically instead of using the hardcoded list

  **Requirements:** R1, R2, R3, R5

  **Dependencies:** Unit 1

  **Files:**
  - Modify: `libs/journeys/ui/src/components/TemplateGallery/HeaderAndLanguageFilter/HeaderAndLanguageFilter.tsx`
  - Test: `libs/journeys/ui/src/components/TemplateGallery/HeaderAndLanguageFilter/HeaderAndLanguageFilter.spec.tsx`

  **Approach:**
  - Define `GET_JOURNEY_TEMPLATE_LANGUAGE_IDS` gql query constant directly in this file (single consumer — no separate hook file needed). Export it for `getStaticProps` to import.
  - Call `useQuery(GET_JOURNEY_TEMPLATE_LANGUAGE_IDS)` to fetch dynamic language IDs
  - Pass the fetched IDs to `useQuery<GetLanguages, GetLanguagesVariables>(GET_LANGUAGES, ...)` directly (instead of `useLanguagesQuery` which does not support the `skip` option)
  - Use `skip: templateLanguageIds == null` on the `useQuery` call to prevent a transient unfiltered fetch of all ~5000 languages
  - Remove the hardcoded `ids` array entirely

  **Patterns to follow:**
  - Current `useLanguagesQuery` usage in the same component — maintain the same `languageId: '529'` parameter for localized names
  - The barrel `index.ts` was updated to re-export `GET_JOURNEY_TEMPLATE_LANGUAGE_IDS` so `getStaticProps` can import via `@core/journeys/ui/TemplateGallery/HeaderAndLanguageFilter`

  **Test scenarios:**
  - Happy path: Dropdown renders language options based on dynamically fetched language IDs
  - Happy path: Loading skeleton shown while language IDs are being fetched
  - Happy path: Selected languages are displayed correctly in the button label
  - Happy path: `useLanguagesQuery` is skipped (not called) while language IDs query is loading
  - Edge case: Empty language IDs result returns no options in the dropdown
  - Integration: Language filter selection still correctly updates URL query params and filters templates

  **Verification:**
  - No hardcoded language IDs remain in the component
  - Dropdown shows languages matching published templates

- [x] **Unit 3: Update `getStaticProps` in templates page for SSR pre-fetching** (delivered in PR #8973)

  **Goal:** Replace hardcoded language IDs in SSR pre-fetch with the dynamic query

  **Requirements:** R3, R4

  **Dependencies:** Unit 2 (imports `GET_JOURNEY_TEMPLATE_LANGUAGE_IDS` from `HeaderAndLanguageFilter`)

  **Files:**
  - Modify: `apps/journeys-admin/pages/templates/index.tsx`

  **Approach:**
  - In `getStaticProps`, first `await` the `GET_JOURNEY_TEMPLATE_LANGUAGE_IDS` query to get dynamic IDs (this is inherently sequential — the result feeds into `GET_LANGUAGES`)
  - Then run `Promise.all([GET_LANGUAGES(dynamicIds), GET_TAGS, GET_JOURNEYS])` in parallel
  - The `GET_JOURNEYS` pre-fetch keeps its existing `languageIds: ['529']` default for the initial page load (English templates shown first) — this is separate from the dropdown's available languages
  - Remove the hardcoded `ids` array from the `GET_LANGUAGES` call entirely
  - ISR `revalidate: 60` ensures new languages appear within ~60 seconds

  **Patterns to follow:**
  - Existing `getStaticProps` pattern in the same file — `apolloClient.query` calls

  **Test scenarios:**
  - Happy path: SSR pre-fetches language data using dynamically fetched language IDs
  - Edge case: SSR handles empty language IDs response gracefully

  **Verification:**
  - No hardcoded language IDs remain in `getStaticProps`
  - Page renders correctly with SSR-pre-fetched dynamic languages

## System-Wide Impact

- **Interaction graph:** The new `journeyTemplateLanguageIds` query is read-only and has no side effects. The templates page language dropdown is the only consumer.
- **Error propagation:** If the new query fails, the language dropdown should show a loading/empty state rather than crashing. The existing `useLanguagesQuery` already handles loading/error states.
- **State lifecycle risks:** ISR revalidation (60s) means newly published template languages may take up to 60 seconds to appear in the dropdown. This is acceptable and consistent with existing template listing behavior.
- **API surface parity:** No other interfaces consume the hardcoded language list. The admin publisher page (`/publisher`) does not have a language filter.
- **Unchanged invariants:** The `GET_JOURNEYS` query, `TemplateSections` component, `LanguagesFilterPopper` UI, and template publishing flow remain unchanged.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Prisma `distinct` query performance on large journey table | Query is filtered by indexed fields (`template`, `status`, `teamId`); result set is small (distinct languages only) |
| SSR adds an extra sequential network hop (fetch language IDs before languages) | The two fetches are inherently sequential, but `GET_TAGS` and `GET_JOURNEYS` still run in parallel with `GET_LANGUAGES`. ISR caches the result for 60s, so this only runs once per minute at most |
| GraphQL codegen needs to run for new types | Standard workflow — run `nx generate-graphql api-journeys`, `nx generate-graphql api-gateway`, then `nx run-many -t codegen --all` after schema changes |

## Delivery Notes

Work was split into two PRs for clean merge ordering:
- **Backend PR #8976** (`26-03-JC-feat-template-language-ids-query`): Unit 1 — GraphQL schema, resolver, tests, generated types, codegen output
- **Frontend PR #8973** (`26-03-JC-feat-templates-language-dropdown`): Units 2 & 3 — component changes, SSR update, test/story mocks. Base branch points to backend PR.

Merge order: backend first → frontend rebases to main.

## Sources & References

- Related ticket: NES-1537
- Hardcoded language list: `libs/journeys/ui/src/components/TemplateGallery/HeaderAndLanguageFilter/HeaderAndLanguageFilter.tsx:176-203`
- SSR duplicate: `apps/journeys-admin/pages/templates/index.tsx:119-146`
- Journey resolver: `apis/api-journeys/src/app/modules/journey/journey.resolver.ts`

---
title: 'Side Navigation: Move Watch out of Resources subgroup'
type: feat
status: active
date: 2026-05-03
ticket: WAT-203
linear_url: https://linear.app/jesus-film-project/issue/WAT-203/side-navigation-move-watch
related_pr: '#8972 (WAT-202 — Videos→Watch rename, Metaverse added)'
---

# Side Navigation: Move Watch out of Resources subgroup (WAT-203)

## Overview

Move the "Watch" item out of the **Resources** accordion subgroup in the side-navigation drawer and promote it to its own **top-level navigation grouping**, positioned **immediately after Resources**. Metaverse stays inside the Resources subgroup. The desktop tab strip is unaffected.

This is a sibling to WAT-202 (PR [#8972](https://github.com/JesusFilm/core/pull/8972)) which renamed "Videos" → "Watch" and added Metaverse to the same subgroup. WAT-203 only restructures the drawer; the route (`/watch`), label, and i18n key are unchanged.

## Problem Statement

Today, "Watch" lives buried inside the Resources accordion in the hamburger drawer (`apps/resources/src/components/Header/HeaderMenuPanel/headerLinks.ts:50`). Stakeholders want Watch to surface as its own top-level nav slot so it is reachable in one click from the drawer, matching the prominence it already has in the desktop subheader tab strip.

## Proposed Solution

Single-file edit to the side-nav config array:

1. Remove the Watch entry from the `Resources` group's `subLinks`.
2. Insert a new top-level entry for Watch directly after the `Resources` group object.

Render mode for the new entry: **leaf link** (pattern A below) — selected because the ticket says "Add Watch to Main Grouping" (i.e. the top-level slot), and a single-item accordion (pattern B) would render an expand chevron with one child link, which reads as broken UX.

### Pattern A (chosen)

```ts
// apps/resources/src/components/Header/HeaderMenuPanel/headerLinks.ts
{
  label: 'Resources',
  subLinks: [
    { label: 'Strategies', url: '/resources' },
    { label: 'Journeys', url: '/journeys' },
    // Watch removed from here
    { label: 'Metaverse', url: 'https://www.jesusfilm.org/metaverse/' },
    { label: 'JesusFilm App', url: '/tools/app/' },
    { label: 'Youtube', url: '/tools/youtube/' },
    { label: 'DVDs & Media', url: 'https://crustore.org/product-category/jesus-film-project/' },
    { label: 'Become A Partner', url: '/partners/' }
  ]
},
{ label: 'Watch', url: '/watch' }, // ← new top-level leaf, inserted after Resources
{ label: 'Careers', url: 'https://recruitcrm.io/jobs/jesusfilm' },
// …rest unchanged
```

### Pattern B (rejected)

```ts
{ label: 'Watch', subLinks: [{ label: 'Watch', url: '/watch' }] }
```

Rejected: a single-child accordion adds an expand affordance with no information benefit. Existing leaf top-level entries (About, Blog, Careers) prove the codebase already supports leaf links at the top level — `HeaderLinkAccordion` switches modes based on presence of `subLinks` (`HeaderLinkAccordion.tsx:32`). Use the existing supported pattern.

> **If stakeholder review of the Linear screenshots indicates Pattern B is intended, this is still a one-line change to `headerLinks.ts` — flag at PR review and adjust.**

## Technical Considerations

- **Surface area**: one source file (`headerLinks.ts`) plus one spec file (`HeaderMenuPanel.spec.tsx`). No new components, no routing changes, no new icons.
- **Rendering**: `HeaderMenuPanel` (`apps/resources/src/components/Header/HeaderMenuPanel/HeaderMenuPanel.tsx:108-121`) already handles the mixed array of leaf and group entries via `HeaderLinkAccordion`'s dual-mode behavior. The new Watch leaf will render as `<MuiLink href="/watch">Watch</MuiLink>` matching About/Blog/Careers.
- **i18n**: `"Watch"` key already present in `libs/locales/en/apps-resources.json:21` (added in WAT-202). Labels are passed through `t(link.label, { lng: 'en' })` so per-locale files do not need updates.
- **Accordion expand state**: `HeaderMenuPanel` tracks one `expanded` group at a time (`HeaderMenuPanel.tsx:20-25`). A leaf link does not participate in this state — it just navigates. No state-management changes.
- **Order in the array determines rendered order** — confirm Watch sits between Resources and Careers post-edit.

## System-Wide Impact

- **Interaction graph**: User opens drawer → `HeaderMenuPanel` maps `headerLinks` → renders `HeaderLinkAccordion` per entry → leaf entries render `<MuiLink>` → click triggers full-page navigation to `/watch` (served by `apps/resources/pages/watch/index.tsx`). No callbacks, no observers, no event bus.
- **Error propagation**: N/A. Static config; no async surface.
- **State lifecycle risks**: None. No persistence, no cache, no optimistic updates.
- **API surface parity**: Desktop subheader tab strip (`HeaderTabButtons.tsx`) and the drawer (`headerLinks.ts`) are independent data sources by design. No parity expectation — confirmed in WAT-202: tab strip already exposes Watch; drawer is the laggard. After this PR they remain independent but both expose Watch prominently.
- **Integration test scenarios**:
  1. Drawer renders → Watch is a top-level link, not nested under Resources.
  2. Resources accordion expands → Watch is **not** in the expanded list; Metaverse, Strategies, etc. still are.
  3. Watch top-level link click → navigates to `/watch`.
  4. Desktop tab strip on `/watch` → Watch tab still highlighted; Metaverse still present (regression check for WAT-202).

## Acceptance Criteria

### Functional

- [ ] In the drawer, "Watch" appears as a top-level item between "Resources" and "Careers".
- [ ] In the drawer, expanding "Resources" no longer shows "Watch" — it shows: Strategies, Journeys, Metaverse, JesusFilm App, Youtube, DVDs & Media, Become A Partner.
- [ ] Clicking the top-level "Watch" link navigates to `/watch`.
- [ ] "Metaverse" remains inside the Resources subgroup (regression guard).
- [ ] Desktop subheader tab strip is unchanged (Watch + Metaverse buttons still render).

### Quality Gates

- [ ] New unit test in `HeaderMenuPanel.spec.tsx` asserts Watch is a top-level link and is absent from the Resources expanded list.
- [ ] Existing specs pass: `Header.spec.tsx`, `HeaderMenuPanel.spec.tsx`, `HeaderLinkAccordion.spec.tsx`, `HeaderTabButtons.spec.tsx`.
- [ ] Storybook visually verified: `HeaderMenuPanel.stories.tsx`, `Header.stories.tsx` show the new placement.
- [ ] Lint and type-check clean: `npx prettier --write` on touched files, `npx nx lint resources`, `npx nx typecheck resources`.

## Implementation Plan

### Files to change

1. **`apps/resources/src/components/Header/HeaderMenuPanel/headerLinks.ts`**
   - Remove line 50 `{ label: 'Watch', url: '/watch' },` from the Resources `subLinks` array.
   - Insert `{ label: 'Watch', url: '/watch' },` as a new top-level array entry between the `Resources` group object (ends ~line 60) and the next `Careers` entry.

2. **`apps/resources/src/components/Header/HeaderMenuPanel/HeaderMenuPanel.spec.tsx`** (extend, don't rewrite)
   - Add a test: drawer-rendered → query for "Watch" link → assert it is a direct child of the menu list (not inside the collapsed/expanded Resources accordion).
   - Optional second assertion: when Resources is expanded, the expanded region does NOT contain a "Watch" link.

### Files to NOT change

- `HeaderTabButtons.tsx` and `HeaderTabButtons.spec.tsx` — desktop tab strip is independent.
- `HeaderLinkAccordion.tsx` — handles both modes already; no logic change.
- `libs/locales/*/apps-resources.json` — `"Watch"` key already exists in `en`; other locales fall back to forced `lng: 'en'`.
- Any routing under `apps/resources/pages/watch/` — route unchanged.
- `apps/watch` — older app, does not consume this Header.

### Manual verification (before pushing)

- `nx serve resources`, open drawer, verify placement on a desktop and a mobile viewport.
- Click Watch top-level → lands on `/watch`.
- Expand Resources → Watch is gone; Metaverse and the rest are present.
- Visit `/watch` → desktop tab strip still shows Watch as selected.

## Risks & Mitigations

| Risk                                                                                                       | Likelihood | Mitigation                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pattern A vs B mismatch with stakeholder intent                                                            | Low/Medium | Plan defaults to A (the natural reading); flagged for confirmation in PR description with the Linear screenshots referenced. One-line revert if changed. |
| Storybook visual regression (snapshot drift)                                                               | Low        | No snapshot tests in this folder; manual Storybook check noted in acceptance criteria.                                                                   |
| E2E spec hard-codes "expand Resources to find Watch" path                                                  | Low        | Quick grep of `apps/resources-e2e` during work to confirm; update if found.                                                                              |
| Branch-name regex (`username/ticket-id-…`) — worktree-created branch was `worktree-jianweichong+wat-203-…` | Resolved   | Renamed at plan time to `jianweichong/wat-203-side-navigation-move-watch`.                                                                               |

## Out of Scope

- Adding/removing any other nav items.
- Reordering items within the Resources subgroup.
- Changing icons, copy, or routes.
- Touching `apps/watch` (older app).
- Translation key restructuring.

## Sources & References

### Internal

- `apps/resources/src/components/Header/HeaderMenuPanel/headerLinks.ts:6-92` — nav config (target file)
- `apps/resources/src/components/Header/HeaderMenuPanel/HeaderMenuPanel.tsx:16-126` — renders the array
- `apps/resources/src/components/Header/HeaderMenuPanel/HeaderLinkAccordion/HeaderLinkAccordion.tsx:24-148` — dual-mode renderer
- `apps/resources/src/components/Header/HeaderMenuPanel/HeaderMenuPanel.spec.tsx:1-42` — extend with WAT-203 assertion
- `libs/locales/en/apps-resources.json:21` — `"Watch"` key (already present)
- WAT-202 squash commit: `506173e8e` (precedent for the same file)

### External / Conventions

- `apps/resources/AGENTS.md:147-292` — testing, naming, i18n conventions
- `.claude/rules/frontend/apps.md` — MUI-first, Apollo, gql.tada
- `.claude/rules/running-jest-tests.md` — `npx jest --config apps/resources/jest.config.ts --no-coverage <path>`
- `.claude/rules/workflow/lfg-workflow.dev.md` — PR assignment, reviewer, QA handoff steps after merge

### Related

- Linear ticket: [WAT-203](https://linear.app/jesus-film-project/issue/WAT-203/side-navigation-move-watch)
- Sibling Linear ticket (Done): [WAT-202](https://linear.app/jesus-film-project/issue/WAT-202/updates-to-resource-hub-section)
- Sibling PR (merged): [JesusFilm/core#8972](https://github.com/JesusFilm/core/pull/8972)

## QA Outline (preview — full QA writeup happens post-PR per `writing-qa-requirements.dev.md`)

- **Scenario 1**: Drawer shows Watch as a top-level item between Resources and Careers (desktop + mobile viewports).
- **Scenario 2**: Resources expanded — does NOT contain Watch; still contains Strategies, Journeys, Metaverse, JesusFilm App, Youtube, DVDs & Media, Become A Partner.
- **Scenario 3**: Click top-level Watch → lands on `/watch` (Vercel preview URL to be filled in once PR is up).
- **Scenario 4 (regression)**: Desktop tab strip on `/watch` still highlights Watch and shows Metaverse (WAT-202 guard).

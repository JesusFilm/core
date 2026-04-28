---
title: 'feat: Consolidate Template Settings and Template Details dialogs for local templates (NES-1543)'
type: feat
status: active
date: 2026-04-28
ticket: NES-1543
---

# feat: Consolidate Template Settings and Template Details dialogs for local templates

## Overview

Local templates currently expose two overlapping editing dialogs:

- **Edit Details** (`JourneyDetailsDialog`) — title, description, language. Reachable from the template list context menu, the editor toolbar's journey-title button, and the editor's mobile menu.
- **Template Settings** (`TemplateSettingsDialog`) — Metadata (title, description, language, plus Featured for global), Categories (global only), About (creator info, customization description, Strategy for global). Reachable from the editor toolbar's "Template Settings" menu item.

The fields overlap (title/description/language live in both) and the "Template Settings" dialog includes sections that aren't relevant to local templates (creator info — owned by the gallery page; Featured/Date/Strategy — global-only).

This ticket replaces the two dialogs with **one unified "Template Details" dialog for local templates only**. Global templates (`journey.team.id === 'jfp-team'`) keep `TemplateSettingsDialog` unchanged. Non-template journeys keep `JourneyDetailsDialog` unchanged.

## Problem Statement

1. **Redundant entry points**: a local-template editor sees both "Edit Details" and "Template Settings" menu items that partially overlap, confusing the editing model.
2. **Out-of-place fields**: the local "About" tab surfaces creator info (canonically owned by the gallery page) and offers Strategy/Featured controls that are not honoured for non-gallery templates.
3. **Two save paths for title/description/language**: `useTitleDescLanguageUpdateMutation` (with subscription + `updatedAt`) vs. `useJourneyUpdateMutation`. Today's editor dispatches different mutations for the same fields depending on which dialog the user opens. The unified flow should route by mutation responsibility, not by which dialog the user happened to click.

## Proposed Solution

**Build a new `LocalTemplateDetailsDialog` component** that:

- Uses the `Dialog` + `Tabs` shell from `@core/shared/ui` (matching `TemplateSettingsDialog`).
- Renders a **single panel, no tabs**: title, description, language, then a divider, then the publisher customization description (`CustomizeTemplate`). No Featured / publishedAt. No Categories. No Strategy section. No Creator info.
- Saves via `useTitleDescLanguageUpdateMutation` (preserves `updatedAt` + translation-poll semantics) for the metadata tab and `journeyCustomizationFieldPublisherUpdate` for the about tab — only for fields that are dirty.
- Lives at `apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/LocalTemplateDetailsDialog/` as a sibling to `JourneyDetailsDialog`.
- Title placeholder: `t('Template Details')` (per ticket; see open question §1).

**Re-route entry points by `isLocalTemplate`** at all four sites:

- `JourneyCardMenu.tsx` — context menu "Edit Details"
- `DetailsItem.tsx` — editor toolbar mobile menu "Edit Details"
- `Toolbar.tsx` — editor journey-title button
- `Menu.tsx` — hide `TemplateSettingsItem` for local templates (it's now redundant)

For **global templates** and **non-template journeys**, the four entry points keep their existing dialog wiring. **Zero behavioural change** outside the local-template path.

### Architecture Decision: New component vs. prop-driven reuse

**Chosen: new component**, per ticket directive ("Keep the global render path identical — only the local path gets the new component").

Alternatives considered:

- *Add a `local` prop to `TemplateSettingsDialog`*: rejected. Risks regressing the global render path; mutation strategy differs (we must route title/desc/language through `useTitleDescLanguageUpdateMutation` for translation polling, which `TemplateSettingsDialog` does not do today); and the dialog title differs.
- *Extract a shared `useTemplateDetailsForm` plus two thin wrappers*: rejected for now. The two dialogs diverge in mutation routing, tab set, and snackbar copy enough that abstracting would obscure rather than simplify. Revisit in a follow-up if a third caller appears.

## Resolved Decisions (from Siyang, 2026-04-28)

1. **Dialog title**: `t('Template Details')`. ✅
2. **Categories**: **Excluded**. Categories are global-only and drive the public gallery; not relevant to local templates. ✅
3. **Layout**: **Single panel, no tabs**. Render Metadata fields and the About content (CustomizeTemplate) sequentially in one scroll. ✅
4. **Beacon route param**: introduce `templateDetails` for local templates so analytics distinguish the unified flow.
5. **Dirty-form discard prompt**: not in scope; matches existing behaviour.
6. **Permission gating**: out of scope; verify in QA.
7. **Success snackbar copy**: `t('Template details saved')`.

## Technical Approach

### Files to create

- `apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/LocalTemplateDetailsDialog/LocalTemplateDetailsDialog.tsx`
- `apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/LocalTemplateDetailsDialog/LocalTemplateDetailsDialog.spec.tsx`
- `apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/LocalTemplateDetailsDialog/LocalTemplateDetailsDialog.stories.tsx`
- `apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/LocalTemplateDetailsDialog/index.ts`
- (Optional) `apps/journeys-admin/src/libs/getIsLocalTemplate/getIsLocalTemplate.ts` + spec — extract the predicate `journey?.template === true && journey?.team?.id !== 'jfp-team'` already duplicated across 5 sites. Drop if it expands the diff too much; otherwise it pays off in the four entry-point edits in this PR alone.

### Pseudo-code for new component

```tsx
// LocalTemplateDetailsDialog.tsx
import { ApolloError } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { useTitleDescLanguageUpdateMutation } from '../../../../../libs/useTitleDescLanguageUpdateMutation'
// Reuse existing shared form context + about content
import { useTemplateSettingsForm } from '../../Items/TemplateSettingsItem/TemplateSettingsDialog/useTemplateSettingsForm'
import { JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE } from '../../Items/TemplateSettingsItem/TemplateSettingsDialog/TemplateSettingsDialog'

interface LocalTemplateDetailsDialogProps {
  open: boolean
  onClose: () => void
}

export function LocalTemplateDetailsDialog({
  open,
  onClose
}: LocalTemplateDetailsDialogProps): ReactElement {
  // Formik onSubmit logic:
  //   - if title || description || languageId dirty → useTitleDescLanguageUpdateMutation
  //     (with optimisticResponse mirroring JourneyDetailsDialog)
  //   - if journeyCustomizationDescription dirty → journeyCustomizationFieldPublisherUpdate
  //   - on success: snackbar t('Template details saved'), onClose
  //   - on error: existing ApolloError → networkError snackbar pattern
  // Tabs: [Metadata, About]
  //   - Metadata reuses MetadataLocalSection (extracted from MetadataTabPanel sans showFeaturedSettings)
  //   - About reuses CustomizeTemplate only (no creator info, no strategy)
}
```

### Files to modify

| File | Change |
|---|---|
| `apps/journeys-admin/src/components/Editor/Toolbar/Toolbar.tsx` | Replace `<JourneyDetailsDialog>` (line 317) for local templates with the new dialog. Keep existing for non-local. |
| `apps/journeys-admin/src/components/Editor/Toolbar/Items/DetailsItem/DetailsItem.tsx` | Branch by `isLocalTemplate` to render new dialog. |
| `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/JourneyCardMenu.tsx` | Branch by `isLocalTemplate` (already computed inline at `DefaultMenu.tsx:196` — pass through or recompute) to render new dialog at line 307. |
| `apps/journeys-admin/src/components/Editor/Toolbar/Menu/Menu.tsx` | Line 94: change `{isTemplate && ...}` to `{isTemplate && !isLocalTemplate && ...}` (TemplateSettingsItem hidden for local). `isLocalTemplate` already computed at line 53. |
| `apps/journeys-admin/src/components/Editor/Toolbar/Items/TemplateSettingsItem/TemplateSettingsItem.tsx` | (Optional) Early-return for local templates as defence in depth. Not strictly needed if Menu.tsx hides the item. |
| `libs/locales/en/apps-journeys-admin.json` | Add `"Template Details"`, `"Template details saved"` strings. |
| Spec files for each modified component | Update to reflect the new branching. |

### Files NOT modified

- `JourneyDetailsDialog.tsx` and `TemplateSettingsDialog.tsx` themselves — global and non-template paths must remain identical.
- `MetadataTabPanel`, `AboutTabPanel`, `CategoriesTabPanel` — kept for use by `TemplateSettingsDialog`. The new dialog reuses them via composition where appropriate (Metadata fields), or skips them where local-template scope diverges (creator info, strategy).

### Mutation routing

```
onSubmit(values, { initialValues }):
  if (dirtySubset(values, ['title', 'description', 'languageId'])):
    titleDescLanguageUpdate({
      variables: { id, input: { title, description, languageId } },
      optimisticResponse: { ... }   // mirror JourneyDetailsDialog
    })
  if (values.journeyCustomizationDescription !== initialValues.journeyCustomizationDescription):
    journeyCustomizationDescriptionUpdate({
      variables: { journeyId: id, string: values.journeyCustomizationDescription },
      refetchQueries: ['GetPublisherTemplate']
    })
  enqueueSnackbar(t('Template details saved'), { variant: 'success' })
  onClose()
```

This routing matters: dropping `useTitleDescLanguageUpdateMutation` would regress the translation-polling subscription that consumes its `updatedAt` field (see PR #6755).

### `isLocalTemplate` predicate

Already computed inline at five sites. Either inline in the four edited files (status quo, smaller diff) or extract to `libs/getIsLocalTemplate`:

```ts
// libs/getIsLocalTemplate/getIsLocalTemplate.ts
export function getIsLocalTemplate(journey?: { template?: boolean | null; team?: { id?: string | null } | null } | null): boolean {
  return journey?.template === true && journey?.team?.id !== 'jfp-team'
}
```

Default: **inline** for this PR; extract in a follow-up if reviewer prefers.

## System-Wide Impact

- **Interaction graph**: Editor toolbar journey-title click → `Toolbar.handleDialogOpen` → `setRoute('templateDetails' or 'journeyDetails')` → `setBeaconPageViewed` → render new dialog. On submit → `useTitleDescLanguageUpdateMutation` (Apollo) → optimistic update of journey cache → toolbar `JourneyDetails` re-renders with new title/description. If dirty: `journeyCustomizationFieldPublisherUpdate` → `refetchQueries: ['GetPublisherTemplate']` → publisher template view re-fetches.
- **Error propagation**: `ApolloError` → `enqueueSnackbar(error, 'error')`; non-Apollo `Error` → generic snackbar. Mirror existing pattern.
- **State lifecycle**: Two mutations called in sequence; first succeeds, second fails → user sees an error snackbar but title/desc/language are persisted. Acceptable; failure is reportable. No orphaned writes.
- **API surface parity**: Both mutations already exist server-side. No new GraphQL schema changes.
- **Integration tests**:
  1. Local-template editor → click journey title → dialog opens with two tabs, Metadata default; Categories tab not present; Featured checkbox not present; Strategy section not present; Creator info not present.
  2. Edit title only → save → assert single `useTitleDescLanguageUpdateMutation` call, no `journeyCustomizationFieldPublisherUpdate`, snackbar success.
  3. Edit customization description only → save → opposite.
  4. Edit both → both mutations dispatched once each.
  5. Template list context menu → "Edit Details" on a local template → opens new dialog.
  6. Template list context menu → "Edit Details" on a regular journey or global template → opens **existing** `JourneyDetailsDialog`.
  7. Editor mobile menu → no "Template Settings" item visible for local template.
  8. Editor mobile menu → "Template Settings" item still visible for global template.

## Acceptance Criteria

### Functional
- [ ] Local-template editor surfaces a single "Template Details" dialog from all four entry points.
- [ ] Dialog covers: title, description, language, customization description.
- [ ] Dialog excludes: creator info, Featured, publishedAt date, Categories, Strategy slug.
- [ ] Dialog title (placeholder): "Template Details" (subject to open question §1).
- [ ] Submit persists changes via the right mutation: title/desc/language → `useTitleDescLanguageUpdateMutation`; customization description → `journeyCustomizationFieldPublisherUpdate`.
- [ ] Optimistic response mirrors existing `JourneyDetailsDialog` for title/desc/language.
- [ ] Success snackbar `"Template details saved"`.
- [ ] Error handling: ApolloError network → "Field update failed. Reload the page or try again."; other Error → generic message. Mirrors existing patterns.
- [ ] `enableReinitialize` set on Formik (regression-tested in PR #3795).
- [ ] Form reset on close uses `setTimeout` to wait for dialog animation (matches existing pattern).
- [ ] All `TextField` instances use `onKeyDown={(e) => e.stopPropagation()}` to prevent editor hotkey hijacking.
- [ ] Global templates: `TemplateSettingsDialog` and `JourneyDetailsDialog` behave identically to before.
- [ ] Non-template journeys: `JourneyDetailsDialog` behaves identically to before.

### Non-functional
- [ ] Mobile: dialog uses `fullscreen={!smUp}`, tabs `variant="fullWidth"` (consistent with existing dialogs).
- [ ] a11y: `tabA11yProps` on each tab; focus trap via MUI Dialog; escape closes; tab keyboard navigation works.
- [ ] Dynamic import via `next/dynamic` with `webpackChunkName` magic comment; `ssr: false`.
- [ ] No regression in translation polling: `updatedAt` field still flows through after title/desc/language edits on local templates.

### Quality gates
- [ ] Unit/integration tests for new dialog (rendering, submit dispatch, error paths). Use `@testing-library/react`, `MockedProvider`, `JourneyProvider`, `SnackbarProvider`.
- [ ] Update `Menu.spec.tsx` for the local-template `TemplateSettingsItem` hide.
- [ ] Update `JourneyCardMenu.spec.tsx` and `DetailsItem.spec.tsx` and `Toolbar.spec.tsx` for the local-template branching.
- [ ] Storybook story added for the new dialog.
- [ ] Type-check (`nx typecheck journeys-admin`) passes.
- [ ] Lint passes.
- [ ] No coverage drop in `apps/journeys-admin`.

## Implementation Phases

### Phase 1 — Scaffolding & wiring (foundation)
- Create branch `siyangcao/nes-1543-consolidate-local-template-dialogs` off `origin/main`.
- Confirm Linear has no in-progress duplicate (already verified — no PR or branch matches).
- (Optional) Extract `getIsLocalTemplate` helper.
- Create the four new files for `LocalTemplateDetailsDialog`. Compose via `Formik`, `Dialog`, `Tabs`, `TabPanel`. Use `useTemplateSettingsForm` for shared form context where it simplifies, otherwise scope a local Formik directly.
- Story renders dialog open against a fixture local-template journey.

### Phase 2 — Mutation routing
- Implement onSubmit dispatch by dirty subset.
- Wire `useTitleDescLanguageUpdateMutation` with optimistic response (port from `JourneyDetailsDialog`).
- Wire `journeyCustomizationFieldPublisherUpdate` with `refetchQueries: ['GetPublisherTemplate']` (port from `TemplateSettingsDialog`).
- Add validation schema (`title.required`, `description` optional, `languageId` optional). No `strategySlug` validation needed (out of scope).
- Add success and error snackbars.

### Phase 3 — Entry-point branching
- `Menu.tsx`: hide `TemplateSettingsItem` for local templates.
- `Toolbar.tsx`: branch journey-title button by `isLocalTemplate`.
- `DetailsItem.tsx`: branch by `isLocalTemplate`.
- `JourneyCardMenu.tsx`: branch the "Edit Details" → dialog wiring by `isLocalTemplate`.
- Update beacon route param if open question §4 is resolved.

### Phase 4 — Tests
- New `LocalTemplateDetailsDialog.spec.tsx` covering: render with two tabs only, hides global-only fields, dispatches title/desc/lang mutation only when those fields dirty, dispatches customization mutation only when description dirty, snackbar success/error variants, escape/cancel resets form via `setTimeout`.
- Update `Menu.spec.tsx`, `JourneyCardMenu.spec.tsx`, `DetailsItem.spec.tsx`, `Toolbar.spec.tsx`.
- Snapshot/mocks: add fixtures for local-template journey if not present.

### Phase 5 — i18n & polish
- Add new English strings to `libs/locales/en/apps-journeys-admin.json`.
- Verify Storybook story.
- Manual smoke in dev: local-template editor + template list, plus regression check on global template + regular journey.

### Phase 6 — Review & merge
- Run `ce-review` on the branch.
- Run `ce-compound` post-merge to capture institutional knowledge (none exists for these dialogs today — flagged by learnings-researcher).

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Dropping `useTitleDescLanguageUpdateMutation` regresses translation polling | Medium if naively merged | High | Explicitly route title/desc/language through `useTitleDescLanguageUpdateMutation`; cover with a regression test asserting the mutation is called. |
| Global render path subtly changes | Low | High | Don't touch `TemplateSettingsDialog` or `JourneyDetailsDialog`. Only the entry-point components branch on `isLocalTemplate`. Add explicit "global path unchanged" assertions in updated specs. |
| Formik `enableReinitialize` omitted on new dialog → stale values after translation poll | Medium | Medium | Set `enableReinitialize`. Add comment referencing PR #3795. |
| Two simultaneous mutations on same submit fail partially | Low | Low | Sequential await; user sees a single error snackbar. Acceptable since failure is recoverable on retry. |
| Local→global team change mid-edit | Very low | Low | Out of scope. Document in PR description; consider follow-up to listen on `journey.team.id` and force-close. |
| Beacon param change confuses analytics dashboards | Low | Low | If changing to `templateDetails`, coordinate with analytics owner before merge. |

## Dependencies & Prerequisites

- No backend changes. Server-side mutations (`useTitleDescLanguageUpdateMutation`, `useJourneyUpdateMutation`, `journeyCustomizationFieldPublisherUpdate`) already support all required fields.
- No GraphQL schema changes. No migration.
- Branch from `origin/main`. Branch name: `siyangcao/nes-1543-consolidate-local-template-dialogs` (matches CLAUDE.md preferred regex).
- No new npm dependencies.

## Sources & References

### Internal references (file:line)
- `apps/journeys-admin/src/components/Editor/Toolbar/Items/TemplateSettingsItem/TemplateSettingsDialog/TemplateSettingsDialog.tsx:74` — `isGlobalTemplate` flag.
- `apps/journeys-admin/src/components/Editor/Toolbar/Items/TemplateSettingsItem/TemplateSettingsDialog/TemplateSettingsDialog.tsx:121–174` — onSubmit reference for mutation routing.
- `apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/JourneyDetailsDialog/JourneyDetailsDialog.tsx:68–124` — `useTitleDescLanguageUpdateMutation` + optimistic response reference.
- `apps/journeys-admin/src/components/Editor/Toolbar/Toolbar.tsx:167–172, 296–322` — homeHref local-template gate, journey-title button entry point.
- `apps/journeys-admin/src/components/Editor/Toolbar/Menu/Menu.tsx:53, 92–96` — `isLocalTemplate`, item rendering site.
- `apps/journeys-admin/src/components/Editor/Toolbar/Items/DetailsItem/DetailsItem.tsx` — entry point.
- `apps/journeys-admin/src/components/Editor/Toolbar/Items/TemplateSettingsItem/TemplateSettingsItem.tsx` — entry point.
- `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/JourneyCardMenu.tsx:307` — entry point.
- `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DefaultMenu/DefaultMenu.tsx:196` — `isLocalTemplate` reference.
- `libs/locales/en/apps-journeys-admin.json` — i18n strings target.

### Conventions
- `.claude/rules/frontend/apps.md` — MUI components, `handle*` event handlers, accessibility on interactive elements, `@testing-library/react` for tests, descriptive names.
- `.claude/rules/running-jest-tests.md` — `npx jest --config apps/journeys-admin/jest.config.ts --no-coverage '<file>'`. Never `nx test --testPathPattern`.
- `.claude/CLAUDE.md` — branch naming regex, code style.

### Related work
- PR #8510 (commit `60c1aa36a`) — introduced local-template feature suite; established the `team.id !== 'jfp-team'` predicate.
- PR #6350 (commit `a7d5cb892`) — introduced `useTitleDescLanguageUpdateMutation` and the Edit Details menu item.
- PR #3795 (commit `75cde41b5`) — `enableReinitialize` on `JourneyDetailsDialog`.
- PRs #6755, #6761, #6543 — translation polling and `updatedAt` consumers; reason to keep the title/desc/language mutation.
- PR #8944 (NES-1494) — recent customization-description regression in `journey.resolver.ts`; smoke-test customization round-trip in QA.

### External references
None required — pure UI consolidation in established patterns.

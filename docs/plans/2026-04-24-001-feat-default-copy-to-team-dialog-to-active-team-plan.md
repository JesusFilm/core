---
title: 'feat: Default Copy To Team Dialog to the active team for team-template Use This Template flow'
type: feat
status: active
date: 2026-04-24
linear: NES-1601
---

# feat: Default Copy To Team Dialog to the active team (team-template Use This Template flow only)

## Overview

When a user clicks **Use This Template** on a **TEAM Template** (the "Add Journey to Team" dialog opened by `CreateJourneyButton`), pre-fill the team selector with the user's **active team** so the common case becomes a single-click confirmation. Other flows that share `CopyToTeamDialog` ("Copy to ...", "Duplicate") keep their existing empty default.

The change is **client-only**. No `api-journeys` changes. The existing `JourneyDuplicate` mutation already accepts `teamId` from the client.

## Problem Statement / Motivation

Lucinda Mason (reporting team member) surfaced this in `#nextsteps-feedback` on 2026-04-24: she creates many journeys from team templates for the WC, and the dialog's team dropdown being empty forces a pointless extra click each time. See Linear [NES-1601](https://linear.app/jesus-film-project/issue/NES-1601/set-dialog-default-to-current-team-when-using-team-templates) and Slack [thread](https://jfp-digital.slack.com/archives/C08GT3TGLDP/p1776956602585379).

Today the dropdown defaults to:

- the sole team's id, when the user has exactly one team
- the empty string, when the user has multiple teams — this is what forces the extra click

The `TeamProvider` (`libs/journeys/ui/src/components/TeamProvider/TeamProvider.tsx:36`) already resolves an `activeTeam` from URL param → session storage → DB `lastActiveTeamId`. The dialog just never consults it.

## Proposed Solution

Three coordinated changes:

1. **`libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx`** — add an opt-in `defaultToActiveTeam?: boolean` prop. When `true`, `initialValues.teamSelect` resolves to `activeTeam?.id` (from `useTeam()`) before falling back to today's `teams.length === 1 ? teams[0].id : ''`. When `false` (the default), behaviour is unchanged. `enableReinitialize` is already on, so Formik re-initializes cleanly when `activeTeam` resolves from the async `GetLastActiveTeamIdAndTeams` query.

2. **`libs/journeys/ui/src/components/TemplateView/CreateJourneyButton/CreateJourneyButton.tsx`** — extend the local `JourneyForTemplate` interface to carry `team?: { id: string } | null`, then pass `defaultToActiveTeam={journeyDataToUse?.team != null && journeyDataToUse.team.id !== 'jfp-team'}` to the dialog. This mirrors the `isLocalTemplate` definition in `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DefaultMenu/DefaultMenu.tsx:196-197` so the discriminator is consistent across the app.

3. **`apps/journeys-admin/src/components/Team/CopyToTeamMenuItem/CopyToTeamMenuItem.tsx`** and **`apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DuplicateJourneyMenuItem/DuplicateJourneyMenuItem.tsx`** — **no change**. Their flows keep the empty default.

### Why narrow the scope to the team-template "Use This Template" flow only

`CopyToTeamDialog` is reused by three production callers:

- `CreateJourneyButton` ("Use This Template" button or menu-item, dialog title `Add Journey to Team`) — Lucinda's specific complaint; pre-filling the active team is exactly what she asked for when the source is a team template.
- `CopyToTeamMenuItem` ("Copy to ..." menu, dialog title `Copy to Another Team`) — semantically a _cross-team_ copy. The empty default forces the user to pick deliberately, which is the right UX for "moving content elsewhere". Pre-filling the active team here would mask the intent.
- `DuplicateJourneyMenuItem` ("Duplicate" menu) — only opens the dialog when `activeTeam === null` (Shared with me view). Pre-filling active team is a no-op in that branch.

Pre-filling unconditionally would change the "Copy to ..." menu's UX without that being requested. The `defaultToActiveTeam` prop lets `CreateJourneyButton` opt in, leaves the other two flows untouched, and adds two lines of caller logic.

### Why discriminate on `team.id !== 'jfp-team'`

Both team templates and global JFP templates render through the same `CreateJourneyButton`. Lucinda's request specifically calls out team templates (`"since it is a team template, most likely you will be using it on the same team"`), and didn't ask for behaviour change on global templates. The `team.id !== 'jfp-team'` check matches `DefaultMenu.isLocalTemplate` so the condition is consistent with how the rest of the app distinguishes the two.

### Why no backend changes

The `JourneyDuplicate` mutation (`libs/journeys/ui/src/libs/useJourneyDuplicateMutation/useJourneyDuplicateMutation.ts:13-29`) takes `teamId: ID!` from the client. The resolver does not override the client's choice. This is purely a client default-value change.

## Technical Considerations

- `activeTeam` may be `undefined` (loading), `null` (user explicitly in "shared with me" view), or a `Team`. The `?? fallback` chain handles all three: only a truthy `activeTeam.id` triggers the new behavior.
- `activeTeam` is always a member of `teams` when truthy, because `TeamProvider` derives `activeTeam` from `query.data.teams` (`TeamProvider.tsx:221-224`) — no "phantom id" risk.
- `enableReinitialize: true` means if the user opens the dialog before `GetLastActiveTeamIdAndTeams` resolves, the dropdown will flip from `''` → `activeTeam.id` once the query completes. This is fine: the dialog is rarely opened before teams load, and even if it is, the field is not yet dirty so reinit is safe.
- No SSR risk: dialog is client-only (modal).

## System-Wide Impact

- **Interaction graph:** User clicks _Use this Template_ (or _Duplicate_ in a journey menu) → dialog opens → Formik initializes with new default → user clicks Submit → `submitAction` → `JourneyDuplicate` mutation → `updateLastActiveTeamId` mutation → `GetAdminJourneys` refetch. The chain is unchanged; only the initial field value changes.
- **Error propagation:** No new error paths. Form validation on `teamSelect` (`required`, line 156) still fires if somehow the default resolves to `''`.
- **State lifecycle risks:** None. `resetForm()` is still called on submit (line 140) and on close (line 210), so subsequent opens pick up the latest `activeTeam` cleanly.
- **API surface parity:** No mutation signature changes. `CreateJourneyButton` opts into the new default via `defaultToActiveTeam`; `CopyToTeamMenuItem` and `DuplicateJourneyMenuItem` remain on existing empty-default behavior.
- **Integration test scenarios:** See **Acceptance Criteria** below; the new "multi-team user opens dialog" scenario is the one unit tests must cover.

## Acceptance Criteria

- [ ] `CopyToTeamDialog` accepts a `defaultToActiveTeam?: boolean` prop; when `true` the team selector defaults to `useTeam().activeTeam?.id` before falling back to today's behaviour; when omitted/`false` behaviour is unchanged.
- [ ] `CreateJourneyButton` passes `defaultToActiveTeam` based on `journeyDataToUse?.team != null && journeyDataToUse.team.id !== 'jfp-team'`.
- [ ] Multi-team user clicking **Use This Template** on a team template → the **Select Team** combobox is pre-filled with the active team.
- [ ] Multi-team user clicking **Use This Template** on a global JFP template → the combobox stays empty (no behaviour change for global templates).
- [ ] Multi-team user clicking the **Copy to ...** menu item on any journey/template → the combobox stays empty (no behaviour change).
- [ ] Multi-team user clicking **Duplicate** on a journey while on a team → no dialog opens (behaviour unchanged).
- [ ] Multi-team user clicking **Duplicate** on a journey while in the Shared view → dialog opens with empty selector (behaviour unchanged).
- [ ] Single-team users see no behaviour change in any flow.
- [ ] No changes to `api-journeys` or any other backend.
- [ ] `CopyToTeamDialog.spec.tsx` covers: (1) flag on + active team resolved → pre-fill, (2) flag on + active team null → empty, (3) flag off + active team resolved → empty (existing behaviour).
- [ ] `CreateJourneyButton.spec.tsx` covers: (1) team template (`team.id !== 'jfp-team'`) → combobox pre-filled, (2) global JFP template (`team.id === 'jfp-team'`) → empty, (3) `team: null` → empty.
- [ ] Existing `CopyToTeamDialog.spec.tsx`, `CopyToTeamMenuItem.spec.tsx`, `DuplicateJourneyMenuItem.spec.tsx`, and `TemplateView` suites still pass.
- [ ] Lint passes (`nx lint journeys-ui`) and typecheck passes (`nx type-check journeys-ui`).

## Success Metrics

- Click-to-copy friction reduced by one click in the multi-team team-template flow (primary complaint).
- Zero regressions in the global-template copy flow and journey-duplicate flow.

## Dependencies & Risks

- **Dependency:** `TeamProvider` must be an ancestor of `CopyToTeamDialog`. Already the case in every invocation (journeys-admin wraps the admin shell in `TeamProvider`, and both `CopyToTeamMenuItem` and `DuplicateJourneyMenuItem` render inside it).
- **Risk:** A Jest test that previously asserted the combobox was empty after load (when `lastActiveTeamId` was set) could start failing. Grep for such assertions during implementation — plan research already catalogs the two relevant spec files.
- **Risk:** If a future caller mounts `CopyToTeamDialog` _outside_ a `TeamProvider`, `useTeam()` returns `{} as Context` (line 34 in `TeamProvider.tsx`) and `activeTeam` is `undefined`. The `?? fallback` chain handles this gracefully (behaves exactly like today). No regression.

## Alternative Approaches Considered

1. **Default unconditionally inside `CopyToTeamDialog`.** Earlier draft of this plan; rejected after a closer reading of Lucinda's ask and the "Copy to ..." menu's semantics. That approach silently changed the cross-team copy flow without that being requested.
2. **Default to `journey.team.id` (team that _owns_ the template) rather than `activeTeam.id`.** Rejected: Lucinda's ask is explicitly _"the team you are on"_, which is `activeTeam`. For team templates these usually coincide, but `activeTeam` is the true signal for "where the user is working right now."
3. **Move the default logic into `CopyToTeamMenuItem` / `DuplicateJourneyMenuItem` instead of the dialog.** Rejected: the dialog is the lowest common point for both call sites, and the logic is a one-liner — centralising in the dialog avoids duplication.
4. **Backend change: have `JourneyDuplicate` infer `teamId` from the authenticated user's last active team if omitted.** Rejected: scope creep, requires a migration of the mutation input type, and the client already knows the answer.

## Implementation Plan

1. **Add prop to `CopyToTeamDialog`** (`libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx`):
   - Add `defaultToActiveTeam?: boolean` to `CopyToTeamDialogProps` (defaults to `false`).
   - Destructure `activeTeam` from `useTeam()`.
   - Change `initialValues.teamSelect` to `(defaultToActiveTeam ? activeTeam?.id : undefined) ?? (teams.length === 1 ? teams[0].id : '')`.

2. **Wire `CreateJourneyButton`** (`libs/journeys/ui/src/components/TemplateView/CreateJourneyButton/CreateJourneyButton.tsx`):
   - Extend `JourneyForTemplate` to include `team?: { id: string } | null`.
   - Pass `defaultToActiveTeam={journeyDataToUse?.team != null && journeyDataToUse.team.id !== 'jfp-team'}` to `CopyToTeamDialog`.

3. **Update `CopyToTeamDialog.spec.tsx`**:
   - Three tests in a `defaultToActiveTeam prop` block: flag-on + active team resolved, flag-on + null active team, flag-off + active team resolved.
   - `beforeEach` clears `window.sessionStorage` to keep `TeamProvider` resolution clean across tests.

4. **Update `CreateJourneyButton.spec.tsx`**:
   - Three tests in a `defaultToActiveTeam wiring` block, each rendering `CreateJourneyButton` inside `<TeamProvider>` with a multi-team `GetLastActiveTeamIdAndTeams` mock and a different journey shape: `team.id !== 'jfp-team'` (pre-fill expected), `team.id === 'jfp-team'` (no pre-fill), `team: null` (no pre-fill). Each test inlines its own mocks because the outer `jest.clearAllMocks()` `beforeEach` resets `jest.fn()` implementations.

5. **No changes** to `CopyToTeamMenuItem` or `DuplicateJourneyMenuItem`.

6. **Run tests:**

   ```bash
   npx jest --config libs/journeys/ui/jest.config.ts --no-coverage \
     'libs/journeys/ui/src/components/CopyToTeamDialog'
   npx jest --config libs/journeys/ui/jest.config.ts --no-coverage \
     'libs/journeys/ui/src/components/TemplateView/CreateJourneyButton'
   npx jest --config apps/journeys-admin/jest.config.ts --no-coverage \
     'apps/journeys-admin/src/components/Team/CopyToTeamMenuItem'
   npx jest --config apps/journeys-admin/jest.config.ts --no-coverage \
     'apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DuplicateJourneyMenuItem'
   ```

7. **Lint & typecheck** the affected library:

   ```bash
   npx nx lint journeys-ui
   npx nx type-check journeys-ui
   ```

## Test Plan (manual)

| #   | Setup                                                                                                                                                                              | Expect                                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Log in as a user with ≥2 teams. Switch active team to Team A. From the home `?type=templates` view (Team Templates tab), click ⋮ on a team template → click **Use This Template**. | Team dropdown pre-selects **Team A** in the _Add Journey to Team_ dialog.             |
| 2   | From Scenario 1's state, navigate to a global JFP template (e.g. `/templates`) and click ⋮ → **Use This Template**.                                                                | Team dropdown is empty (unchanged behaviour for global templates).                    |
| 3   | Open any journey's ⋮ menu and click **Copy to ...**.                                                                                                                               | Team dropdown is empty (unchanged behaviour for cross-team copy).                     |
| 4   | While active team is Team A, open any journey's ⋮ menu and click **Duplicate**.                                                                                                    | Journey is duplicated directly onto Team A; no dialog appears (unchanged behaviour).  |
| 5   | Switch active team to **Shared with me**, then on a journey shared with you click ⋮ → **Duplicate**.                                                                               | The _Copy to Another Team_ dialog opens with an empty selector (unchanged behaviour). |
| 6   | Log in as a user with exactly one team. Repeat #1.                                                                                                                                 | Team dropdown is pre-selected with that single team (unchanged behaviour).            |

## Sources & References

### Internal references

- `libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx` — dialog now accepts `defaultToActiveTeam` and uses `useTeam().activeTeam` only when the flag is on.
- `libs/journeys/ui/src/components/TemplateView/CreateJourneyButton/CreateJourneyButton.tsx` — sets `defaultToActiveTeam` based on the source template's team.
- `libs/journeys/ui/src/components/TeamProvider/TeamProvider.tsx:36,221-224` — `useTeam()` hook and `activeTeam` derivation.
- `libs/journeys/ui/src/libs/useJourneyDuplicateMutation/useJourneyDuplicateMutation.ts:13-29` — mutation signature confirming client controls `teamId`.
- `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DefaultMenu/DefaultMenu.tsx:196-197` — `isLocalTemplate` definition we mirror in `CreateJourneyButton`.
- `apps/journeys-admin/src/components/Team/CopyToTeamMenuItem/CopyToTeamMenuItem.tsx` — "Copy to ..." caller; intentionally untouched.
- `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DuplicateJourneyMenuItem/DuplicateJourneyMenuItem.tsx` — "Duplicate" caller; intentionally untouched.

### External references

- Linear ticket: [NES-1601](https://linear.app/jesus-film-project/issue/NES-1601/set-dialog-default-to-current-team-when-using-team-templates)
- Slack source: [Lucinda Mason's ask](https://jfp-digital.slack.com/archives/C08GT3TGLDP/p1776956602585379) in `#nextsteps-feedback`, 2026-04-24.

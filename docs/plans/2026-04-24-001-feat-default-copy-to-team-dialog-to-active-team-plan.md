---
title: 'feat: Default Copy To Team Dialog to the active team'
type: feat
status: active
date: 2026-04-24
linear: NES-1601
---

# feat: Default Copy To Team Dialog to the active team

## Overview

When a user clicks **Use this Template** on a **TEAM Template** (or duplicates a journey) a shared `CopyToTeamDialog` opens. The team dropdown starts empty when the user has >1 team, forcing them to pick a team even though they are almost always copying into the team they are currently on. Default that dropdown to the user's **active team** (`useTeam().activeTeam`) so the common case becomes a single-click confirmation.

The change is **client-only**. No `api-journeys` changes. The existing `JourneyDuplicate` mutation already accepts `teamId` from the client.

## Problem Statement / Motivation

Lucinda Mason (reporting team member) surfaced this in `#nextsteps-feedback` on 2026-04-24: she creates many journeys from team templates for the WC, and the dialog's team dropdown being empty forces a pointless extra click each time. See Linear [NES-1601](https://linear.app/jesus-film-project/issue/NES-1601/set-dialog-default-to-current-team-when-using-team-templates) and Slack [thread](https://jfp-digital.slack.com/archives/C08GT3TGLDP/p1776956602585379).

Today the dropdown defaults to:

- the sole team's id, when the user has exactly one team
- the empty string, when the user has multiple teams — this is what forces the extra click

The `TeamProvider` (`libs/journeys/ui/src/components/TeamProvider/TeamProvider.tsx:36`) already resolves an `activeTeam` from URL param → session storage → DB `lastActiveTeamId`. The dialog just never consults it.

## Proposed Solution

In `libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx`:

1. Destructure `activeTeam` alongside the existing `query`/`setActiveTeam` pull from `useTeam()` (line 92).
2. Change the Formik `initialValues.teamSelect` (line 173) from `teams.length === 1 ? teams[0].id : ''` to `activeTeam?.id ?? (teams.length === 1 ? teams[0].id : '')`.
3. `enableReinitialize` is already enabled (line 177), so Formik re-initializes when `activeTeam` resolves from the async `GetLastActiveTeamIdAndTeams` query. No extra `useEffect`/`reset()` plumbing is needed.

### Why scope the change to "all uses of the dialog" rather than "team templates only"

The dialog is reused by:

- `apps/journeys-admin/src/components/Team/CopyToTeamMenuItem/CopyToTeamMenuItem.tsx` — copy template to team (works for both team templates and global templates)
- `apps/journeys-admin/src/components/**/DuplicateJourneyMenuItem` — duplicate journey

In every invocation the user is asking _"which team do I want this in?"_ and the correct presumptive answer is _"the team I am currently working in"_. Conditionally defaulting only for team templates would (a) require a new prop to carry "this is a team template" down to the dialog (the dialog currently has no signal for this — `journeyIsTemplate` is true for both team and global templates), and (b) leave global-template and duplicate flows with an unnecessarily empty dropdown. A single unconditional default is both simpler and better UX.

If the reviewer disagrees and wants the narrow scope only, the alternative in **Alternative Approaches Considered** describes the extra prop plumbing required.

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
- **API surface parity:** No mutation signature changes. Both callers (`CopyToTeamMenuItem`, `DuplicateJourneyMenuItem`) inherit the new default without code changes.
- **Integration test scenarios:** See **Acceptance Criteria** below; the new "multi-team user opens dialog" scenario is the one unit tests must cover.

## Acceptance Criteria

- [ ] `libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx` reads `activeTeam` from `useTeam()`.
- [ ] `initialValues.teamSelect` defaults to `activeTeam?.id` when truthy, else falls back to the existing `teams.length === 1 ? teams[0].id : ''`.
- [ ] When a multi-team user opens the dialog and has an `activeTeam`, the **Select Team** combobox already shows that team's title.
- [ ] When a multi-team user opens the dialog and `activeTeam` is `null` (shared view), the combobox is empty — same as today.
- [ ] Single-team users see no behavior change.
- [ ] No changes to `api-journeys` or any other backend.
- [ ] `CopyToTeamDialog.spec.tsx` updated to cover: (1) multi-team user with `activeTeam` → combobox pre-filled, (2) multi-team user with `activeTeam` null → empty, (3) existing "only 1 team" behavior preserved.
- [ ] Existing `CopyToTeamDialog.spec.tsx` and `CopyToTeamMenuItem.spec.tsx` suites still pass (may need small mock adjustments for `lastActiveTeamId`).
- [ ] Lint passes (`nx lint journeys-ui`) and typecheck passes (`nx typecheck journeys-ui`).

## Success Metrics

- Click-to-copy friction reduced by one click in the multi-team team-template flow (primary complaint).
- Zero regressions in the global-template copy flow and journey-duplicate flow.

## Dependencies & Risks

- **Dependency:** `TeamProvider` must be an ancestor of `CopyToTeamDialog`. Already the case in every invocation (journeys-admin wraps the admin shell in `TeamProvider`, and both `CopyToTeamMenuItem` and `DuplicateJourneyMenuItem` render inside it).
- **Risk:** A Jest test that previously asserted the combobox was empty after load (when `lastActiveTeamId` was set) could start failing. Grep for such assertions during implementation — plan research already catalogs the two relevant spec files.
- **Risk:** If a future caller mounts `CopyToTeamDialog` _outside_ a `TeamProvider`, `useTeam()` returns `{} as Context` (line 34 in `TeamProvider.tsx`) and `activeTeam` is `undefined`. The `?? fallback` chain handles this gracefully (behaves exactly like today). No regression.

## Alternative Approaches Considered

1. **Narrow to team templates only.** Would require passing a new `sourceJourneyTeamId` prop (or similar) from `CopyToTeamMenuItem` down to the dialog so it could toggle default behavior. Rejected: the broader default is strictly better UX in all call sites, and adding a prop purely to gate behavior adds dead weight.
2. **Default to `journey.team.id` (team that _owns_ the template) rather than `activeTeam.id`.** Rejected: Lucinda's ask is explicitly _"the team you are on"_, which is `activeTeam`. For team templates these usually coincide, but `activeTeam` is the true signal for "where the user is working right now."
3. **Move the default logic into `CopyToTeamMenuItem` / `DuplicateJourneyMenuItem` instead of the dialog.** Rejected: the dialog is the lowest common point for both call sites, and the logic is a one-liner — centralising in the dialog avoids duplication.
4. **Backend change: have `JourneyDuplicate` infer `teamId` from the authenticated user's last active team if omitted.** Rejected: scope creep, requires a migration of the mutation input type, and the client already knows the answer.

## Implementation Plan

Single pass, single commit:

1. **Edit dialog** (`libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx`):
   - Line 92: destructure `activeTeam` alongside `query`, `setActiveTeam`.
   - Line 173: replace `teamSelect: teams.length === 1 ? teams[0].id : ''` with `teamSelect: activeTeam?.id ?? (teams.length === 1 ? teams[0].id : '')`.

2. **Update tests** (`libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.spec.tsx`):
   - Add a test: "defaults to active team when user has multiple teams and a last active team" — mock `GetLastActiveTeamIdAndTeams` with two teams and `lastActiveTeamId: 'teamId2'`, assert the combobox shows `'Team Name Two'`.
   - Add a test: "defaults to empty when user has multiple teams and activeTeam is null" — mock with two teams and `lastActiveTeamId: null`, assert the combobox value is empty. (May need to mock session storage to avoid stale data leaking between tests.)
   - Existing single-team test remains unchanged.

3. **Run tests for the library:**

   ```bash
   npx jest --config libs/journeys/ui/jest.config.ts --no-coverage \
     'libs/journeys/ui/src/components/CopyToTeamDialog'
   ```

4. **Run caller tests to confirm no regression:**

   ```bash
   npx jest --config apps/journeys-admin/jest.config.ts --no-coverage \
     'apps/journeys-admin/src/components/Team/CopyToTeamMenuItem'
   ```

5. **Lint & typecheck** the affected library: `npx nx lint journeys-ui && npx nx typecheck journeys-ui`.

## Test Plan (manual)

| #   | Setup                                                                                                                                                              | Expect                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 1   | Log in as a user with ≥2 teams. Switch active team to Team A. Navigate to _Templates_ → open any team template → click **Use this Template** → (customize → Copy). | Team dropdown pre-selects **Team A**.                                              |
| 2   | Same as #1 but switch active team to the "Shared with me" view (`activeTeam === null`).                                                                            | Team dropdown is empty, user must pick.                                            |
| 3   | Same as #1 but use a _global_ (JFP) template.                                                                                                                      | Team dropdown pre-selects **Team A** (same improved behavior, acknowledged scope). |
| 4   | Log in as a user with exactly one team. Repeat #1.                                                                                                                 | Team dropdown pre-selects the single team (unchanged behavior).                    |
| 5   | Open any journey's **Duplicate** menu item while on Team A.                                                                                                        | Team dropdown pre-selects **Team A** (improved behavior in duplicate flow).        |

## Sources & References

### Internal references

- `libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx:92,173,177` — dialog default value and `enableReinitialize`.
- `libs/journeys/ui/src/components/TeamProvider/TeamProvider.tsx:36,221-224` — `useTeam()` hook and `activeTeam` derivation.
- `libs/journeys/ui/src/libs/useJourneyDuplicateMutation/useJourneyDuplicateMutation.ts:13-29` — mutation signature confirming client controls `teamId`.
- `apps/journeys-admin/src/components/Team/CopyToTeamMenuItem/CopyToTeamMenuItem.tsx` — template copy caller.
- `libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.spec.tsx` — existing unit tests.

### External references

- Linear ticket: [NES-1601](https://linear.app/jesus-film-project/issue/NES-1601/set-dialog-default-to-current-team-when-using-team-templates)
- Slack source: [Lucinda Mason's ask](https://jfp-digital.slack.com/archives/C08GT3TGLDP/p1776956602585379) in `#nextsteps-feedback`, 2026-04-24.

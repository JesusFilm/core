---
title: 'fix: Wire AI translation step in Copy-to-Team duplicate flow (NES-1636)'
type: fix
status: active
date: 2026-05-05
---

# fix: Wire AI translation step in Copy-to-Team duplicate flow (NES-1636)

## Summary

When a user copies a journey to another team via the 3-dot menu and enables the AI translation toggle, the journey is duplicated but never translated. The fix wires the existing `useJourneyAiTranslateSubscription` into `DuplicateJourneyMenuItem` so that — after `journeyDuplicate` resolves — the translation subscription is started using the user's selected language, mirroring the working pattern already in `TranslateJourneyDialog`.

---

## Problem Frame

The `CopyToTeamDialog` (a shared library component) already correctly forwards three values to its `submitAction` prop: target `teamId`, selected `language`, and the `showTranslation` boolean. The `DuplicateJourneyMenuItem` callsite, however, declares `handleDuplicateJourney(teamId?: string)` — accepting only the team id and silently dropping the language and translation flag. TypeScript does not flag this because a function with fewer parameters is structurally assignable to one with more. The dialog also defers its own auto-close to the consumer when translation is enabled (`CopyToTeamDialog.tsx:144`), so a Copy-to-Team flow with translation toggled on never closes via the duplicate path either — instead the user only sees the success snackbar from the duplicate, with no translated copy ever produced.

This is a regression-shape bug: the dialog API was extended to support translation (PR #6761) but the menu-item consumer was never updated to call the translate subscription.

---

## Requirements

- R1. Toggling the AI translation switch in the Copy-to-Team dialog and submitting MUST start the journey translation subscription against the duplicated journey.
- R2. Submitting Copy-to-Team WITHOUT the translation toggle must continue to behave exactly as today (duplicate only, success snackbar, dialog closes).
- R3. The same-team direct duplicate path (3-dot menu → Duplicate, no dialog) must remain untouched — translation never runs in that flow.
- R4. Translation progress UI from `TranslationDialogWrapper` must render while the subscription is running (the dialog already supports this via `translationProgress` + `isTranslating` props — they just need to be passed in).
- R5. Translation completion must close the dialog and refetch template stats when applicable, matching `TranslateJourneyDialog`'s `onComplete` behavior.
- R6. Translation failures must surface a snackbar without rolling back the already-duplicated journey, matching `TranslateJourneyDialog`'s `onError` behavior.

---

## Scope Boundaries

- Not touching `CopyToTeamDialog` — its API and form already support translation correctly.
- Not touching `journeyAiTranslate` schema or backend — backend already works; the `TranslateJourneyDialog` flow proves it.
- Not refactoring `TranslateJourneyDialog` for shared logic. A `useJourneyDuplicateAndTranslate` hook is tempting but premature: only two callsites, and they have different UX (separate Translate dialog vs combined Copy + Translate). Defer until a third callsite appears.
- Not changing the `GetAdminJourneys` GraphQL query — already includes `language.name` and `title`.

### Deferred to Follow-Up Work

- Extracting a shared `useJourneyDuplicateAndTranslate` hook between `DuplicateJourneyMenuItem` and `TranslateJourneyDialog`: deferred until a third consumer appears.

---

## Context & Research

### Relevant Code and Patterns

- **Bug site:** `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DuplicateJourneyMenuItem/DuplicateJourneyMenuItem.tsx` — `handleDuplicateJourney` accepts only `teamId` (line 41) and is wired as `submitAction` (line 121).
- **Dialog forwarding the dropped args:** `libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx` — `handleSubmit` calls `submitAction(values.teamSelect, values.languageSelect, values.showTranslation)` (lines 130-134) and skips its own auto-close when `showTranslation` is true (line 144).
- **Reference pattern (working flow):** `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/TranslateJourneyDialog/TranslateJourneyDialog.tsx` — full duplicate-then-translate sequence at lines 139-186, subscription wiring at lines 113-130, source language name derivation at line 159.
- **Subscription hook:** `libs/journeys/ui/src/libs/useJourneyAiTranslateSubscription/useJourneyAiTranslateSubscription.ts` — variables shape at lines 13-32; the hook also handles cache writes on each progress event.
- **Existing spec to extend:** `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DuplicateJourneyMenuItem/DuplicateJourneyMenuItem.spec.tsx` — already mocks `JOURNEY_DUPLICATE`, `GET_LANGUAGES`, `GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS`, and `UPDATE_LAST_ACTIVE_TEAM_ID`.

### Institutional Learnings

- `docs/solutions/best-practices/local-template-dialog-consolidation-patterns-nes1543.md` — covers admin dialogs that fire multiple journey mutations. Key takeaway for this plan: a translate failure after a successful duplicate must keep the duplicate, surface a snackbar, and not roll back. Mirror `TranslateJourneyDialog`'s exact `onError` shape so subscription/cache wiring stays consistent.

### External References

- None needed. The fix is a near-mechanical port of the proven `TranslateJourneyDialog` wiring into a callsite that's missing it.

---

## Key Technical Decisions

- **Mirror `TranslateJourneyDialog`'s subscription wiring rather than introducing a shared hook.** The subscription has six tightly-coupled pieces (state, hook, cache writes, onComplete, onError, progress passthrough). Two callsites do not justify abstracting yet — the callsites also differ structurally (one is a dedicated dialog, one is a menu-item that owns the dialog). Rationale: avoid premature abstraction; a future refactor will be cheaper if there's a third consumer to motivate the shape.
- **Drive `showTranslation` flag and language through the existing `submitAction` signature.** No prop or contract change is needed — the dialog already passes them; the consumer just needs to consume them.
- **Skip translation when journey, language, or activeTeam context is missing.** Match `TranslateJourneyDialog`'s `handleTranslate` early-return (line 140-145). Defensive against form-validation gaps.
- **Source language name derivation: read from `journey?.language.name` on the prop first, then fall back to `useJourney()` context.** The `GetAdminJourneys` query already returns `language { id, name { value, primary } }`, so the prop path covers the JourneyList card flow. Falling back to context covers any future caller that renders this menu item without passing `journey`.

---

## Open Questions

### Resolved During Planning

- **Does `GetAdminJourneys` expose journey language name?** Yes — confirmed at `apps/journeys-admin/src/libs/useAdminJourneysQuery/useAdminJourneysQuery.ts:8-50`. No GraphQL change required.
- **Should the same-team direct duplicate (no dialog) ever translate?** No — the in-team auto-duplicate path (lines 105-112) bypasses the dialog entirely; the user never sees a translation toggle, so showTranslation is implicitly false. Maintain the existing zero-arg call shape.

### Deferred to Implementation

- **Whether to also pass translation context up to `handleCloseMenu` timing.** The current `handleDuplicateJourney` calls `handleCloseMenu()` as soon as the duplicate succeeds (line 69). For the translate path, closing the menu wrapper before the subscription completes is fine (the dialog stays open via `TranslationDialogWrapper`'s loading state), but verify in implementation that closing the menu doesn't unmount the dialog and abort the subscription. If it does, defer `handleCloseMenu` until the subscription `onComplete` fires.

---

## Implementation Units

- U1. **Wire AI translation subscription into `DuplicateJourneyMenuItem`**

**Goal:** Make `handleDuplicateJourney` accept the language and translation flag, and after `journeyDuplicate` succeeds, start the AI translation subscription when the user opted in. Pass progress and translation state back into `CopyToTeamDialog` so the existing progress UI renders.

**Requirements:** R1, R2, R3, R4, R5, R6

**Dependencies:** None.

**Files:**

- Modify: `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DuplicateJourneyMenuItem/DuplicateJourneyMenuItem.tsx`
- Test: `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DuplicateJourneyMenuItem/DuplicateJourneyMenuItem.spec.tsx`

**Approach:**

- Update `handleDuplicateJourney` signature to `(teamId?: string, language?: JourneyLanguage, showTranslation?: boolean)`. Define `JourneyLanguage` locally (matching the shape used by `CopyToTeamDialog` and `TranslateJourneyDialog`) or import from a shared location if one exists.
- Capture the `journeyDuplicate` result so the new journey id is available: `const { data: duplicateData } = await journeyDuplicate({ ... })`.
- Add `translationVariables` state (the same shape as `TranslateJourneyDialog.tsx:64-75`).
- Add the `useJourneyAiTranslateSubscription` call with `variables: translationVariables`, `skip: translationVariables == null`, and `onError` / `onComplete` handlers that mirror `TranslateJourneyDialog.tsx:114-130`. `onComplete` should refetch template stats (when `fromTemplateId` is set) and call `handleCloseMenu` + close the dialog.
- After the duplicate resolves, branch:
  - If `showTranslation && language?.id && duplicateData?.journeyDuplicate?.id && journey?.language`: call `setTranslationVariables({ journeyId: duplicateData.journeyDuplicate.id, name: journey.title, journeyLanguageName: <derived>, textLanguageId: language.id, textLanguageName: language.nativeName ?? language.localName ?? '', userLanguageId: journey.language.id, userLanguageName: <derived> })`. Do NOT show the "Journey Copied" snackbar yet — let the subscription handle completion.
  - Else: keep the existing snackbar + `handleCloseMenu` path unchanged.
- Source-language-name derivation: pull from `journey?.language.name.find(({ primary }) => !primary)?.value ?? ''` (matches `TranslateJourneyDialog.tsx:159`). If `journey` prop is missing, fall back to `useJourney()` context, mirroring `TranslateJourneyDialog`.
- Pass `isTranslating={translationVariables != null}` and `translationProgress={...}` (built from the subscription's `data` per `TranslateJourneyDialog.tsx:200-209`) into the rendered `<CopyToTeamDialog>` so the dialog's existing progress UI displays.
- Preserve the existing `journey?.fromTemplateId` refetch logic — but invoke it only on successful completion (either the non-translate snackbar branch as today, or via the subscription `onComplete` for the translate branch).

**Execution note:** Verify each behavior change with the existing spec file's pattern before adding new tests. The existing tests must continue to pass unchanged (R2/R3).

**Patterns to follow:**

- `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/TranslateJourneyDialog/TranslateJourneyDialog.tsx` — full subscription + state + onComplete/onError shape.
- `libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx:32-44` — exact `submitAction` signature and `translationProgress` / `isTranslating` prop shape.

**Test scenarios:**

- _Happy path_ — Open Copy-to-Team dialog → select different team → toggle Translation on → select target language → submit. Mock `JOURNEY_DUPLICATE` to return a duplicated journey id, mock `JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION` to emit progress and complete. Assert: duplicate mutation runs once with `{id, teamId}`, subscription is called with `{journeyId: '<duplicatedId>', textLanguageId: '<selected>', name: '<journey title>', journeyLanguageName: '<source>', textLanguageName: '<target>', userLanguageId, userLanguageName}`, dialog closes after subscription completes, no error snackbar.
- _Happy path — translation off_ — Open Copy-to-Team dialog → select different team → leave Translation off → submit. Assert duplicate mutation runs once, subscription is NOT invoked, "Journey Copied" snackbar shows, dialog closes. (Existing test "should open copy to team dialog when on shared with me" already covers this — keep it green.)
- _Happy path — same-team direct duplicate_ — Click Duplicate menu item with an `activeTeam`. Assert: duplicate mutation runs, subscription is NOT invoked, "Journey Duplicated" snackbar shows, `handleCloseMenu` runs. (Existing test "should duplicate a journey on menu card click" already covers this — keep it green.)
- _Edge case — translation toggled on but no language selected_ — `CopyToTeamDialog`'s Yup schema already prevents submit; assert that the existing form-validation behavior still blocks the call (no `JOURNEY_DUPLICATE` mock should be consumed).
- _Error path — duplicate mutation fails_ — Mock `JOURNEY_DUPLICATE` to error. Assert: subscription is NOT invoked, "Failed to duplicate journey" snackbar shows, dialog stays open or closes per existing behavior, `handleCloseMenu` is NOT called.
- _Error path — translation subscription errors after a successful duplicate_ — Mock `JOURNEY_DUPLICATE` to succeed, mock subscription to call `onError`. Assert: duplicate succeeded (no rollback), error snackbar with the subscription error message shows, `translationVariables` is reset to `undefined`, loading state clears.
- _Integration — `fromTemplateId` refetch on translate completion_ — Render with `fromTemplateId="templateId123"`, run the happy-path translate flow. Assert `refetchTemplateStats` is called with `['templateId123']` after the subscription completes (mirroring the existing same-team test).
- _Integration — translation progress prop renders_ — While the subscription is mid-flight (emitted partial progress, not yet complete), assert that `CopyToTeamDialog` receives `isTranslating=true` and `translationProgress` matching the latest emission. Use `getByTestId('CopyToTeamDialog')` and the progress region surfaced by `TranslationDialogWrapper`.

**Verification:**

- `handleDuplicateJourney` accepts and uses the language + translation flag passed from the dialog.
- After `journeyDuplicate` succeeds with `showTranslation=true`, the AI translate subscription starts with the duplicated journey id and the user-selected target language.
- After `journeyDuplicate` succeeds with `showTranslation=false` (or the same-team direct path), no subscription is invoked and behavior is unchanged.
- Subscription completion closes the dialog, calls `handleCloseMenu`, and refetches template stats when applicable.
- Subscription error surfaces a snackbar without rolling back the duplicate.
- All existing tests in `DuplicateJourneyMenuItem.spec.tsx` continue to pass without modification.

---

## System-Wide Impact

- **Interaction graph:** This change is internal to one component plus its tests. The shared `CopyToTeamDialog` API is unchanged; the existing other consumer of `CopyToTeamDialog` (any publisher-side use, if present) is unaffected.
- **Error propagation:** Subscription errors are surfaced via `enqueueSnackbar` and reset local state. No global error boundary involvement. Cache writes inside `useJourneyAiTranslateSubscription` are best-effort and already wrapped in try/catch (`useJourneyAiTranslateSubscription.ts:154`).
- **State lifecycle risks:** The subscription must NOT start before `journeyDuplicate` resolves with a valid id; the `setTranslationVariables` call is gated on the duplicate response. If the user navigates away mid-translation, the subscription unsubscribes via component unmount — this matches `TranslateJourneyDialog`'s behavior and is acceptable: the duplicated journey is already created and the translation will continue server-side per the existing subscription contract.
- **API surface parity:** The other AI-translate entrypoint (`TranslateJourneyDialog`) uses the exact same hook with the same variables shape. After this fix, both entrypoints behave consistently.
- **Integration coverage:** The progress UI relies on prop-passing through `CopyToTeamDialog → TranslationDialogWrapper`. Pure unit tests with mocked subscription frames are sufficient to prove the wiring.
- **Unchanged invariants:** `useJourneyDuplicateMutation`, `JOURNEY_AI_TRANSLATE_CREATE_SUBSCRIPTION`, `CopyToTeamDialog`, and `TranslateJourneyDialog` are not modified. Same-team direct duplicate, "Journey Duplicated" / "Journey Copied" snackbars, and the `fromTemplateId` refetch behavior are preserved.

---

## Risks & Dependencies

| Risk                                                                                                                                                   | Mitigation                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Closing the menu (`handleCloseMenu`) before the subscription completes could unmount the component and cancel the in-flight translation client-side.  | During implementation, verify by exercising the happy path. If unmounting cancels the subscription, defer `handleCloseMenu` until `onComplete`. If the duplicate journey persists server-side regardless, leave as-is and note the behavior in QA scenarios.          |
| Subscribing with an unintended/empty `textLanguageName` would still fire the subscription against the backend.                                         | Mirror `TranslateJourneyDialog.tsx:167-168`'s fallback chain (`nativeName ?? localName ?? ''`) and gate the call on `language?.id` being defined. The `CopyToTeamDialog` Yup schema already requires `languageSelect.id` when `showTranslation` is true.               |
| Spec file growth: this component already has 5 long tests; adding 4-6 more could push the file over a maintainability threshold.                      | Acceptable. Keep helper mock builders DRY, reuse existing patterns. If the file gets unwieldy, extract a `__fixtures__` file in a follow-up — not in this PR.                                                                                                          |
| `useJourney()` context fallback may be unavailable in JourneyList card render path, leaving source-language name empty.                                | The `journey` prop already carries `language.name`; the `useJourney()` fallback is only for a hypothetical caller without a prop. If the prop is present (the JourneyList path), the fallback is never exercised. Mirror `TranslateJourneyDialog`'s fallback shape.   |

---

## Documentation / Operational Notes

- No user-facing docs to update. Internal product documentation already describes "Copy to Team with AI translation" as the intended capability — this change makes the feature actually work.
- No feature flag required: the code path was always intended to translate when the toggle is on. This is a bug fix, not a new feature.
- No migration or data backfill needed.
- Manual QA on Vercel preview should cover the three scenarios in the test plan: translation on (different team), translation off (different team), and same-team direct duplicate (no dialog).

---

## Sources & References

- Linear ticket: [NES-1636](https://linear.app/jesus-film-project/issue/NES-1636/ai-translation-does-not-work-when-copying-a-journey-to-another-team)
- Parent ticket: [NES-1601](https://linear.app/jesus-film-project/issue/NES-1601/set-dialog-default-to-current-team-when-using-team-templates) (PR #9074, separate fix in review)
- Reference implementation (working translate flow): `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/TranslateJourneyDialog/TranslateJourneyDialog.tsx`
- Subscription contract: `libs/journeys/ui/src/libs/useJourneyAiTranslateSubscription/useJourneyAiTranslateSubscription.ts`
- Dialog API: `libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx`
- Related PR (added translation toggle to `CopyToTeamDialog`, but never wired the consumer): #6761
- Institutional learning: `docs/solutions/best-practices/local-template-dialog-consolidation-patterns-nes1543.md`

---
title: 'feat: Add "Copy to collection" action to template cards in Collections (NES-1637)'
type: feat
status: active
date: 2026-05-21
---

# feat: Add "Copy to collection" action to template cards in Collections (NES-1637)

## Summary

Add a `"Copy to collection..."` menu item to template journey cards rendered inside a Collection. Clicking it opens a new admin-app `CopyToCollectionDialog` that lets the user pick a target collection (and optionally a translation language); on submit, the menu item runs `journeyDuplicate` → optional `useJourneyAiTranslateSubscription` → `templateGalleryPageAssignJourney` sequentially, with a single dialog-internal spinner across the whole pipeline. Gated by the `teamTemplateCollection` LaunchDarkly flag and an `InCollectionContext` so the item appears only when the host card is rendered inside a Collection.

---

## Problem Frame

The template gallery page (Local Template Library, NES-1539 / NES-1547) lets publishers organize templates into Collections. Today, publishers can drag templates between collections, but there is no way to **copy** a template — duplicating it as a new journey entity while keeping the source intact — without going through the cross-team "Copy to ..." flow, which is the wrong tool (cross-team) and ends up in the user's flat list instead of a chosen collection. The original scope of this ticket was a Collection-level "Share Again" (duplicating an entire collection); after engineering review, the work was narrowed to a per-journey "Copy to collection" action that reuses existing primitives and ships without backend work.

---

## Requirements

- R1. Add a `"Copy to collection..."` menu item to the journey card More menu when the card is rendered inside a Collection. The item must not appear on the same `JourneyCard` when rendered in any non-Collection context (active, archived, trashed, All Templates).
- R2. Gate the menu item with the `teamTemplateCollection` LaunchDarkly flag — when the flag is off, the item is not rendered at all (no placeholder, no spinner).
- R3. Clicking the item opens a new dialog containing: a single-select dropdown of the active team's collections (unfiltered — the source collection is included as a valid target), the same language picker + show-translation toggle as `CopyToTeamDialog`, and submit/cancel actions.
- R4. The dropdown empty state — zero collections in the active team — renders a disabled `"No collections available"` row; the submit button is disabled until a target is selected.
- R5. Submitting runs the pipeline `journeyDuplicate(id, teamId: activeTeamId, forceNonTemplate: false, duplicateAsDraft: false)` → (if translation toggled on) `useJourneyAiTranslateSubscription` to completion → `templateGalleryPageAssignJourney(journeyId: newJourneyId, pageId: targetCollectionId)`.
- R6. The entire pipeline is shown to the user as a single dialog-internal spinner — the streaming translation progress is hidden behind a generic "Translating…" state with no per-block progress bar.
- R7. On success, the dialog swaps its submit button for a `Done` button; the target Collection card's `templates` list updates without a hard refresh, and the new card is visible inside the chosen collection.
- R8. On `journeyDuplicate` failure, the dialog shows `"Failed to copy the journey. Please try again."` with a `Done` button; no rollback (nothing was created).
- R9. On translation subscription failure, the pipeline stops (no `assignJourney` call); the dialog shows `"An error occurred while translating."` with a `Done` button; no rollback. The new journey is reachable in All Templates after a `GetAdminJourneys` refetch.
- R10. On `templateGalleryPageAssignJourney` failure (with or without translation), the dialog shows `"Failed to add the copy to the collection. You'll find it in All Templates — drag it into the collection from there."` with a `Done` button; no rollback. The new journey is reachable in All Templates after a `GetAdminJourneys` refetch. (Contingency: if pre-implementation verification shows drag-from-All-Templates is not supported, soften the message to `"Failed to add the copy to the collection. The copy is in All Templates."` and file a follow-up to either enable drag-from-All-Templates or surface a manual retry path.)
- R11. The new menu item must integrate with `GalleryDialogLockContext` via the existing `setHasOpenDialog` prop pattern so DnD on the gallery page pauses while the dialog is open.
- R12. The dialog must remain mounted across the full pipeline; user-initiated close mid-pipeline is allowed and uses the `mountedRef`/`guardedClose` pattern from NES-1539/NES-1543 to avoid setState-after-unmount.

---

## Scope Boundaries

- No backend changes — `journeyDuplicate`, `journeyAiTranslateCreateSubscription`, and `templateGalleryPageAssignJourney` are used as they exist on `main` at the worktree's base commit.
- No rollback at any failure stage — matches the existing `CopyToTeamMenuItem` behavior.
- No cross-team copy — the existing `CopyToTeamMenuItem` ("Copy to ...") is unchanged.
- No custom-domain gating — verified absent in the current Collection flow.
- No metadata editing during the copy (title, description, language source, etc. are not editable on the source journey).
- No collection-level "Share Again" / bulk template duplication (the original ticket scope, now split).
- The new dialog is not added to the shared `libs/journeys/ui/` package — it is admin-app-specific and lives under `apps/journeys-admin/`. Promotion to the shared lib is a follow-up if another consumer needs it.

### Deferred to Follow-Up Work

- Collection-level "Share Again" / bulk-template duplication: separate ticket to be scoped.
- Rollback on translation failure (also a latent gap in `CopyToTeamMenuItem` since neither path rolls back today): separate ticket — would also fix the existing team flow for consistency.
- `templateGalleryPageAssignJourney` optimistic response improvements: noted in NES-1539 learnings (Pattern 11); current behavior is sufficient for this plan because the byte-identical selection auto-updates the target page's `templates` field via Apollo's normalized merge.

---

## Context & Research

### Relevant Code and Patterns

- `apps/journeys-admin/src/components/Team/CopyToTeamMenuItem/CopyToTeamMenuItem.tsx` — closest analogue. Mirror its shape: `setHasOpenDialog` prop wiring, `useState`-gated translation subscription via `translationVariables`, snackbar on success/error, dialog stays open while pipeline runs.
- `libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx` — visual reference for Formik + Yup + `TranslationDialogWrapper` composition. Do **not** reuse: it has hard-coded `useTeam` and `UPDATE_LAST_ACTIVE_TEAM_ID` side effects that do not apply here.
- `libs/journeys/ui/src/components/TranslationDialogWrapper/` — directly reusable shell. Provides Dialog scaffold, submit/cancel, loading wiring, and the translating-state slot.
- `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DefaultMenu/DefaultMenu.tsx` — host menu where the new item attaches. The existing `CopyToTeamMenuItem` is rendered here (around the `!isLocalTemplate` gate); the new item attaches adjacent to it with its own gate (`teamTemplateCollection` flag && `InCollectionContext` provided).
- `apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx` — the page that wraps Collection grids and All-Templates in `GalleryDialogLockContext`. The new `InCollectionContext` provider belongs INSIDE the Collection-grid mapping, NOT around the All-Templates grid.
- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionCard/CollectionCard.tsx` — possible alternative location for the `InCollectionContext.Provider` (around the children slot that ultimately renders `DraggableJourneysGrid`). Either site is acceptable; pick whichever has the smallest blast radius after reading the host file.
- `apps/journeys-admin/src/libs/useTemplateGalleryPagesQuery/useTemplateGalleryPagesQuery.ts` — sources the collection dropdown options. Returns `{ id, title, … }` per page.
- `apps/journeys-admin/src/libs/useTemplateGalleryPageAssignJourneyMutation/useTemplateGalleryPageAssignJourneyMutation.ts` — already exposes a byte-identical selection of the target page; Apollo's normalized cache merge handles the visual update of `CollectionCard.templates` for the target. No `update` callback or `refetchQueries` needed on this mutation specifically; the gap is on the `journeyById` derived map (see Key Technical Decisions).
- `libs/journeys/ui/src/libs/useJourneyDuplicateMutation/useJourneyDuplicateMutation.ts` — its `update` callback explicitly skips reads where `where.template === true`, which is the read shape the gallery page uses for its `journeyById` map. This is the central cache hazard for this plan.
- `libs/journeys/ui/src/libs/useJourneyAiTranslateSubscription/` — used as awaitable plumbing via the existing `onComplete`/`onError` callback shape. The `onData` callback already writes translation results into the cache automatically — consumer `onData` runs after the cache write.
- `apps/journeys-admin/src/components/TemplateGalleryPageList/useCollectionMutations/` — reference for collection-affecting mutation orchestration; encodes the optimistic-response / cache-shape conventions established by NES-1539.
- `apps/journeys-admin/src/components/MenuItem/MenuItem.tsx` — shared menu-item presentation; consumed via `label`, `icon`, `onClick`, `testId`.

### Institutional Learnings

- `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md` — Patterns 1 (`cache.updateQuery` over `cache.modify` for prepends), 2 (drop `enableReinitialize`; remount via `key={journey.id}`), 3 (`mountedRef` + `guardedClose`, with setup-body flip of `mountedRef.current = true`), 5 (lift busy flag for DnD interplay), 8 (extract orchestration into a hook when components grow past ~600 lines), 9 (UX vocabulary "Collection", backend vocabulary `TemplateGalleryPage`), 11 (assign mutation cache strategy), 18 (re-apply status predicate on client when reading cached lists).
- `docs/solutions/best-practices/local-template-dialog-consolidation-patterns-nes1543.md` — Patterns 3 (no `enableReinitialize` when a subscription is in scope; the team translation flow has caused silent dirty-state resets), 5 (hoist mutations to `apps/journeys-admin/src/libs/use<Mutation>Mutation/`; already done here, just reuse), 6 (`DialogJourney` shape + self-bridged provider when the dialog runs outside `JourneyProvider`), 7 (`testId` prop, not `data-testid` on the shared Dialog), 8 (verify automated suggestions against codebase conventions).
- `docs/solutions/runtime-errors/yoga-response-cache-null-stickiness-and-zombie-process-debugging-nes1644.md` — `TemplateGalleryPage.templates` is normalized as `TemplateGalleryItem:<id>` refs while `journeyDuplicate` returns `Journey:<id>`. If a manual `cache.modify` on `templates` is ever added, the typename gap will silently break it. The plan relies on the assign mutation's response shape and does not write to `templates` by hand, so this is a hazard to be aware of, not an active concern.
- `docs/solutions/logic-errors/response-cache-empty-list-invalidation-2026-05-10.md` — `Query.templateGalleryPage(s)` are pinned TTL 0 in `apis/api-journeys-modern/src/yoga.ts`; do not add a TTL while implementing.

### External References

- None. Local patterns are well-established for every primitive used here; external research adds no value.

---

## Key Technical Decisions

- **Build a new `CopyToCollectionDialog`, do not refactor `CopyToTeamDialog`.** `CopyToTeamDialog` has team-specific side effects (`useTeam`, `UPDATE_LAST_ACTIVE_TEAM_ID`) baked into its submit handler and form schema. Genericizing it would touch shared-lib code consumed by both `journeys-admin` and `journeys`, expanding blast radius. The new admin-app dialog composes the already-extracted shared primitives (`TranslationDialogWrapper`, `LanguageAutocomplete`, `useLanguagesQuery`, `SUPPORTED_LANGUAGE_IDS`) directly.
- **Gate the new menu item with an `InCollectionContext`, provided only inside `CollectionCard`'s children slot.** `JourneyCard` is reused across at least five contexts (`ActiveJourneyList`, `ArchivedJourneyList`, `TrashedJourneyList`, All-Templates, Collections); a context-based gate is purely additive (no prop-signature changes through `JourneyCard → JourneyCardMenu → DefaultMenu`) and read at the menu-item site via a `useInCollection()` hook returning `true`/`false`. `useGalleryDialogLock` was considered and rejected because the existing lock provider wraps both the Collections grid and the All-Templates grid, so it cannot distinguish the two contexts.
- **After assign success or failure, refetch `GetAdminJourneys`.** `useJourneyDuplicateMutation`'s built-in cache `update` deliberately skips reads where `where.template === true`, so the new journey is invisible to `TemplateGalleryPageList`'s `journeyById` map (built from `template: true` adminJourneys). Without a refetch, the new card silently fails to render even after a successful assign. The same refetch covers orphan recovery when the assign step fails — the user can find the new copy under "All Templates" and drag it manually.
- **Pipeline stops on translation failure; assign does not run.** If the user toggled translation on, they signaled intent for a translated copy. Continuing to assign an untranslated copy into their chosen collection would silently substitute the wrong thing. Stopping the pipeline leaves an untranslated journey in their flat list (after the refetch), which is the same recovery story as an assign failure — drag or delete.
- **Single spinner UX; the subscription is plumbing.** Hide the streaming translation progress behind a generic "Translating…" indicator in the dialog. The subscription is consumed via `onComplete`/`onError`; intermediate `onData` frames are ignored by the menu item (Apollo's auto-cache-write still happens for the translated fields). This avoids re-creating the team-copy progress UX in a flow where the dialog state is already complex enough.
- **Place the new dialog and menu-item components under `apps/journeys-admin/src/components/TemplateGalleryPageList/`.** They are admin-app-specific (use admin-app query hooks and live close to their only call site). Co-locating them with the gallery-page list reduces import churn and keeps the gallery-page surface area cohesive. Promote to `libs/journeys/ui/` only if a second consumer ever appears.
- **`mountedRef` + `guardedClose` in the menu item.** The orchestration awaits multiple async steps; mid-pipeline unmount (user closes dialog or navigates away) must not setState on an unmounted component. Per NES-1539 Pattern 3, the setup-body must flip `mountedRef.current = true` (not only the cleanup), to avoid the Next.js dev/StrictMode trap where the cleanup runs once and `mountedRef.current` is permanently false.
- **Sequential pipeline, not `Promise.all`.** Each step depends on the previous one (`assignJourney` needs the new journey ID; translation needs the new journey ID). `Promise.allSettled` is the wrong shape for chained dependencies.
- **No `enableReinitialize` on the Formik form.** Per NES-1543 Pattern 3, subscription-driven Apollo cache updates can land mid-edit and silently reset `initialValues`. The form fields here are user-only inputs (target collection, language, toggle), not journey fields, so structurally this isn't load-bearing, but staying consistent avoids future drift.

---

## Open Questions

### Resolved During Planning

- **Reuse or build new dialog?** Build new — `CopyToTeamDialog`'s team side effects make safe genericization a shared-lib refactor that exceeds this ticket.
- **Custom-domain gating?** No — verified that the current Collection flow has no custom-domain handling; NES-1644 hook applies only to the publish-page flow.
- **Rollback on failure?** No, at any stage — matches the existing `CopyToTeamMenuItem` behavior. Surface error in the dialog; the user can find the orphan in All Templates after the refetch.
- **Translation progress UX?** Hidden behind a single "Translating…" state — no per-block streaming UI in this flow.
- **Filter source collection from the dropdown?** No — the source is allowed as a target (backend's single-membership rule is per-journey, so the new duplicate ID coexists with the original in the same collection).
- **Cache update strategy for the new journey appearing in the target Collection card?** Assign mutation's byte-identical selection auto-updates `TemplateGalleryPage.templates`; `refetchQueries({ include: ['GetAdminJourneys'] })` after assign fills the `journeyById` map so the templates entry resolves to a visible card.
- **Where to place the new components?** Under `apps/journeys-admin/src/components/TemplateGalleryPageList/` — admin-app-specific, co-located with the gallery-page surface.

### Deferred to Implementation

- **Exact location of the `InCollectionContext.Provider`** — `CollectionCard.tsx` or `TemplateGalleryPageList.tsx`'s Collection-grid mapping. Pick the site with the smallest blast radius after reading both.
- **Whether to extract the orchestration into a `useCopyToCollection` hook** — if the menu item file approaches the ~600-line threshold flagged by NES-1539 Pattern 8, extract; otherwise keep the orchestration inline.
- **i18n string finalization** — error messages are user-facing; final copy may be reviewed by the team, but the messages listed in R8–R10 are the working draft.
- **Whether to add a Storybook story** — optional per `AGENTS.md`; `CopyToTeamDialog.stories.tsx` exists as a precedent. Add if low-cost.
- **`refetchQueries(['GetAdminJourneys'])` observable verification** — confirm in a running session that the gallery page's `template: true` query is the observable hit by the refetch (Apollo DevTools or `client.getObservableQueries()` debug log). If not, fall back to `cache.updateQuery` on the specific variant per NES-1539 Pattern 1.
- **Drag-from-All-Templates recovery verification** — confirm that the gallery page supports drag from the All-Templates list into a Collection. If not, apply R10's contingency copy and file a follow-up.
- **Translation subscription error semantics** — investigate whether `onError` distinguishes transient SSE drops from terminal translation failures. Consider a single silent retry before showing the terminal error if a transient-class signal is identifiable.

---

## Implementation Units

- U1. **`InCollectionContext` and provider wiring**

**Goal:** Introduce a small admin-app-internal React context that signals "this subtree is rendered inside a Collection card." Provide the context only inside the Collection-grid path so the All-Templates path leaves it undefined. Consumed by the new menu item to gate its rendering.

**Requirements:** R1 (infrastructure; gate applied in U4)

**Dependencies:** None

**Files:**

- Create: `apps/journeys-admin/src/components/TemplateGalleryPageList/InCollectionContext/InCollectionContext.ts`
- Create: `apps/journeys-admin/src/components/TemplateGalleryPageList/InCollectionContext/index.ts`
- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionCard/CollectionCard.tsx` _or_ `apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx` (whichever site cleanly wraps only the Collection-grid path's `DraggableJourneysGrid`; do not wrap the All-Templates grid)
- Test: `apps/journeys-admin/src/components/TemplateGalleryPageList/InCollectionContext/InCollectionContext.spec.tsx`

**Approach:**

- The context exposes a `useInCollection()` hook returning `true` when the consuming component is under the provider, `false` (or `undefined` coerced to `false`) otherwise.
- The provider is placed once, inside the Collection-grid mapping in the gallery page — the exact host (CollectionCard children slot vs. TemplateGalleryPageList) is an implementation-time decision based on the smaller diff.
- The context is admin-app-internal; do not export from `libs/journeys/ui/`.

**Patterns to follow:**

- `apps/journeys-admin/src/components/TemplateGalleryPageList/GalleryDialogLockContext.ts` for the file shape and naming.

**Test scenarios:**

- Happy path: `useInCollection` returns `true` when the consumer is rendered inside the provider.
- Happy path: `useInCollection` returns `false` when the consumer is rendered outside any provider (no provider in the subtree).
- Edge case: nesting two providers should not throw; the closest provider's value wins (standard React context semantics — assert non-throw and the deepest-value behavior).

**Verification:**

- `useInCollection` returns `true` only when a parent component has rendered the provider. Existing All-Templates and non-Collection list views are unaffected (the hook returns `false` there).

---

- U2. **`CopyToCollectionDialog` component**

**Goal:** Build the dialog the menu item opens. Mirrors `CopyToTeamDialog` visually but is admin-app-specific, source-team-only, and replaces the team picker with a collection picker sourced from `useTemplateGalleryPagesQuery`.

**Requirements:** R3, R4, R6, R7

**Dependencies:** None (the menu item in U3 will consume it but the dialog can be built and tested independently against mocked submit handlers)

**Files:**

- Create: `apps/journeys-admin/src/components/TemplateGalleryPageList/CopyToCollectionDialog/CopyToCollectionDialog.tsx`
- Create: `apps/journeys-admin/src/components/TemplateGalleryPageList/CopyToCollectionDialog/index.ts`
- Create: `apps/journeys-admin/src/components/TemplateGalleryPageList/CopyToCollectionDialog/CopyToCollectionDialog.spec.tsx`
- Optional: `apps/journeys-admin/src/components/TemplateGalleryPageList/CopyToCollectionDialog/CopyToCollectionDialog.stories.tsx` (low-cost; add if matching `CopyToTeamDialog.stories.tsx`)

**Approach:**

- Compose `TranslationDialogWrapper` for the dialog shell, submit/cancel buttons, and loading state.
- Formik form with three fields: `collectionSelect: string`, `languageSelect?: JourneyLanguage`, `showTranslation: boolean`. Yup schema requires `collectionSelect` always; requires `languageSelect` only when `showTranslation === true` (same conditional shape `CopyToTeamDialog` uses).
- Do **not** set `enableReinitialize` on Formik. `CopyToTeamDialog` currently sets `enableReinitialize` (around line 169 at the time of writing) — **do not carry that prop across**. Per NES-1543 Pattern 3, a subscription-driven Apollo cache write can land mid-edit and silently reset `initialValues`. If parent props change (e.g., a journey-id remount is needed), the parent should remount via `key={journey.id}` instead — per NES-1539 Pattern 2.
- Collection dropdown is a single-select MUI `TextField select` populated from `useTemplateGalleryPagesQuery({ teamId: activeTeam?.id ?? '' }, { skip: activeTeam?.id == null })`. Each option is `<MenuItem value={page.id}>{page.title}</MenuItem>`. The `skip` arm covers the edge case where the active team is null (team-switcher async load, lost access mid-session); treat the skipped state as "no options + disabled submit," distinct from a genuine zero-pages empty state.
- Empty state: when the query returns zero pages, render a single disabled `<MenuItem disabled>No collections available</MenuItem>` and disable the submit button via Formik validity (no `collectionSelect` value possible).
- Loading state of the gallery-pages query: while loading (and while `skip` is active), render a single disabled `<MenuItem disabled>Loading…</MenuItem>` and disable the submit button. The disabled-item treatment matches the empty-state visual rhythm and is simpler than a skeleton row.
- Translation toggle + language picker: copy the `Switch` + `LanguageAutocomplete` block from `CopyToTeamDialog`. Toggle label is `"Translate the copy to another language"` (no team-specific wording; describes the action in context). Use `SUPPORTED_LANGUAGE_IDS` and `useLanguagesQuery({ languageId: '529', where: { ids: [...SUPPORTED_LANGUAGE_IDS] } })`.
- Pass-through props from the menu item: `open`, `loading`, `errorMessage?: string`, `done?: boolean` (success state — submit button is swapped for Done), `onClose`, `onSubmit({ collectionId, language?, showTranslation })`, and the journey title for the dialog header copy.
- When `errorMessage` is set, the dialog body renders the message in place of the spinner; the action area shows a single `Done` button bound to `onClose`. When `done === true`, the dialog body renders success copy `"Copied to {collectionTitle}."` (echoes the target back so the user sees confirmation of the right destination), and the action area shows a single `Done` button.
- **Submit button disabled state** — disabled when `loading === true || done === true || errorMessage != null || formik invalid || query is skipped/loading/empty`. This covers the concurrent-submit guard at the UI layer (the orchestration layer in U3 adds a defensive single-flight guard as well).
- **Accessibility:**
  - Initial focus when the dialog opens lands on the collection dropdown (the first interactive field).
  - On Done / close, focus returns to the triggering card's More menu button — coordinate via the `onClose` callback chain so the parent menu can refocus its trigger.
  - Terminal state transitions (success / error) render inside a region with `role="status"` or `aria-live="polite"` so screen readers announce the transition without focus movement.
- Use the shared `Dialog`'s `testId` prop, not `data-testid` (per NES-1543 Pattern 7). Suggested: `testId="CopyToCollectionDialog"`.
- Use `useTranslation('apps-journeys-admin')` for all user-facing strings.

**Patterns to follow:**

- `libs/journeys/ui/src/components/CopyToTeamDialog/CopyToTeamDialog.tsx` — Formik shape, Yup schema, language-picker block, `TranslationDialogWrapper` composition.
- `apps/journeys-admin/src/libs/useTemplateGalleryPagesQuery/` — collection dropdown source.

**Test scenarios:**

- Happy path: renders with a closed initial state when `open: false`; renders the dropdown with N collections when `open: true` and the query returns N pages.
- Happy path: selecting a collection enables the submit button; clicking submit calls `onSubmit({ collectionId, language: undefined, showTranslation: false })`.
- Happy path: toggling translation on reveals the language picker; selecting a language and submitting passes `language` and `showTranslation: true` to `onSubmit`.
- Happy path: initial focus on open lands on the collection dropdown; on Done/close, focus returns to the triggering button (test via `userEvent.tab()` or the focus-trap assertion).
- Happy path: on `done === true`, the dialog body shows `"Copied to {selectedCollectionTitle}."` echoing the chosen target.
- Edge case: when `useTemplateGalleryPagesQuery` returns zero pages, the dropdown shows a disabled `"No collections available"` row and the submit button is disabled.
- Edge case: when `useTemplateGalleryPagesQuery` is loading OR `skip`-arm is active (null active team), the dropdown shows a disabled `"Loading…"` row and the submit button is disabled.
- Edge case: source collection is present in the dropdown options (no filtering); the dialog does not enforce a "different collection" constraint.
- Edge case: when `showTranslation` is true but no language is selected, the submit button is disabled (Yup validation).
- Edge case: rapid double-click on submit (before `loading` flushes) fires `onSubmit` only once — the button disables on the first click via the `loading || done || errorMessage` gate.
- Error path: when `errorMessage` prop is set, the spinner is replaced with the error text in a `role="status"` / `aria-live="polite"` region and the action area shows a single `Done` button bound to `onClose`.
- Error path: when `done` prop is `true`, the body shows success copy in a `role="status"` / `aria-live="polite"` region and the action area shows a single `Done` button.
- Error path: when `loading` prop is `true`, no buttons fire on click (submit and close are disabled or no-op).
- Integration: closing the dialog mid-loading does not call `onSubmit` again; `onClose` is the only path out.

**Verification:**

- The dialog renders, validates, and surfaces the three terminal states (loading, error, done) without depending on the menu item's orchestration logic. All branches are exercised through props alone.

---

- U3. **`CopyToCollectionMenuItem` component (orchestration)**

**Goal:** The menu item that mounts the dialog and orchestrates the three-step pipeline. Owns the `journeyDuplicate` call, the optional translation subscription, the `templateGalleryPageAssignJourney` call, and the post-pipeline `GetAdminJourneys` refetch. Surfaces results into the dialog as `loading`, `errorMessage`, and `done`.

**Requirements:** R5, R6, R7, R8, R9, R10, R11, R12

**Dependencies:** U2 (dialog), U1 (context — consumed at the call site in U4 but defined here as a peer surface)

**Files:**

- Create: `apps/journeys-admin/src/components/TemplateGalleryPageList/CopyToCollectionMenuItem/CopyToCollectionMenuItem.tsx`
- Create: `apps/journeys-admin/src/components/TemplateGalleryPageList/CopyToCollectionMenuItem/index.ts`
- Create: `apps/journeys-admin/src/components/TemplateGalleryPageList/CopyToCollectionMenuItem/CopyToCollectionMenuItem.spec.tsx`

**Approach:**

- Component shape mirrors `CopyToTeamMenuItem`: renders the shared `MenuItem` (label, icon, `onClick`, `testId="CopyToCollection"`) plus the `CopyToCollectionDialog` it controls.
- Props: `id?: string`, `journey?: Journey`, `handleCloseMenu: () => void`, `setHasOpenDialog?: (open: boolean) => void`, `handleKeepMounted?: () => void` — same shape as `CopyToTeamMenuItem` for symmetry. The optional `setHasOpenDialog` is wired by the parent `JourneyCard` chain (same as the team flow); we rely on the parent to provide it rather than enforcing it at this layer.
- Internal state: `dialogOpen: boolean`, `loading: boolean`, `errorMessage: string | null`, `done: boolean`, `translationVariables: TranslationVars | null`, `pendingTargetCollectionId: string | null`, `mountedRef: useRef(false)`.
- `mountedRef` initialization runs in a `useEffect` whose setup body sets `mountedRef.current = true` and cleanup sets it `false` — per NES-1539 Pattern 3.
- `guardedClose(reason: 'cancel' | 'done')`: gated by `mountedRef.current`; resets dialog state, calls `setHasOpenDialog?.(false)` and `handleCloseMenu()` only when truthy.
- **Callback-driven orchestration (not awaitable).** `useJourneyAiTranslateSubscription` is `useSubscription`-based — its terminal signal is the `onComplete` callback, not a Promise. Mirror `CopyToTeamMenuItem`'s shape by splitting orchestration in two halves:
  - `handleSubmit({ collectionId, language?, showTranslation? })`:
    1. **Single-flight guard.** Early return if `loading === true` — UI already disables the submit button (per U2), this is the defensive belt-and-braces against React render timing on rapid double-clicks.
    2. **Active-team guard.** Capture `const teamId = activeTeam?.id` once at the top. If null, set `errorMessage` to a "no active team" copy and exit before any mutation runs. (This converts a runtime NPE into a recoverable UI state.)
    3. Set `loading: true`. `setHasOpenDialog?.(true)` was already flipped on dialog open; no change.
    4. `await journeyDuplicate({ variables: { id: journey.id, teamId } })`. On throw, set `errorMessage` to the duplicate-fail copy and exit. No rollback. No refetch (nothing was created).
    5. Capture `newJourneyId` and `targetCollectionId` into refs / state so the second half can read them without re-deriving from Formik (which may be torn down by the time the subscription completes).
    6. If `showTranslation && language`: set `translationVariables` to arm the subscription. **Exit `handleSubmit`** — the subscription's `onComplete` will fire `runAssign`. Otherwise, call `runAssign(newJourneyId, targetCollectionId)` directly.
  - `runAssign(newJourneyId, targetCollectionId)`:
    1. `await templateGalleryPageAssignJourney({ variables: { journeyId: newJourneyId, pageId: targetCollectionId } })`. On throw, `refetchQueries({ include: ['GetAdminJourneys'] })` and set `errorMessage` to the assign-fail copy. On success, `refetchQueries({ include: ['GetAdminJourneys'] })` and set `done: true`. All setState calls gated by `mountedRef.current`.
  - The translation subscription is wired via `useJourneyAiTranslateSubscription({ variables: translationVariables, skip: !translationVariables, onComplete, onError })`. `onComplete` calls `runAssign(newJourneyId, targetCollectionId)`. `onError` calls `refetchQueries({ include: ['GetAdminJourneys'] })` (so the orphan is visible in All Templates) and sets `errorMessage` to the translation-fail copy.
- Every setState inside an async callback or subscription handler is gated by `mountedRef.current` to avoid setState-after-unmount.
- Snackbars are NOT used for terminal errors — the dialog body owns the error state per R8–R10. Snackbars MAY be used for the success case if it improves discoverability (optional; default is the in-dialog success copy + Done).
- Use `useTeam` for `activeTeam` and read `activeTeam?.id` defensively (capture once at submit, then pipe through the pipeline; mid-flight team-switch keeps the pipeline against the submit-time team).
- **`refetchQueries({ include: ['GetAdminJourneys'] })` strategy.** This refetches every active `GetAdminJourneys` observable regardless of variables. The architectural assumption is that when this menu item fires, the gallery page (which mounts `GetAdminJourneys` with `where: { template: true }`) is the active surface — because the menu item is gated to `useInCollection() === true`, which is only provided inside the gallery page. Therefore the `template: true` variant is the observable getting refreshed, and `journeyById` repopulates with the new entry. **Verification step:** during implementation, confirm in a running session that the `template: true` query is the observable hit by the refetch — open the gallery page, run the copy flow, and check Apollo DevTools (or a `client.getObservableQueries()` debug log) to see which `GetAdminJourneys` instances exist at refetch time.
- **Drag-from-All-Templates recovery verification.** R10's recovery copy ("drag it into the collection from there") assumes the gallery page supports drag-FROM the All-Templates flat list INTO a Collection. Before merging, manually verify this drag direction works in the gallery page UI. If it does NOT work, apply the R10 contingency copy (`"Failed to add the copy to the collection. The copy is in All Templates."`) and file a follow-up to either enable the missing drag direction or add a manual "retry assign" affordance on the orphan.

**Execution note:** Implement orchestration test-first. The three-step pipeline + three terminal error states + done state is the riskiest part of the change; lean on tests to lock the state machine before threading it through the menu/dialog.

**Technical design:**

> _This illustrates the intended pipeline shape and is directional guidance for review, not implementation specification._

```
handleSubmit({ collectionId, language?, showTranslation? }):
  if loading: return                            // single-flight guard
  teamId = activeTeam?.id
  if teamId == null:
    setError(noActiveTeamCopy); return          // null guard
  setLoading(true)
  newJourneyId <- await journeyDuplicate(journey.id, teamId)
    on throw: setError(duplicateFailCopy); return       // no rollback
  pendingTargetCollectionId = collectionId
  if showTranslation && language:
    setTranslationVars({ journeyId: newJourneyId, ...langArgs })
    return                                              // exit; onComplete fires runAssign
  runAssign(newJourneyId, collectionId)

runAssign(newJourneyId, targetCollectionId):
  await templateGalleryPageAssignJourney(newJourneyId, targetCollectionId)
    on throw: refetch(GetAdminJourneys); setError(assignFailCopy); return
  refetch(GetAdminJourneys)
  setDone(true)

// wired via useJourneyAiTranslateSubscription({ variables: translationVariables, skip: !translationVariables, … })
onComplete (subscription terminates):
  if mountedRef: runAssign(newJourneyId, pendingTargetCollectionId)

onError (subscription error — terminal-vs-transient unverified at plan time):
  if mountedRef:
    refetch(GetAdminJourneys)
    setError("An error occurred while translating.")

dialog close (via Done or Cancel):
  guardedClose -> reset state, setHasOpenDialog?.(false), handleCloseMenu()
```

**Patterns to follow:**

- `apps/journeys-admin/src/components/Team/CopyToTeamMenuItem/CopyToTeamMenuItem.tsx` — overall component shape, subscription gating via `translationVariables` state, `setHasOpenDialog` wiring, `handleKeepMounted` usage.
- `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md` Pattern 3 — `mountedRef` + `guardedClose`.
- `apps/journeys-admin/src/components/TemplateGalleryPageList/useCollectionMutations/` — orchestration extraction pattern if the menu item grows past ~600 lines (then extract a `useCopyToCollection` hook).

**Test scenarios:**

- Happy path: clicking the menu item opens the dialog and calls `setHasOpenDialog(true)`.
- Happy path (no translation): submitting fires `journeyDuplicate` then `templateGalleryPageAssignJourney` with the duplicated journey's id and the selected collection id; on success the dialog shows the Done state and a `GetAdminJourneys` refetch is issued.
- Happy path (with translation): submitting fires `journeyDuplicate`, then `useJourneyAiTranslateSubscription` runs to completion, then `templateGalleryPageAssignJourney` runs; on overall success the Done state shows and `GetAdminJourneys` is refetched.
- Edge case: closing the dialog mid-pipeline (after `journeyDuplicate` resolved but before `assignJourney`) does not setState on the unmounted dialog (`mountedRef` guard); pipeline continues to completion in the background but does not throw.
- Edge case: clicking the menu item with the dialog already open is a no-op.
- Edge case: zero collections in the team — dialog opens (handled by U2), submit is disabled; the menu item itself still renders.
- Edge case: rapid double-click on submit fires `journeyDuplicate` only once — the in-handler single-flight guard returns early on the second click before any mutation runs.
- Edge case: `activeTeam` is null at submit time — the handler short-circuits with a "no active team" error message; no `journeyDuplicate`, `assignJourney`, or refetch is fired.
- Error path (duplicate fails): `journeyDuplicate` throws → the dialog shows `"Failed to copy the journey. Please try again."` + Done; no `assignJourney` call; no refetch (nothing was created).
- Error path (translation fails): subscription `onError` fires → the dialog shows `"An error occurred while translating."` + Done; **no** `assignJourney` call; a `GetAdminJourneys` refetch IS issued so the orphan is visible.
- Error path (assign fails, no translation): `templateGalleryPageAssignJourney` throws → dialog shows the assign-fail copy (R10, either the standard or the contingency version depending on the drag-from-All-Templates verification) + Done; a `GetAdminJourneys` refetch IS issued.
- Error path (assign fails, after successful translation): same error copy as previous; the orphan in All Templates is translated.
- Integration: after Done is clicked, the dialog calls `setHasOpenDialog(false)` and `handleCloseMenu()` so the parent `JourneyCard`'s `GalleryDialogLockContext` lock releases and DnD resumes.
- Integration: after a successful pipeline, the gallery-page query receives a `GetAdminJourneys` refetch — the test asserts the refetch was issued (mock the client's `refetchQueries`); the actual cache update of `TemplateGalleryPage.templates` is left to Apollo's normalized merge from the assign mutation's response.

**Verification:**

- The component covers the success path and all three terminal error paths with the correct error copy and the correct refetch behavior. `mountedRef` guards prevent setState on unmount. `setHasOpenDialog` is flipped on open and close.

---

- U4. **Wire `CopyToCollectionMenuItem` into `DefaultMenu` with the flag + context gate**

**Goal:** Activate the new menu item on journey cards rendered inside a Collection, gated by `teamTemplateCollection` AND `useInCollection()`. Verify the existing menu items are unchanged.

**Requirements:** R1, R2

**Dependencies:** U1, U2, U3

**Files:**

- Modify: `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DefaultMenu/DefaultMenu.tsx`
- Modify: `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DefaultMenu/DefaultMenu.spec.tsx`

**Approach:**

- Import `CopyToCollectionMenuItem` and `useInCollection`.
- Read `teamTemplateCollection` via `useFlags()` (already used elsewhere in this file or imported via `@core/shared/ui/FlagsProvider`).
- Render the new item as a **sibling block** to the existing `CopyToTeamMenuItem` (not nested inside its `!isLocalTemplate` branch — the new item's gate is independent: `teamTemplateCollection === true && inCollection === true`). Pass through the same `id`, `journey`, `handleCloseMenu`, `handleKeepMounted`, and `setHasOpenDialog` props that `CopyToTeamMenuItem` receives.
- **Order:** place `CopyToCollectionMenuItem` directly **after** `CopyToTeamMenuItem` in the menu render order. Rationale: both items share the `"Copy to ..."` family naming, and grouping them sequentially keeps related actions clustered; placing the new item after the established one follows the typical "add at the end of the same family" UI convention.
- Do not change the existing `CopyToTeamMenuItem` rendering or any other menu item.

**Test scenarios:**

- Happy path: when `teamTemplateCollection: true` and the menu is rendered inside the `InCollectionContext.Provider`, the new `"Copy to collection..."` item is in the rendered menu (asserted via `testId`).
- Edge case: when `teamTemplateCollection: false` and the menu is rendered inside the provider, the new item is NOT in the menu.
- Edge case: when `teamTemplateCollection: true` and the menu is rendered OUTSIDE the provider (e.g., in `ActiveJourneyList`'s usage path), the new item is NOT in the menu.
- Integration: the existing `CopyToTeamMenuItem` ("Copy to ...") renders unchanged in all four `(flag, in-collection)` combinations — i.e., adding the new item does not affect the existing one.

**Verification:**

- `DefaultMenu.spec.tsx` snapshots / assertions show the new item appearing only under the `(flag: true, inCollection: true)` combination, with no regressions in any other menu item.

---

## System-Wide Impact

- **Interaction graph:** The new item lives on the same `DefaultMenu` consumed by every `JourneyCard` in the admin app. Existing menu items (`CopyToTeamMenuItem`, `DuplicateJourneyMenuItem`, etc.) are unchanged; the new item is purely additive. The new dialog hooks into `GalleryDialogLockContext` via `setHasOpenDialog` to pause DnD while open — the same pattern other gallery-page dialogs use.
- **Error propagation:** Errors from the three pipeline mutations/subscription are captured locally in the menu item and surfaced inline in the dialog. They do not bubble to global snackbars (deliberate, per R8–R10). The exception is success — an optional success snackbar is allowed but not required.
- **State lifecycle risks:**
  - Mid-pipeline unmount is guarded by `mountedRef` so background steps don't setState on a closed dialog.
  - Partial-write hazard: a duplicated-but-not-assigned (or duplicated-translated-not-assigned) journey lives as an orphan in All Templates. The refetch ensures it is visible there. No cleanup is performed.
  - Cache hazard: `useJourneyDuplicateMutation`'s `update` skips `template: true` reads, so the gallery-page's `journeyById` is stale until the explicit `GetAdminJourneys` refetch runs. The plan addresses this in U3.
- **API surface parity:** Other journey-card menu items remain unchanged. The new item adds to the menu but does not modify shared menu chrome.
- **Integration coverage:** Cross-layer scenarios that unit tests alone won't fully prove:
  - "Submit → duplicate → translate → assign → refetch → new card appears in target Collection card without manual refresh" — verifiable via a manual smoke run in the worktree.
  - "Translation fails → orphan visible in All Templates after the refetch" — verifiable manually.
  - "DnD on the gallery page is paused while the dialog is open" — verifiable manually.
- **Unchanged invariants:**
  - `CopyToTeamMenuItem` (the cross-team copy) is not modified.
  - The shared `CopyToTeamDialog` is not modified.
  - No backend mutations are added or modified; the GraphQL schema is unchanged.
  - The `teamTemplateCollection` flag continues to gate all template-gallery-page UI; default-off behavior is preserved.

---

## Risks & Dependencies

| Risk                                                                                                                                                                 | Mitigation                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New journey is invisible in the target Collection card because `journeyDuplicate`'s `update` skips `template: true` reads (the gallery-page's `journeyById` source). | Explicit `refetchQueries({ include: ['GetAdminJourneys'] })` after assign success **and** after assign/translation failure (orphan recovery). Test in U3 asserts the refetch fires.                                                                                                                                                                                                 |
| `JourneyCard` is rendered in non-Collection contexts; a naive flag check would leak the new item there.                                                              | Dedicated `InCollectionContext` provided only inside the Collection-grid path; gate the menu item on both `teamTemplateCollection` and `useInCollection()`. U4 tests cover all four `(flag, context)` combinations.                                                                                                                                                                 |
| Dialog unmount mid-pipeline causes setState-after-unmount.                                                                                                           | `mountedRef` + `guardedClose` per NES-1539 Pattern 3; setup body flips `mountedRef.current = true` (Next-dev/StrictMode trap).                                                                                                                                                                                                                                                      |
| DnD on the gallery page fires while the dialog is open.                                                                                                              | `setHasOpenDialog` plumbing into `GalleryDialogLockContext` — same pattern other gallery dialogs use. Asserted in U3 integration tests.                                                                                                                                                                                                                                             |
| Naming collision with the existing cross-team "Copy to ..." item.                                                                                                    | New label `"Copy to collection..."` is distinct in copy and `testId` (`"CopyToCollection"` vs `"Copy"`).                                                                                                                                                                                                                                                                            |
| Translation subscription's `onData` writes to the Apollo cache while the user is still in the dialog, potentially resetting Formik.                                  | Form fields are user-only inputs (collection, language, toggle) — they do not read journey fields. Combined with no `enableReinitialize`, the subscription's cache writes are invisible to the form.                                                                                                                                                                                |
| `TemplateGalleryPage.templates` typename mismatch (`TemplateGalleryItem` vs `Journey`) per NES-1644 if we ever hand-write a `cache.modify` on `templates`.           | Rely on the assign mutation's response shape and Apollo's normalized merge — do not hand-write `cache.modify` on `templates` in this plan.                                                                                                                                                                                                                                          |
| `useTemplateGalleryPagesQuery` requires a non-nullable `teamId`; the active team may be null in edge cases.                                                          | U2 passes `skip: activeTeam?.id == null` to the query and treats the skipped state as a disabled `"Loading…"` row + disabled submit. U3 short-circuits the submit handler with a "no active team" message before any mutation runs.                                                                                                                                                 |
| Rapid double-click on submit fires multiple `journeyDuplicate` calls.                                                                                                | U2 disables the submit button when `loading \|\| done \|\| errorMessage != null`; U3 adds a defensive single-flight `if (loading) return` guard at the top of the submit handler. Tested in U2 and U3.                                                                                                                                                                              |
| Translation subscription `onError` may fire on a transient SSE drop after a translated journey already exists.                                                       | U3 stops the pipeline and refetches `GetAdminJourneys` so the orphan is visible. R9 copy is generic (`"An error occurred while translating."`) — the user decides whether to delete the partial copy or use it. Terminal-vs-transient distinction is deferred to implementation (investigate the subscription's error envelope; consider a single retry before the terminal error). |
| Recovery copy ("drag it into the collection from there") in R10 assumes drag-from-All-Templates is supported.                                                        | U3 documents a pre-merge verification step. R10 carries contingency copy if the drag direction is missing; follow-up to enable drag-from-All-Templates or add a manual retry affordance on the orphan.                                                                                                                                                                              |

---

## Documentation / Operational Notes

- No docs/runbook updates required — this is a flag-gated UI addition.
- The `teamTemplateCollection` LaunchDarkly flag must be on for the new menu item to appear. Default-off remains the production behavior until rollout.
- No monitoring or alerting changes needed; the new pipeline rides on existing mutations and subscription which are already observable.

---

## Sources & References

- **Linear ticket:** [NES-1637 — Add "Copy to collection" action to template cards in Collections](https://linear.app/jesus-film-project/issue/NES-1637) — canonical scope and acceptance criteria live in the appended "Update — 2026-05-21 — Scope pivot" section of the description.
- Related tickets: [NES-1539](https://linear.app/jesus-film-project/issue/NES-1539) (publish flow, Collection card More menu), [NES-1547](https://linear.app/jesus-film-project/issue/NES-1547) (backend mutations), [NES-1548](https://linear.app/jesus-film-project/issue/NES-1548) (gallery management menu), [NES-1644](https://linear.app/jesus-film-project/issue/NES-1644) (template gallery preview revalidate + custom-domain gate — base commit of this worktree).
- Related code:
  - `apps/journeys-admin/src/components/Team/CopyToTeamMenuItem/`
  - `libs/journeys/ui/src/components/CopyToTeamDialog/`
  - `apps/journeys-admin/src/components/TemplateGalleryPageList/`
  - `apps/journeys-admin/src/libs/useTemplateGalleryPageAssignJourneyMutation/`
  - `libs/journeys/ui/src/libs/useJourneyDuplicateMutation/`
  - `libs/journeys/ui/src/libs/useJourneyAiTranslateSubscription/`
- Institutional learnings:
  - `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md`
  - `docs/solutions/best-practices/local-template-dialog-consolidation-patterns-nes1543.md`
  - `docs/solutions/runtime-errors/yoga-response-cache-null-stickiness-and-zombie-process-debugging-nes1644.md`
  - `docs/solutions/logic-errors/response-cache-empty-list-invalidation-2026-05-10.md`

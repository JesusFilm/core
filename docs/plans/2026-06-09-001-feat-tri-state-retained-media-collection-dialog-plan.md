---
title: 'feat: Tri-state retained-both-slots media model in CollectionDialog'
type: feat
status: active
date: 2026-06-09
---

# feat: Tri-state retained-both-slots media model in CollectionDialog

## Summary

Adopt the backend's new tri-state media contract (NES-1706) in the journeys-admin `CollectionDialog`: rework the form's media value from a single tagged union (one payload at a time) into a both-slots record that retains a link payload and an upload payload independently, driven by a `Link / Upload / None` toggle that only sets `type`. Saving diffs each slot against the last-persisted value and emits the backend's per-slot tri-state input (omit unchanged / `null` cleared / value set). The public render path needs no change.

---

## Problem Frame

The backend media model changed from "tagged union, exactly one of link/upload set" to "both slots retained, `type` selects what renders," so a publisher can switch between a pasted link and a previously-uploaded video without losing either. The current frontend form is a single union: switching Link↔Upload and editing silently discards the other payload, and it still clears via the removed `media: null` path and `formMediaToInput(none) → null` (now a no-op on the backend). The merge of NES-1706 also renamed the admin GraphQL types, breaking ~27 hand-written mock `__typename` literals.

---

## Requirements

- R1. The merged branch typechecks and all gallery test suites pass (admin mock `__typename`s match the renamed admin types).
- R2. Media clears use the new contract: `type: none` to hide all; `url: null` / `muxVideoId: null` to clear a single slot. No `media: null`.
- R3. The form retains both a link slot and an upload slot at once; switching the active `type` never wipes the parked slot.
- R4. `type` changes ONLY via the explicit `Link / Upload / None` toggle. Removing a link or upload clears only that slot and never changes `type`. No automatic/implicit state changes — every media mutation is a direct result of a user action.
- R5. Save emits diff-aware tri-state input per slot (omit unchanged, `null` cleared, value set), diffed against the last-persisted slot values.
- R6. An empty active slot is valid (renders nothing, no blocked Save); the in-flight-upload Save block is unchanged.
- R7. The public render path (`toMedia`, the server-side host gate, `JourneyViewMedia`) is unchanged and still correct against the new public ref (active-payload-only, page-level `media` null on none/empty).

---

## Scope Boundaries

- Public renderer (`apps/journeys`) behavior — already correct against the new public ref; not reworked.
- Backend contract — already merged; this plan only consumes it.
- The Mike-review security hardening (commit `b5fce424e`) — already done; not revisited.
- No change to the dialog's non-media fields, the save-on-Save model, or the submit-intent/footer logic.

### Deferred to Follow-Up Work

- None. All work lands on this branch (`siyangcao/nes-1707-...`).

---

## Context & Research

### Relevant Code and Patterns

- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/useCollectionForm/collectionMedia.ts` — `CollectionMediaValues` union, `collectionMediaToFormValues`, `mediaKey`, `formMediaToInput` (the core data model to redesign).
- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/useCollectionForm/useCollectionForm.ts` — Formik schema (`media-complete` rule), `lastPersistedMediaKeyRef`, `mediaDirty`, the `handleSubmit` media diff/clear path.
- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/MediaSection/MediaSection.tsx` — current 2-way toggle + `boxMedia` inactive-blanking (to become a 3-way toggle over the both-slots model).
- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/MediaSection/MuxUploadField/MuxUploadField.tsx` — upload lifecycle + latched error state (`uploadFailed`); `onComplete`/`onCancel`/`onRemove` to operate on the mux slot.
- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/MediaPreview/MediaPreview.tsx` and `.../CollectionPreviewPane/CollectionPreviewPane.tsx` — render the active slot's preview.
- Admin GraphQL docs needing `muxVideoId` added: `apps/journeys-admin/src/libs/useTemplateGalleryPagesQuery/useTemplateGalleryPagesQuery.ts`, and `useTemplateGalleryPage{Update,Create,AssignJourney,ReorderTemplate}Mutation/*.ts`.
- New backend Pothos types for reference: `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageMedia.ts` (admin vs public refs), `.../media/resolveMediaInput.ts` (tri-state semantics).

### Institutional Learnings

- `docs/solutions/ui-bugs/collection-dialog-mux-upload-state-machine-bugs-2026-06-08.md` — the upload state-machine rules (transient provider task vs durable form state, latched terminal error, never destructively overwrite a committed value). The both-slots model must keep these intact.
- `docs/solutions/design-patterns/formik-intent-ref-multi-button-submit-2026-05-24.md` — the dialog's submit-intent/footer pattern (unchanged here, but the form lives alongside it).
- `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md` — the CollectionDialog patterns catalog.

### External References

- None — internal contract change, fully patterned in-repo.

---

## Key Technical Decisions

- **Flat both-slots record over nested slot objects.** `CollectionMediaValues` becomes `{ type, url, muxVideoId, muxPlaybackId, muxName, muxDuration }` rather than `{ type, link: {...}, mux: {...} }`. Flatter Formik field paths, a 1:1 mapping to the input fields, and simpler per-field diffing. Empty link = `url: ''`; empty upload = `muxVideoId: '' && muxPlaybackId: null`.
- **Diff against a persisted-media baseline, not a string key.** Replace `lastPersistedMediaKeyRef` (a single comparison key) with the actual last-persisted `CollectionMediaValues` so `formMediaToInput` can compute the tri-state per slot. Seed from `collectionMediaToFormValues(collection?.media)`; advance after a successful save (mirrors the existing key-advance logic).
- **Read `muxVideoId` in admin queries to diff uploads precisely.** The admin ref now exposes `muxVideoId`; seeding it lets the diff distinguish "untouched existing upload" (omit) from "removed" (`null`) from "replaced" (new id) without session flags — keeping behavior driven by data, not implicit state.
- **`type` is form state set only by the toggle.** The toggle writes `type`; slot editors write only their slot. `MediaSection`'s local `mode` state and the `boxMedia` inactive-blanking are removed — each tab renders its own slot from the form.
- **Relax `media-complete` to allow an empty active slot.** An empty link/upload is "renders nothing, no error" (R6). The in-flight-upload Save gate stays in `CollectionDialog` (`mediaBlocked`), independent of this rule.

---

## Open Questions

### Resolved During Planning

- Does the public path need rework? No — the backend page resolver nulls `media` on none/empty and emits active-payload-only; `toMedia` + the server-side host gate already handle this (R7).
- How is "untouched upload" distinguished at save? By diffing `muxVideoId` against the persisted baseline (now readable on the admin ref) — omit when equal.
- What does the None tab show? A "nothing will be shown" state with no slot input; editing a slot requires switching to Link/Upload (keeps `type` changes explicit per R4).

### Deferred to Implementation

- Exact MUI layout of the 3-way toggle (reuse the existing `ToggleButtonGroup`, extended to three buttons) — settle against the rendered dialog.
- Whether `mediaKey` survives at all or is fully replaced by per-slot equality in `formMediaToInput`/`mediaDirty` — decide while wiring U4.

---

## High-Level Technical Design

> _This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce._

Form value (both slots retained; `type` is the active selector):

    CollectionMediaValues = {
      type: 'link' | 'mux' | 'none'
      url: string                       // link slot ('' = empty)
      muxVideoId: string                // upload slot ('' = empty)
      muxPlaybackId, muxName, muxDuration   // denormalized upload metadata
    }

Per-slot tri-state diff at save (`formMediaToInput(current, persisted)`), per the backend's omit/null/value contract:

    input.type = current.type                              // always sent
    url:        current.url === persisted.url      → omit
                current.url.trim() === ''          → null   (cleared)
                else                               → current.url.trim()  (set)
    muxVideoId: current.muxVideoId === persisted.muxVideoId → omit
                current.muxVideoId === ''          → null   (removed)
                else                               → current.muxVideoId  (new upload)

Toggle/slot actions (all user-driven; nothing implicit):

    Toggle Link/Upload/None → set type only (both slots retained)
    Type a link             → set url
    Clear link field        → url = '' (becomes url:null at save)
    Upload completes         → set muxVideoId + metadata (type unchanged)
    Remove upload            → muxVideoId = '', muxPlaybackId = null (type unchanged)

---

## Implementation Units

- U1. **Rename admin fixture `__typename`s for the renamed admin types**

**Goal:** Make the merged branch typecheck/green by matching hand-written mocks to the backend's renamed admin GraphQL types.

**Requirements:** R1

**Dependencies:** None

**Files:**

- Modify: the ~27 admin spec/mock files asserting `__typename: 'TemplateGalleryPage'` / `'TemplateGalleryPageMedia'` (e.g. `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionCard/CollectionCard.spec.tsx`, `.../useCollectionForm/useCollectionForm.spec.tsx`, `.../TemplateGalleryPageList.spec.tsx`, `.../CopyToCollectionDialog/CopyToCollectionDialog.spec.tsx`, `.../useCollectionMutations/useCollectionMutations.spec.tsx`, `.../useDragEndHandler/useDragEndHandler.spec.tsx`, and the `useTemplateGalleryPage*Mutation/*.mock.ts` files)

**Approach:**

- For each failing fixture, set `__typename` to the value the regenerated type expects (`TemplateGalleryPageAdmin` for page objects, `TemplateGalleryPageMediaAdmin` for media objects). Drive the exact set from the typecheck error list, not a blind find/replace — some `TemplateGalleryPage*` substrings (enums, status) must not change.

**Patterns to follow:**

- Match the `__typename` literal of the corresponding regenerated type in `apps/journeys-admin/__generated__/`.

**Test scenarios:**

- Test expectation: none — mechanical fixture rename; correctness is proven by `tsc` and the existing suites passing.

**Verification:**

- `tsc -p apps/journeys-admin/tsconfig.json` is clean; the gallery spec suites run (red elsewhere only where U3–U7 change behavior).

---

- U2. **Expose `muxVideoId` on the admin media reads**

**Goal:** Let the editor read the parked upload's raw id so saves can diff uploads precisely.

**Requirements:** R3, R5

**Dependencies:** None

**Files:**

- Modify: `apps/journeys-admin/src/libs/useTemplateGalleryPagesQuery/useTemplateGalleryPagesQuery.ts`, `.../useTemplateGalleryPageUpdateMutation/useTemplateGalleryPageUpdateMutation.ts`, `.../useTemplateGalleryPageCreateMutation/useTemplateGalleryPageCreateMutation.ts`, `.../useTemplateGalleryPageAssignJourneyMutation/useTemplateGalleryPageAssignJourneyMutation.ts`, `.../useTemplateGalleryPageReorderTemplateMutation/useTemplateGalleryPageReorderTemplateMutation.ts`
- Modify (regenerated): `apps/journeys-admin/__generated__/*` for those documents

**Approach:**

- Add `muxVideoId` to each `media { … }` subselection alongside `embedUrl muxPlaybackId muxName muxDuration type`. Run frontend codegen so the generated types gain the field; the `*.mock.ts` files then need `muxVideoId` added to their media objects (fold into U1's fixture pass or here).

**Patterns to follow:**

- The existing `media { id type embedUrl muxPlaybackId muxName muxDuration }` subselections in the same files.

**Test scenarios:**

- Test expectation: none — query-shape change; proven by codegen output containing `muxVideoId` and downstream typecheck.

**Verification:**

- Generated `GetTemplateGalleryPages_*_media` (and the mutation result media types) include `muxVideoId: string | null`.

---

- U3. **Redesign `CollectionMediaValues` to both-slots + tri-state input mapping**

**Goal:** Replace the single tagged union with a both-slots record and make `formMediaToInput` diff-aware per slot.

**Requirements:** R2, R3, R4, R5

**Dependencies:** U2

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/useCollectionForm/collectionMedia.ts`
- Test: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/useCollectionForm/collectionMedia.spec.ts` (add if absent)

**Approach:**

- New `CollectionMediaValues = { type: 'link'|'mux'|'none'; url: string; muxVideoId: string; muxPlaybackId: string|null; muxName: string|null; muxDuration: number|null }`.
- `collectionMediaToFormValues(media)`: seed `type` from the row (`none` when row null), `url` from `embedUrl ?? ''`, and the mux slot from `muxVideoId ?? ''` / `muxPlaybackId` / `muxName` / `muxDuration`. Both slots populated regardless of active `type`.
- `formMediaToInput(current, persisted)`: emit `{ type }` always; add `url` only when changed (`null` when emptied, trimmed value when set); add `muxVideoId` only when changed (`null` when removed, id when replaced). Trim links at this boundary (preserve the existing trim behavior).
- Drop/replace `mediaKey`; if a dirty check is still convenient, expose a per-slot equality helper instead.

**Technical design:** see High-Level Technical Design (the per-slot diff table is the contract for this unit).

**Patterns to follow:**

- The current `formMediaToInput` trim-at-boundary comment; the tri-state semantics documented in `apis/api-journeys-modern/src/schema/templateGalleryPage/media/resolveMediaInput.ts`.

**Test scenarios:**

- Happy path: `collectionMediaToFormValues` for a link row → `type:link, url:<embedUrl>`, empty mux slot.
- Happy path: for a mux row → `type:mux`, mux slot filled (incl. `muxVideoId`), empty url.
- Happy path: for a row with BOTH payloads parked and `type:link` → both slots populated, `type:link`.
- Edge case: null row → `{ type:'none', url:'', muxVideoId:'', … }`.
- Happy path: `formMediaToInput` with an unchanged link → `{ type:'link' }` only (url omitted).
- Happy path: link changed to a new value → `{ type:'link', url:<trimmed> }`.
- Edge case: link emptied (`url:''`, persisted non-empty) → `{ type:'link', url:null }`.
- Happy path: fresh upload (new `muxVideoId`) → `{ type:'mux', muxVideoId:<id> }`.
- Edge case: upload removed (`muxVideoId:''`, persisted set) → `{ type:'mux', muxVideoId:null }`.
- Edge case: untouched existing upload → `muxVideoId` omitted.
- Edge case: `type:none` with both slots unchanged → `{ type:'none' }` only.
- Edge case: leading/trailing whitespace in a new link → trimmed in the input.

**Verification:**

- The spec enumerates each omit/null/value case and passes; no `media: null` is ever produced.

---

- U4. **Rework `useCollectionForm` for the persisted baseline, clear semantics, and relaxed validation**

**Goal:** Wire the new model into the form hook: diff against a persisted-media baseline, send the tri-state input, relax validation.

**Requirements:** R2, R5, R6

**Dependencies:** U3

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/useCollectionForm/useCollectionForm.ts`
- Test: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/useCollectionForm/useCollectionForm.spec.tsx`

**Approach:**

- Replace `lastPersistedMediaKeyRef` (string key) with a ref to the persisted `CollectionMediaValues` (seed from `collectionMediaToFormValues(collection?.media)`; advance after a successful update that sent media).
- `handleSubmit`: build `input.media = formMediaToInput(values.media, persistedMedia.current)`; include it only when the diff is non-empty beyond `type` OR `type` itself changed. Never send `media: null`.
- Relax the `media-complete` yup rule: `type:none` valid; `type:link`/`type:mux` with empty slot valid (renders nothing). Keep create-mode behavior consistent.
- `mediaDirty`: compute from per-slot inequality against the persisted baseline.

**Patterns to follow:**

- The existing key-advance-after-update logic and `mediaDirty` consumption in `CollectionDialog.tsx`.

**Test scenarios:**

- Happy path: editing only the link sends an update whose media input is `{ type:'link', url:<new> }`.
- Edge case: clearing the link sends `{ type:'link', url:null }` (was the `input:{media:null}` test → update assertion).
- Happy path: selecting None sends `{ type:'none' }`.
- Edge case: an untouched existing upload + a title edit → media omitted from the update input (no `muxVideoId` resent).
- Edge case: `type:link` with empty url passes validation (Save not blocked by `media-complete`).
- Edge case: switching to Upload but no file yet → still blocked by the in-flight/empty-mux `mediaBlocked` gate (unchanged), not by `media-complete`.
- Integration: after a successful save, the persisted baseline advances so a second identical Save omits media.

**Verification:**

- Form specs pass; no path emits `media: null`; empty active slots no longer block Save.

---

- U5. **`MediaSection`: 3-way Link / Upload / None toggle over both slots**

**Goal:** Replace the 2-way toggle + inactive-blanking with a 3-way toggle that only sets `type`, each tab rendering its own retained slot.

**Requirements:** R3, R4

**Dependencies:** U3

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/MediaSection/MediaSection.tsx`
- Test: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/MediaSection/MediaSection.spec.tsx`

**Approach:**

- `ToggleButtonGroup` with `Link | Upload | None`; `onChange` sets `type` (form state) only — no local `mode`, no `boxMedia` blanking.
- Link tab: URL field bound to the `url` slot + its preview; clearing the field sets `url:''` (no type change). Remove button clears the link slot only.
- Upload tab: `MuxUploadField` bound to the mux slot.
- None tab: a "no media will be shown" message, no slot input.
- Switching tabs never mutates the inactive slot.

**Patterns to follow:**

- The existing `ToggleButtonGroup` styling and the link-field/Remove handlers in the current `MediaSection`.

**Test scenarios:**

- Happy path: toggling Link/Upload/None sets `type` and renders the matching input; the other slot's value is untouched (assert the parked value persists across toggles).
- Happy path: typing in the link field updates only `url`; `type` and the mux slot unchanged.
- Edge case: clearing the link field sets `url:''` and does NOT change `type`.
- Edge case: Remove on the link clears only `url`; `type` stays `link`.
- Edge case: None tab shows the empty-state message and no input.
- Happy path: switching Upload→Link→Upload preserves a parked uploaded video (thumbnail still shown on return).

**Verification:**

- Spec proves toggles change only `type`, slot edits change only their slot, and parked slots survive switching.

---

- U6. **`MuxUploadField`: slot-scoped complete/remove without touching `type`**

**Goal:** Upload completion/removal mutate only the mux slot; `type` is owned by the toggle.

**Requirements:** R4

**Dependencies:** U3, U5

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/MediaSection/MuxUploadField/MuxUploadField.tsx`
- Test: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/MediaSection/MuxUploadField/MuxUploadField.spec.tsx`

**Approach:**

- `onComplete` writes `muxVideoId` + metadata into the mux slot; `onRemove`/error-Remove clears the mux slot (`muxVideoId:''`, `muxPlaybackId:null`) — neither changes `type`.
- Preserve the latched `uploadFailed` error state and the existing replace/cancel data-loss guards (see the upload state-machine learning).

**Patterns to follow:**

- The current `MuxUploadField` lifecycle and latched-error handling (unchanged in spirit; only the slot-write target changes).

**Test scenarios:**

- Happy path: completing an upload fills the mux slot; `type` unchanged.
- Edge case: Remove clears only the mux slot; `type` unchanged; link slot untouched.
- Edge case: a failed upload still latches the error UI after provider task cleanup (regression guard preserved).
- Edge case: replacing an existing upload doesn't destroy the committed value until the new one completes (regression guard preserved).

**Verification:**

- Upload-field specs pass; no `type` mutation originates from the upload field.

---

- U7. **`MediaPreview` / `CollectionPreviewPane`: render the active slot**

**Goal:** Map the both-slots form value to the active-slot preview in the field box and the dialog preview pane.

**Requirements:** R3, R6

**Dependencies:** U3

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/MediaPreview/MediaPreview.tsx`, `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/CollectionPreviewPane/CollectionPreviewPane.tsx`
- Test: `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/MediaPreview/MediaPreview.spec.tsx` (if present) and `.../CollectionPreviewPane/CollectionPreviewPane.spec.tsx`

**Approach:**

- `MediaPreview` renders from `type` + the matching slot: `link` → link preview of `url`; `mux` → thumbnail of `muxPlaybackId`; `none`/empty slot → nothing/placeholder. Keep the `isValidMuxPlaybackId` guard and the link-preview skeleton from the Mike-review work.
- `CollectionPreviewPane`'s `mediaSlot` reflects the active slot (renders nothing when the active slot is empty or `type:none`).

**Patterns to follow:**

- The current `MediaPreview` thumbnail + `LinkPreview` structure and the `mediaSlot` wiring in `CollectionPreviewPane`.

**Test scenarios:**

- Happy path: `type:link` with a url → link preview; `type:mux` with a playbackId → thumbnail.
- Edge case: `type:link` with empty url → no preview / placeholder.
- Edge case: `type:none` → preview pane shows no media section.
- Edge case: a parked-but-inactive slot is NOT previewed (only the active `type`'s slot shows).

**Verification:**

- Preview specs prove the active slot drives the preview and inactive slots never leak into it.

---

- U8. **Verification sweep**

**Goal:** Prove the whole change is green and behaves.

**Requirements:** R1–R7

**Dependencies:** U1–U7

**Files:**

- Test: full gallery suites under `apps/journeys-admin/src/components/TemplateGalleryPageList/**` and the lib `TemplateGalleryMedia` + `PublicGalleryPage` suites.

**Approach:**

- Typecheck `libs/journeys/ui`, `apps/journeys`, `apps/journeys-admin`; run the gallery vitest suites (from each app/lib dir per `.claude/rules`); lint the changed files; visual QA of the toggle + retain behavior in the running dialog.

**Test scenarios:**

- Integration: full CollectionDialog flow — set a link, switch to Upload and upload, switch back to Link (link retained), select None, Save — and assert the emitted update input matches the per-slot tri-state expectations end-to-end.

**Verification:**

- All three typechecks clean; all gallery suites green; lint clean; the dialog visibly retains both slots across toggles.

---

## System-Wide Impact

- **Interaction graph:** `CollectionDialog` → `MediaSection` (toggle) → `MuxUploadField` (mux slot) / link field (url slot) → `useCollectionForm` (Formik value + submit) → admin mutations. `MediaPreview`/`CollectionPreviewPane` read the active slot.
- **API surface parity:** `formMediaToInput` is the single producer of `TemplateGalleryPageMediaInput`; all create/update paths go through it, so the tri-state semantics are enforced in one place.
- **State lifecycle risks:** the upload provider task remains transient; durable upload state stays in the form's mux slot (per the existing learning). The persisted-media baseline must advance exactly once per successful media-bearing save to keep diffs correct.
- **Unchanged invariants:** the public renderer, the server-side host gate, the save-on-Save model, the submit-intent/footer logic, and the in-flight-upload Save block are unchanged.

---

## Risks & Dependencies

| Risk                                                                                | Mitigation                                                                                                                                                 |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diff baseline drift (resending an untouched upload, or failing to clear)            | Single `formMediaToInput(current, persisted)` producer with enumerated per-slot tests (U3); baseline advances once per successful media-bearing save (U4). |
| Regressing the upload state-machine fixes (latched error, replace/cancel data loss) | U6 preserves the latched-error and committed-value guards; their regression tests are kept and re-asserted.                                                |
| Mock rename over-reach (changing enum/status `TemplateGalleryPage*` substrings)     | Drive U1 from the typecheck error list, not a blind find/replace.                                                                                          |
| Codegen cache serving stale types after U2                                          | Regenerate with cache skipped if a `muxVideoId` field is missing from generated output (per the schema-change rule).                                       |

---

## Sources & References

- Backend contract (merged): `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageMedia.ts`, `.../media/resolveMediaInput.ts`
- Learnings: `docs/solutions/ui-bugs/collection-dialog-mux-upload-state-machine-bugs-2026-06-08.md`, `docs/solutions/design-patterns/formik-intent-ref-multi-button-submit-2026-05-24.md`, `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md`
- Related PR: #9282 (NES-1707 frontend), #9266 (NES-1706 backend)

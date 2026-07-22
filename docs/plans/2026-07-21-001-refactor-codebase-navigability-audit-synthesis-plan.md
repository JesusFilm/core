---
title: 'refactor: codebase-navigability audit synthesis (ENG-3684)'
date: 2026-07-21
type: refactor
ticket: ENG-3684
milestone: AI friendly
status: plan
execution: ticket-by-ticket
sources:
  - Pocock skill run (core-ia.html, 8 candidates; Mike-run)
  - Siyang's feedback notes (58-candidate architecture review, 2026-07-08)
  - Mike's feedback notes (modularize-in-place approach; ENG-3684 restructure framing)
  - Fourth pass (2026-07-21-001-refactor-codebase-navigability-audit-fourth-pass.md)
---

# refactor: Codebase-navigability audit — synthesis plan (ENG-3684)

## Goal capsule

- **Objective.** Turn four architecture-review documents into one actionable plan that makes `apps/journeys`, `apps/journeys-admin`, `libs/journeys/ui`, and `apis/api-journeys` navigable and safe for an autonomous bug-fixing agent — the "AI friendly" milestone.
- **Decided approach (ENG-3684).** Audit first, read-only; the audit decides which restructures justify their prod-regression risk. This plan therefore splits into two **hard-separated tiers**: Tier 1 ships now as mechanical no-QA tickets; Tier 2 is recorded, not planned in detail, and decided ticket-by-ticket (any Tier-2 restructure we ship is the milestone's exception that **does** need QA).
- **Authority.** This plan does not modify app code. Its only artifacts are this document and the fourth-pass audit beside it.

## Provenance & how these were merged

Four source documents (see the source key at the end; cited inline as **[Pocock/Mike]**, **[Siyang]**, **[Mike]**, **[Pass 4]**):

1. **[Pocock/Mike]** the `improve-codebase-architecture` run Mike shared (`core-ia.html`, 8 candidates) — also stands in for Mike's feedback, since it is the artifact he authored and championed.
2. **[Siyang]** the 58-candidate review (19 Strong · 39 Worth exploring · 4 killed).
3. **[Mike]** the modularize-in-place position (journeys / journeys-ui as bounded modules) and the four restructure candidates named in ENG-3684.
4. **[Pass 4]** the read-only AI-navigability audit committed alongside this plan (43 findings verified against the code: 31 Tier-1, 8 Tier-2).

The first three are **deep-module** reviews (make shallow modules deep behind clean seams). Pass 4 covers the **navigability** gap they under-weight (misleading names, distant logic, implicit coupling, dead-code-reads-live, oversized files) — which is where nearly all the mechanical Tier-1 wins come from. Tier 2 is where the four documents converge.

### Corroboration signals (multiple reviewers → higher priority)

- **api-journeys authorization, one interface** — the **#1** candidate in _both_ [Pocock/Mike] (#01) and [Siyang] (c05). The strongest cross-document agreement in the set.
- **Journey navigation needs an owner** — [Pocock/Mike] #02 _and_ [Siyang] c04 ("one navigate module, not comment-synced copies"), _and_ [Pass 4] A10 found the concrete Tier-1 slice (the triplicated `handleNext/PreviousNavigationEventCreate`, held together by a drifted comment).
- **Block-type registry** — [Pocock/Mike] #07 _and_ [Siyang] c01, _and_ [Pass 4] B2 adds a fresh facet (the Apollo `possibleTypes` lockstep copies).
- **`GoogleSheetsSyncDialog` (1509 lines)** and **dead `VideoWrapperPaused`** — each surfaced by multiple Pass-4 finders independently (the dialog twice; the dead wrapper by four of seven finders).

### One reviewer tension, flagged and resolved

[Mike] holds that the **per-component `index.ts` barrels are intentional structure, not bloat**, and that journeys-ui should be treated as bounded modules — i.e. _don't_ strip barrels. [Siyang] c39 and [Pass 4] A24 both push to _tighten the lib's public surface_ (the 104-subpath wildcard export; test/story scaffolding reachable as production). **Resolution:** these are compatible. Tier 1 A24 does **not** touch per-component barrels; it only stops **test-only** modules leaking through the lib-root wildcard. No plan item deletes or flattens the intentional per-component `index.ts` barrels. If a future ticket proposes a declared lib interface (c39), it must preserve them.

---

## Tier 1 — Easy wins (the focus)

Low-risk, mechanical, individually shippable, **no QA**. Each row is concrete enough to hand to an agent as a standalone ticket; full evidence (exact lines, grep results, corrected paths) is in the companion **[Pass 4]** audit under the same ID. Unless a dependency is noted, items are independent and can ship in any order or in parallel.

**Source:** every A-item below is **[Pass 4]** (verified against the code 2026-07-21); the "also seen" column records where a prior review touched the same area.

### Dead code that reads as live — delete (highest navigability-per-effort)

| ID  | Delete                                                                                                   | Where                                                                                 | Effort | Also seen   |
| --- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------ | ----------- |
| A11 | `VideoWrapperPaused` block wrapper (wired into nothing; `apps/journeys` never passes `wrappers=`)        | `apps/journeys/src/components/VideoWrapperPaused/`                                    | S      | ✱ 4 finders |
| A2  | `findBlocksByTypename` lib helper (0 importers)                                                          | `apps/journeys-admin/src/libs/findBlocksByTypename/`                                  | S      | —           |
| A4  | stray 0-byte file `src/__r`                                                                              | `apps/journeys-admin/src/__r`                                                         | S      | —           |
| A7  | `DiscoveryJourneys/` + `EmbedJourney/` subtree                                                           | `apps/journeys-admin/src/components/JourneyList/ActiveJourneyList/DiscoveryJourneys/` | S      | —           |
| A8  | `ShareDrawer/` + `LanguageScreenCardPreview/`                                                            | `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/...`  | S      | —           |
| A15 | duplicate hook `useSortLanguageContinents` (dead twin of live `sortLanguageContinents`)                  | `libs/journeys/ui/src/libs/useSortLanguageContinents/`                                | S      | ✱ 2 finders |
| A16 | `Drawer`/`DrawerContent` component (0 importers; squats on the `Drawer` domain term)                     | `libs/journeys/ui/src/components/Drawer/`                                             | S      | —           |
| A25 | `LanguageFilterDialog` (live UI is the near-namesake `LanguagesFilterPopper`)                            | `libs/journeys/ui/.../HeaderAndLanguageFilter/LanguageFilterDialog/`                  | S      | —           |
| A30 | `getNextParentOrder` (live ordering uses `getSiblingsInternal`)                                          | `apis/api-journeys/src/schema/block/getNextParentOrder.ts`                            | S      | —           |
| A12 | `useFullscreenStatus` hook — **relocate its `declare global` into `EmbeddedPreview` first**, then delete | `apps/journeys/src/libs/useFullscreenStatus/`                                         | S      | —           |

> **Dependency / caveat:** A12 is not a bare `rm` — its ambient `declare global` is the only declaration of the vendor-prefixed fullscreen props `EmbeddedPreview.tsx` type-checks against; move that block first, then type-check.

### Misleading names — rename

| ID  | Rename                                                                         | Where                                                              | Effort    | Note                                                                |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- | ------------------------------------------------------------------- |
| A3  | dir `CheckBoxOption/` → `CheckboxOption/`                                      | `apps/journeys-admin/.../ExportDialog/CheckBoxOption/`             | S         | update **both** `FilterForm.tsx:17` and `ContactDataForm.tsx:20`    |
| A13 | duplicate `HostJourneyPage` wrapper → `HostSingleJourneyPage` (or inline)      | `apps/journeys/pages/[hostname]/index.tsx`                         | S         | two sibling files share the name today                              |
| A14 | `WebView` → `WebsiteView` (renders a website-mode step, not an iframe)         | `apps/journeys/src/components/WebView/`                            | S         | ~3 importers, no runtime strings                                    |
| A17 | `useNavigationState` → `useRouteChangeState` (tracks router route-changes)     | `libs/journeys/ui/src/libs/useNavigationState/`                    | S         | contradicts `CONTEXT.md` reserved term                              |
| A19 | `journeyFields.tsx` → `.ts` (pure gql fragment, no JSX)                        | `libs/journeys/ui/src/libs/JourneyProvider/journeyFields.tsx`      | S         | 4 importers; siblings are `*Fields.ts`                              |
| A20 | `Actions` component → `CopyMessageButton` (an AI-chat copy button)             | `libs/journeys/ui/src/components/Actions/`                         | S         | collides with block-Action / `action.ts`                            |
| A21 | inner dir `CardTemplates/Templates/` → `Layouts`                               | `apps/journeys-admin/.../Settings/Drawer/CardTemplates/Templates/` | S         | "Templates" collides with journey Templates                         |
| A22 | `MultiselectQuestion*` → `Multiselect*` (component/wrapper/fragment/admin dir) | `libs/journeys/ui/.../MultiselectQuestion/` + admin                | M         | matches typename; do **before** B1                                  |
| A31 | `event/utils.ts` → `event/eventService.ts` + hide `__set*ForTests` injectors   | `apis/api-journeys/src/schema/event/utils.ts`                      | M         | 17 importers                                                        |
| A23 | `JourneyProvider.variant` → `renderMode`                                       | `libs/journeys/ui/src/libs/JourneyProvider/` + ~179 consumers      | M (large) | **sequence alone**; or add `renderMode` alias + deprecate `variant` |

> **Dependency / caveat:** A23 is the largest-footprint Tier-1 item (~179 compiler-guided call sites, no runtime change). Ship it in its own PR to avoid churn conflicts; the alias-and-deprecate path is the low-friction alternative. A22 should precede B1 (both touch the Multiselect area).

### Distant logic / de-duplication / structure — move, split, extract

| ID  | Change                                                                                          | Where                                                                                                                                  | Effort | Note                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| A1  | fix `AGENTS.md` "Framework: Jest" → Vitest                                                      | `apps/journeys-admin/AGENTS.md:156`                                                                                                    | S      | doc pointer; every test-writing agent reads it                                                       |
| A29 | add cross-reference + fix typo on the AI image allow-list                                       | `apis/api-journeys/.../updateSimpleJourney.ts:14-41` ↔ both `next.config.js`                                                          | S      | minimal fix; full extraction = B7                                                                    |
| A9  | collapse two identical `AddBlock` `data.ts` fixtures                                            | `apps/journeys-admin/.../AddBlock/{NewMultiselectButton,NewTextResponseButton}/data.ts`                                                | S      | test-only                                                                                            |
| A28 | dedupe triplicated `parseISO8601Duration`                                                       | `apis/api-journeys/.../updateSimpleJourney.ts` + `block/video/service.ts` + admin lib                                                  | S      | in-boundary; subset of B6                                                                            |
| A27 | extract `journeyVisitorExport` query out of the 424-line type file                              | `apis/api-journeys/src/schema/journeyVisitor/journeyVisitor.ts`                                                                        | S      | into `journeyVisitorExport.query.ts`                                                                 |
| A5  | reunite `blockDeleteUpdate` with `blockCreateUpdate` (align flipped signatures; `.tsx`→`.ts`)   | `apps/journeys-admin/src/libs/blockDeleteUpdate/` + `.../Editor/utils/blockCreateUpdate/`                                              | M      | adjacent to the shared-image-mutations restructure (2A-ii)                                           |
| A26 | move Google-Sheets **sync** writer next to its schema/worker; rename to match export            | `apis/api-journeys/src/schema/journeyVisitor/export/googleSheetsLiveSync.ts` → `schema/googleSheetsSync/`                              | M      | single worker importer                                                                               |
| A10 | extract triplicated `handleNext/PreviousNavigationEventCreate` into one hook                    | `apps/journeys/src/components/Conductor/{NavigationButton,SwipeNavigation,HotkeyNavigation}.tsx`                                       | M      | shrinks 3 oversized files; light check that emitted event shapes are unchanged before merge          |
| A6  | relocate `GoogleSheetsSyncDialog/` out of `FilterDrawer/`; fix the barrel-bypassing deep import | `apps/journeys-admin/.../JourneyVisitorsList/FilterDrawer/GoogleSheetsSyncDialog/`                                                     | M      | **do before B8** (the internal split)                                                                |
| A18 | type the `MessageChatIcon` platform map `Record<MessagePlatform,…>`; move to `components/`      | `libs/journeys/ui/src/libs/MessageChatIcon/`                                                                                           | M      | turns a future silent runtime crash into a compile error                                             |
| A24 | move test/story scaffolding off the production `@core/journeys/ui/*` wildcard surface           | `libs/journeys/ui/src/{components/StoryCard, libs/algolia/InstantSearchTestWrapper, libs/journeyUiConfig, libs/simpleComponentConfig}` | M      | **does not touch per-component barrels** (see tension resolution); concrete instance of [Siyang] c39 |

> **Note on A10:** it is the mechanical, in-focus slice of the "journey navigation owner" restructure that both [Pocock/Mike] #02 and [Siyang] c04 call for. Doing it now (extract the duplicated event-create bodies) is safe and independently shippable; the larger "one navigation module owns where-are-we" change is Tier 2 (2B-ii) because it touches the `blockHistoryVar` global.

### Tier-1-eligible items carried from the prior reviews (verify before ticketing)

These mechanical items appear in the prior reviews and belong in the Tier-1 backlog, but were on Pass 4's _avoid_ list (so Pass 4 did not independently re-verify them). Confirm they are still dead/mechanical before ticketing:

- **Delete the dead AiChat overlay variant** — **[Siyang]** c29. Dead-code delete (S).
- **Delete dead `MultipleSummaryReport`** — **[Siyang]** c59. Dead-code delete (S); the accompanying PowerBI-fallback retirement is larger — treat that half as Tier 2.
- **Fold the nine one-function `TreeBlock` helpers into `block`/`action`** — **[Siyang]** c55. Mechanical inline (M).
- **Retire the `api-journeys-modern` ghost identity / one name per subgraph** — **[Siyang]** c60. Naming cleanup, but may touch subgraph/deploy identity — **verify scope; may be Tier 2.**

---

## Tier 2 — Major improvements (recorded, not planned in detail)

Structural changes that carry prod-regression risk and need QA. **Deliberately not broken into implementation steps** — each is decided on its own ticket. For each: the problem, the shape of the fix, the risk that makes it "major," and the audit evidence that would justify doing it.

### 2A. The four restructure candidates named in ENG-3684

**2A-i · Block-type registry.** _Sources: [Pocock/Mike] #07 · [Siyang] c01 · corroborated by [Pass 4] B2._ The set of block types is hardcoded in parallel across many files that must stay in lockstep with no compiler link — the `BlockRenderer` 14-case switch, the admin wrapper slots, the generated `BlockFields` union, and (the fresh facet Pass 4 adds) the Apollo `possibleTypes` arrays copied verbatim into four apps' cache configs. **Shape of fix:** one registry keyed off the codegen-derived union, that player and editor both read; `assertNever` for compile-time exhaustiveness; derive `possibleTypes` from the generated schema. **Risk (major):** it sits on the codegen seam and touches how every block renders in both the viewer and the editor — a miss blanks blocks in production. **Evidence to justify:** adding `MultiselectBlock` was a 138-file PR ([Siyang] c01); the `possibleTypes` copies already drift silently ([Pass 4] B2). **Strongest cross-document corroboration in the set (3 sources).**

**2A-ii · Shared image-mutations hook.** _Sources: [Siyang] c45 · adjacent evidence [Pass 4] A5._ Each settings-drawer image consumer (`ImageSource`, `RadioOptionImage`, `BackgroundMediaImage`, poster library, `Logo`) owns its own attach/replace/delete lifecycle. **Shape of fix:** one image-attach lifecycle hook the drawers call. **Risk (major):** image create/update/delete mutations with optimistic cache writes on live editor content. **Evidence to justify:** [Siyang] c45 enumerates the duplicated consumers; [Pass 4] A5 shows the _cache-updater_ half of the same story is already split across two homes with flipped signatures — the create/delete cache invariant is fragmented, which is exactly what a shared hook would concentrate. (Do Tier-1 A5 first; it de-risks and clarifies this restructure.)

**2A-iii · Derive `selectedBlock` instead of storing it.** _Source: [Siyang] c11._ `EditorProvider` stores `selectedBlock` **and** `selectedBlockId` as twins with six select actions. **Shape of fix:** make the id the single source of truth and derive the block; collapse the six actions to intent-level selection. **Risk (major):** the editor's selection/undo/focus state is touched by nearly every editing command — a regression here breaks selection across the whole editor. **Evidence to justify:** [Siyang] c11 documents the object/id twins and the six-action select surface; the `pre-existence selection` term in `libs/journeys/ui/CONTEXT.md` shows the id is already treated as the authoritative handle.

**2A-iv · Modularize-in-place.** _Sources: [Mike] (approach) + ENG-3684 · concrete targets from [Pass 4]._ Mike's position: treat `journeys` / `journeys-ui` as bounded modules and modularize _within_ them rather than rewriting. This is the meta-approach, not a single change; it is realized by the in-place moves/splits this audit surfaces. **Shape of fix:** the Tier-1 relocations (A5, A6, A26, A27) plus the Tier-2 splits below, done in place, no new packages. **Risk (major) applies to the split half:** the oversized-file splits touch live behaviour (see 2C). **Evidence to justify:** the concrete oversized/distant-logic targets Pass 4 verified — `GoogleSheetsSyncDialog.tsx` (1509), `VideoEvents.tsx` (787), `updateSimpleJourney.ts` (403, mixed concerns), `journeyVisitor.ts` (424) — are exactly the in-place modularization Mike's approach calls for.

### 2B. Other major structural candidates the documents surface (in focus)

**2B-i · api-journeys authorization, one interface.** _Sources: [Pocock/Mike] #01 · [Siyang] c05 — the #1 pick in both._ The same team/journey-role rule is encoded three ways (in-memory ACL predicate, Prisma `journeyReadAccessWhere`, template-field check) that drift with no compiler help, plus a `fetch/null/forbid` ritual repeated across ~82 sites and an inlined ACL include across ~37 resolvers. **Shape of fix:** one `authorize(entity, action, user)` module owning the rule, include shape, and guard; delete `ability.ts`. **Risk (major):** it is security-sensitive and spans ~46 resolvers — the highest blast radius in the whole set. **Evidence to justify:** both prior reviews independently rank it their top candidate.

**2B-ii · Journey navigation owner.** _Sources: [Pocock/Mike] #02 · [Siyang] c04 · Tier-1 slice done by [Pass 4] A10._ Navigation state is a process-global reactive var (`blockHistoryVar`) mutated by four components and only read by `Conductor`; no module owns "advance a card." **Shape of fix:** a `journeyNavigation` module exposing `next/prev/activeBlock`; stop exporting the raw var. **Risk (major):** it owns audience-facing playback position — a regression misroutes every journey. **Evidence to justify:** flagged by both prior reviews; Pass 4 A10 removes the duplicated event-emit code first, shrinking the surface this restructure has to touch.

**2B-iii · `captureEvent` / `upsertBlockAction` seams.** _Sources: [Siyang] c06, c10._ ~17 event-create mutations and 6 action mutations repeat the same shape. **Shape of fix:** one `captureEvent` seam and one `upsertBlockAction` seam. **Risk (major):** analytics event integrity and action-write correctness on live data. **Evidence:** [Siyang] c06/c10 enumerate the call sites. _(Out of the four ENG-3684 names but comparable and in-focus.)_

> **Out of this milestone's focus areas** but on record from the prior reviews (api-media / watch): unify the video player ([Pocock/Mike] #03), the translatable video-field factory (#04), and the `onVideoChanged` fan-out seam (#05). Not planned here; listed so the synthesis is complete.

### 2C. Additional Tier-2 findings from this pass

Each verified against the code; grouped by risk. _Source: [Pass 4]._

- **B2 · Apollo `possibleTypes` lockstep copies** — folds into 2A-i (block-type registry) as its fourth facet; the four apps hand-maintain the block/action typename lists. Risk: Apollo cache normalization. _(Do as part of 2A-i, not standalone.)_
- **B8 · Split `GoogleSheetsSyncDialog.tsx` (1509 lines)** — after Tier-1 A6, extract a `useGoogleDrivePicker` hook, lift `RenderMobileSyncCard`, move the 6 gql docs to a sibling. Risk: live Integrations dialog + Google OAuth Picker. **Sequence after A6.**
- **B3 · Split `VideoEvents.tsx` (787 lines)** — 9 near-duplicate player-event effects + 7 inline mutations. Risk: analytics event firing.
- **B6 · Relocate media-ingestion helpers out of `updateSimpleJourney.ts`** — superset of Tier-1 A28; move image processing + YouTube ingestion to `journey/simple/media.ts`. Risk: image upload + transaction behaviour.
- **B1 · Extract `NewMultiselectButton`'s inlined "with submit button" mutations** into `useMultiselectWithButton*` hooks mirroring the TextResponse twin. Risk: optimistic-mutation/undo behaviour. **After Tier-1 A22.**
- **B4 · Collapse the two drifted `customDomain/` service files** (`deleteVercelDomain`, `updateTeamShortLinks`). Risk: Vercel domain deletion + short-link rewrites on real custom domains.
- **B5 · Unify the duplicated per-block-type translatable-field vocabulary** (`allowedTranslationFieldsByBlockType` vs `getTranslatableFields`, provably equal today). Risk: AI-translation field selection.
- **B7 · Centralize the `ALLOWED_IMAGE_HOSTNAMES` SSRF allow-list** — the full fix behind Tier-1 A29. Risk: it is an SSRF guard crossing app/api.

---

## How to ticket this

1. **First wave (no dependencies, highest ratio):** the ten dead-code deletions + A1 (doc fix) + A9/A28 (test/dup). Each is a standalone S ticket; lead with A11 (four-finder corroboration) and A1 (read by every test-writing agent).
2. **Second wave:** the renames. Ship A23 (`variant`→`renderMode`) in isolation; do A22 (Multiselect) before B1.
3. **Third wave:** the M-sized moves/extractions (A5, A6, A10, A18, A24, A26, A27, A31). A6 before B8.
4. **Tier 2** stays a decision queue: open one ticket per item, QA-gated, starting where corroboration is strongest — 2B-i (authorization, both reviews' #1) and 2A-i (block-type registry, three sources).

## Source key

- **[Pocock/Mike]** — `improve-codebase-architecture` run, `core-ia.html`, 8 candidates (Mike-run; doubles as Mike's feedback).
- **[Siyang]** — 58-candidate architecture review, 2026-07-08 (`cNN` ids).
- **[Mike]** — modularize-in-place approach + the four ENG-3684 restructure candidates.
- **[Pass 4]** — `docs/plans/2026-07-21-001-refactor-codebase-navigability-audit-fourth-pass.md` (`A#`/`B#` ids), verified against the code 2026-07-21.

---
title: 'feat: Apply chip-filter collection layout to desktop template gallery'
type: feat
status: active
date: 2026-05-27
---

# feat: Apply chip-filter collection layout to desktop template gallery

## Summary

Extend the mobile template-gallery interaction model to desktop: replace the desktop vertical stack of `CollectionCard`s (each rendering its own template grid) with the shared horizontal-scroll **chip row** that filters to one collection at a time. On desktop the content below the chips stays the existing **card grid** (`DraggableJourneysGrid`); mobile keeps its compact list. The chip row, filter header strip, filter state, and drag-to-chip behavior become shared across breakpoints — only the content view differs (grid vs list).

---

## Problem Frame

On desktop, every collection renders as a `CollectionCard` containing its full template grid, stacked vertically. With many collections this consumes a lot of vertical space and pushes the unsectioned ("All Templates") grid far down the page. The mobile redesign already solved this with a horizontal chip row that filters to a single collection; applying that model to desktop reclaims the vertical space while keeping desktop's richer card grid for the templates themselves.

---

## Requirements

- R1. Desktop renders the collection **chip row** (All Templates + one chip per collection) instead of the vertical `CollectionCard` stack.
- R2. Selecting a chip filters the content area to that collection's templates (or unsectioned templates when "All Templates" is active) — one collection at a time.
- R3. Desktop content remains the **card grid** (`DraggableJourneysGrid` of `JourneyCard`); mobile keeps the list rows. This is the only per-breakpoint difference.
- R4. The drag-to-chip behavior works on desktop: drag a grid card onto a collection chip to move it, onto "All Templates" to ungroup, and reorder within the active collection's grid.
- R5. Collection actions (Edit / Preview / Publish / Remove) are available on desktop via the shared filter header strip (no per-collection card menu).
- R6. The "Create Collection" affordance and the `showCollectionsSection` gate (≥1 active template) are preserved on desktop.
- R7. Archived/Trashed tabs (no collections) and the editor/info-panel surfaces are unaffected.

---

## Scope Boundaries

- Not redesigning mobile — mobile behavior is unchanged; this generalizes the already-built mobile pieces to desktop.
- Not changing the drag-end mutation logic (`useDragEndHandler`) — move/reorder/ungroup dispatch is reused as-is.
- Collection description stays edit-dialog-only (per the original NES-1695 plan); it is not surfaced inline in the chip/filter strip.
- Not touching the `LabelChip`, `collectionLayout`, or editor/info-panel work from 9252 beyond what retiring the desktop `CollectionCard` requires.

### Deferred to Follow-Up Work

- Renaming the `Mobile*` components to breakpoint-neutral names (see Key Technical Decisions) — deferred to avoid churn to components + the two `docs/solutions/` docs that reference their paths.

---

## Context & Research

### Relevant Code and Patterns

- `apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx` — owns the `useMobileLayout` branch, the `DndContext` (`collisionDetection`, `measuring`, `DragOverlay`), the filter state (`mobileFilterCollectionId` / `mobileSelectedCollection` / `mobileFilteredJourneys`), the desktop `CollectionCard` stack + `UnsectionedDroppable`, and the `showCollectionsSection` gate.
- `apps/journeys-admin/src/components/TemplateGalleryPageList/MobileCollectionRow/` — chip row; chips are dnd-kit droppables (`encodeDropZoneId`) and filter selectors. Reused as-is.
- `apps/journeys-admin/src/components/TemplateGalleryPageList/MobileFilterHeaderStrip/` — active-collection title + count + `CollectionActionsMenu` (already 48px constant height; renders the menu only for a selected collection).
- `apps/journeys-admin/src/components/TemplateGalleryPageList/Droppables/Droppables.tsx` — `DraggableJourneysGrid` (the desktop card grid, `SortableContext` + `rectSortingStrategy`), `DroppableCollectionWrapper`, `UnsectionedDroppable`, `encodeDropZoneId`/`parseDropZoneId`.
- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionCard/` — desktop collection card (9252 Figma restyle); candidate for retirement.
- `apps/journeys-admin/src/components/TemplateGalleryPageList/useDragEndHandler/` — drop dispatch (move/reorder/ungroup); unchanged.
- Mobile collision pattern: `mobileCollisionDetection` (`pointerWithin`, no `closestCenter` fallback), `snapCenterToPointer` modifier, `measuring: MeasuringStrategy.Always` — all in `TemplateGalleryPageList.tsx`.

### Institutional Learnings

- `docs/solutions/design-patterns/pointer-aligned-collision-offset-drag-handle-2026-05-26.md` — pointer-first collision + pointer-aligned overlay; directly informs U4 (desktop drag onto small chips).
- `docs/solutions/design-patterns/dnd-kit-responsive-sensor-activation-2026-05-26.md` — per-viewport `TouchSensor` activation; the desktop branch keeps `delay: 200` (whole-card draggable), so sensor activation stays as-is.
- Theme spacing token is `1 = 4px` in this repo (affects any new margin/padding math).

---

## Key Technical Decisions

- **Unify around the chip filter; vary only the content view.** Render the chip row + filter strip for both breakpoints; the content area is `useMobileLayout ? MobileTemplateList (list) : DraggableJourneysGrid (grid)`. Rationale: solves the vertical-sprawl problem (R1/R2) with maximum reuse of already-shipped mobile pieces.
- **Pointer-first collision for both layouts.** Switch the desktop `collisionDetection` from `closestCenter` to the shared `pointerWithin` strategy. Rationale: dragging a wide grid card up to a small chip fails under `closestCenter` (card center never near a chip); `pointerWithin` also handles grid reorder (pointer over the target card). The `useDragEndHandler` dispatch is unchanged.
- **Keep the `Mobile*` component names for now.** They become shared but renaming churns the components, their specs, and two `docs/solutions/` docs that cite their paths for cosmetic gain. Add a clarifying comment that they are breakpoint-shared; defer the rename.
- **Retire the desktop `CollectionCard`.** In the chip-filter model there is no per-collection card; its name/status/actions move to the filter strip (already there on mobile). Confirm no other consumers before deleting. `LabelChip` stays (still used by the editor TEMPLATE badge and info-panel RECOMMENDED chip).
- **Chip-row full-bleed is xs/sm only.** The `mx: { xs: -2, sm: -10 }` bleed was tuned for the mobile `MainPanelBody` padding; on desktop the chip row aligns within the gallery padding (no negative margin at `md`). Rationale: desktop padding differs and edge-to-edge is less needed there.

---

## Open Questions

### Resolved During Planning

- Chip row on desktop — **horizontal scroll** (consistent with mobile), reusing the existing chip size (250×72). Wrapping is rejected to keep one chip-row implementation.
- Collection description on desktop — **not shown inline** (edit-dialog only), matching mobile and the original NES-1695 plan.
- Component renaming — **deferred** (keep `Mobile*` names with shared-usage comments).

### Deferred to Implementation

- **Desktop drag overlay form.** Keep the `JourneyCard` preview (with `snapCenterToPointer`) or switch to the compact pill used on mobile? Decide once we can see whether the card ghost covers the chips during a drag-to-chip. Default: try the card preview + snap first.
- **Exact desktop chip-row margins/alignment** at `md`+ — confirm against the live layout.
- **`DroppableCollectionWrapper` fate** — likely fully unused once the collection stack is gone; confirm and remove if so.
- **Confirm no other `CollectionCard` consumers** before deleting the component + spec.

---

## Implementation Units

- U1. **Promote collection-filter state to shared**

**Goal:** Make the filter state drive both layouts, not just the mobile branch.

**Requirements:** R2

**Dependencies:** None

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx`

**Approach:**

- Rename `mobileFilterCollectionId` → `filterCollectionId`, `mobileSelectedCollection` → `selectedCollection`, `mobileFilteredJourneys` → `filteredJourneys`. Default `null` = "All Templates" → unsectioned templates.
- `useMobileLayout` no longer gates the existence of this state; it will only gate the content view (U3). `showCollectionsSection` gating is unchanged.

**Patterns to follow:** existing `mobileSelectedCollection` / `mobileFilteredJourneys` `useMemo` derivations.

**Test scenarios:**

- Test expectation: none — pure rename/state-hoist; behavior is exercised by U3/U5 integration tests.

**Verification:** typecheck passes; no remaining `mobile`-prefixed filter identifiers.

---

- U2. **Render the chip row + filter strip in both layouts**

**Goal:** Move the chip row and filter header strip above the content for desktop as well as mobile.

**Requirements:** R1, R5, R6

**Dependencies:** U1

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx`
- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/MobileCollectionRow/MobileCollectionRow.tsx` (full-bleed margins → xs/sm only; comment that it is breakpoint-shared)
- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/MobileFilterHeaderStrip/MobileFilterHeaderStrip.tsx` (comment shared usage; verify padding at `md`)

**Approach:**

- Render `<MobileCollectionRow>` + `<MobileFilterHeaderStrip>` unconditionally above the content (outside the `useMobileLayout` branch), driven by the shared filter state.
- Gate the chip-row full-bleed `mx` to `{ xs: -2, sm: -10 }` (drop the bleed at `md`+ so it aligns within the gallery's `p: 4`).
- "Create Collection" stays in the existing Collections header; keep `showCollectionsSection` gating.

**Patterns to follow:** current mobile-branch rendering of `MobileCollectionRow` / `MobileFilterHeaderStrip`.

**Test scenarios:**

- Happy path: at a desktop width, the chip row renders with an "All Templates" chip + one chip per collection. (Covers R1.)
- Happy path: the filter strip shows the active collection's name + count and its actions menu when a collection chip is selected; shows "All Templates" with no menu otherwise. (Covers R5.)
- Edge case: `showCollectionsSection` false (no active templates) → no chip row / header.

**Verification:** desktop renders the chip row + strip above the content; mobile unchanged.

---

- U3. **Desktop content → filtered card grid; retire the collection stack**

**Goal:** Replace the desktop vertical `CollectionCard` stack + separate unsectioned grid with a single `DraggableJourneysGrid` of the active filter's templates.

**Requirements:** R1, R2, R3, R7

**Dependencies:** U1, U2

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx`
- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/Droppables/Droppables.tsx` (remove `DroppableCollectionWrapper` if unused after this change)

**Approach:**

- Content area becomes `useMobileLayout ? <MobileTemplateList journeys={filteredJourneys} .../> : <DraggableJourneysGrid journeys={filteredJourneys} publishedLock={selectedCollection?.status === published} dragInFlight={interactionsLocked} />`.
- Mirror the mobile empty states: collection selected + empty → "drag templates here"; All Templates empty → "No team templates yet." / "All templates are in collections."
- Remove the `collections.map(<DroppableCollectionWrapper><CollectionCard><DraggableJourneysGrid/></CollectionCard></DroppableCollectionWrapper>)` block and the standalone `UnsectionedDroppable` section.
- Reorder within the grid stays via its `SortableContext`; "All Templates" (unsectioned) has no stored order → reorder no-op (existing `useDragEndHandler` branch).

**Patterns to follow:** the mobile content branch (`mobileFilteredJourneys`, `allowReorder`, empty-state copy); existing `DraggableJourneysGrid`.

**Test scenarios:**

- Happy path: selecting a collection chip renders that collection's templates in the grid; "All Templates" renders the unsectioned grid. (Covers R2, R3.)
- Edge case: empty selected collection → drag-here empty state; All Templates empty → appropriate empty copy.
- Integration: archived/trashed status (no collections) renders unchanged. (Covers R7.)

**Verification:** desktop shows one collection's grid at a time under the chip row; no vertical card stack remains.

---

- U4. **Unify drag: pointer-first collision + desktop overlay**

**Goal:** Make drag-to-chip and grid reorder work on desktop with the mobile collision approach.

**Requirements:** R4

**Dependencies:** U2, U3

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx`

**Approach:**

- Use the pointer-first `collisionDetection` for both layouts (rename `mobileCollisionDetection` → `collectionCollisionDetection`, or apply it unconditionally). `measuring: MeasuringStrategy.Always` already applies to both.
- Desktop `DragOverlay`: start with the existing `JourneyCard` preview plus `snapCenterToPointer`; if the card ghost covers the chips during a drag-to-chip, switch to the compact pill (deferred decision).
- Sensor activation unchanged (desktop whole-card `delay: 200`, mobile handle `distance: 8`).

**Patterns to follow:** `pointer-aligned-collision-offset-drag-handle` learning; existing `snapCenterToPointer` / `DragOverlay`.

**Test scenarios:**

- Integration (drag-end dispatch, via `useDragEndHandler` — already covered): drop on a collection chip → move; drop on All Templates → ungroup; reorder within a selected collection → reorder; unsectioned reorder → no-op. Confirm these still pass with the unified collision.
- Note: collision geometry itself is not unit-testable (jsdom has no layout) → manual QA at desktop widths.

**Verification:** manual QA — drag a grid card onto a chip (moves), onto All Templates (ungroups), reorder within a collection; published chip shows the blocked state.

---

- U5. **Retire `CollectionCard` and update specs**

**Goal:** Remove the now-dead desktop collection card and bring tests in line with the unified layout.

**Requirements:** R5

**Dependencies:** U3

**Files:**

- Delete (if no other consumers): `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionCard/CollectionCard.tsx` + `CollectionCard.spec.tsx` + `index.ts`
- Modify: `apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.spec.tsx`
- Modify: any spec asserting the desktop collection stack

**Approach:**

- Confirm `CollectionCard` has no other importers (grep) before deleting. Keep `LabelChip` (used elsewhere).
- Rewrite `TemplateGalleryPageList.spec` desktop assertions: chip row + filtered grid instead of the vertical card stack; collection actions reachable via the filter strip; empty states.

**Patterns to follow:** existing mobile-oriented specs (`MobileCollectionRow.spec`, `MobileFilterHeaderStrip.spec`) for the required provider stack.

**Test scenarios:**

- Happy path: desktop render shows chip row + grid; selecting a chip filters the grid. (Covers R2, R3.)
- Happy path: collection actions menu opens from the filter strip on desktop. (Covers R5.)
- Edge case: no active templates → Collections section hidden.

**Verification:** `npx jest --config apps/journeys-admin/jest.config.ts --no-coverage 'apps/journeys-admin/src/components/TemplateGalleryPageList'` passes; no dangling `CollectionCard` imports.

---

## System-Wide Impact

- **Interaction graph:** `TemplateGalleryPageList` is the only consumer of these components; the editor, info panel, and Journeys tab are unaffected. `useDragEndHandler` and `encodeDropZoneId`/`parseDropZoneId` are reused unchanged.
- **API surface parity:** desktop and mobile now share the chip row + filter strip + drag model — they cannot drift.
- **Unchanged invariants:** `LabelChip`, `collectionLayout`, and the editor/info-panel surfaces remain; the drop-zone encoding and mutation dispatch are untouched. Archived/Trashed tabs render as before.
- **Blast radius:** retiring `CollectionCard` removes one `LabelChip` consumer but `LabelChip` itself stays.

---

## Risks & Dependencies

| Risk                                                                            | Mitigation                                                                                                                 |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Supersedes 9252's just-merged desktop `CollectionCard` restyle                  | Confirmed acceptable by product owner; delete cleanly, keep `LabelChip`/`collectionLayout` for their other uses            |
| Loss of multi-collection overview on desktop                                    | Confirmed intended — the vertical-stack sprawl is the motivating problem                                                   |
| Dragging a large grid card onto a small chip feels awkward / ghost covers chips | Pointer-first collision + `snapCenterToPointer`; fall back to the compact pill overlay if needed (deferred decision in U4) |
| Collision geometry not unit-testable                                            | Rely on `useDragEndHandler` dispatch tests + manual QA at desktop widths                                                   |
| Significant spec churn (desktop stack assertions)                               | Scoped to U5; reuse the established provider-stack patterns                                                                |

---

## Sources & References

- Ticket: NES-1695 / PR #9249 (`siyangcao/nes-1695-collection-edit-mobile`)
- Related code: `apps/journeys-admin/src/components/TemplateGalleryPageList/`
- Learnings: `docs/solutions/design-patterns/pointer-aligned-collision-offset-drag-handle-2026-05-26.md`, `docs/solutions/design-patterns/dnd-kit-responsive-sensor-activation-2026-05-26.md`
- Working tree: `.claude/worktrees/nes-1695-update` (branch `siyangcao/nes-1695-collection-edit-mobile`, up to date with `main`)

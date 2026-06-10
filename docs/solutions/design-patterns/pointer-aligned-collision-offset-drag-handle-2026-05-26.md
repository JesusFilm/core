---
title: Pointer-aligned collision detection for offset drag handles onto small drop targets
date: 2026-05-26
category: design-patterns
module: journeys-admin
problem_type: design_pattern
component: tooling
severity: medium
applies_when:
  - A single dnd-kit DndContext where the draggable's handle is offset from its body (e.g. a handle column on the far right of a wide row)
  - Drop targets are small relative to the draggable (chips, pills, icons)
  - Drop targets are sticky or in a horizontally-scrollable container whose rects go stale mid-drag
  - Only pointer sensors (mouse/touch) are configured — no KeyboardSensor
tags: [dnd-kit, drag-and-drop, collision-detection, pointer-within, drag-overlay, mobile, useMediaQuery]
---

# Pointer-aligned collision detection for offset drag handles onto small drop targets

## Context

A single `DndContext` drives both desktop and mobile layouts of the template
gallery. On mobile the drag ergonomics are adversarial to dnd-kit's defaults:

- **The draggable is a full-width list row, but the drag handle is offset.**
  `SortableMobileTemplateListRow` binds `listeners`/`attributes` only to a
  narrow right-side handle column (`setActivatorNodeRef` on a ~44px handle), so
  the pointer lives at the row's right edge while the visible body extends far
  to the left.
- **The drop targets are small collection chips** pinned in a sticky,
  horizontally-scrollable row at the top of the view (`MobileCollectionRow`).
- **Activation is distance-based** (`TouchSensor`/`MouseSensor` with
  `activationConstraint: { distance: 8 }` on mobile), so a drag starts
  immediately on a small handle.

dnd-kit's stock recipe (`closestCenter` + a body-sized `DragOverlay` + one-shot
droppable measurement) produces three compounding failures here: the wide row's
geometric centre is never near a small chip, the ghost detaches to the left of
the finger, and the chip hit-areas go stale the moment the sticky row scrolls.
The QA reports were: "only the first two chips are droppable," the drop zone
"is far left," and "All Templates highlights on every drag before I'm near it."

## Guidance

Scope four coordinated changes to the mobile layout behind `useMediaQuery`, so
desktop keeps the defaults.

### 1. Pointer-only collision detection — no `closestCenter` fallback

```ts
const mobileCollisionDetection: CollisionDetection = (args) => pointerWithin(args)
```

`pointerWithin` resolves only the droppable the pointer is genuinely inside, and
returns nothing in dead space. The common community recipe wraps it with a
`closestCenter` fallback (`const hits = pointerWithin(args); return hits.length ? hits : closestCenter(args)`).
**Do not do that here.** That fallback is exactly what lit up the nearest chip
("All Templates") the instant a drag started, before the finger was over any
target — `closestCenter` always returns _something_. The fallback exists to
support coordinate-free sensors (keyboard), but this context only registers
`MouseSensor` and `TouchSensor`, which always report pointer coordinates — so
the fallback buys nothing and costs a phantom highlight.

### 2. Snap the drag overlay to the pointer (inline modifier, no extra dependency)

Because the handle is offset to the right, the default overlay trails left of
the finger. This is the core bug: collision is computed at the _real cursor_,
but the user aims the _ghost they can see_. Re-centring the ghost on the pointer
makes "aim the ghost" identical to "aim the cursor." The inline modifier avoids
pulling in `@dnd-kit/modifiers` (not installed):

```ts
const snapCenterToPointer: Modifier = ({ activatorEvent, draggingNodeRect, transform }) => {
  if (draggingNodeRect == null || activatorEvent == null) return transform
  // activatorEvent is the mouse/touch event that started the drag.
  const event = activatorEvent as Partial<MouseEvent> & { touches?: TouchList }
  const clientX = event.touches?.[0]?.clientX ?? event.clientX
  const clientY = event.touches?.[0]?.clientY ?? event.clientY
  if (clientX == null || clientY == null) return transform
  const offsetX = clientX - draggingNodeRect.left
  const offsetY = clientY - draggingNodeRect.top
  return {
    ...transform,
    x: transform.x + offsetX - draggingNodeRect.width / 2,
    y: transform.y + offsetY - draggingNodeRect.height / 2
  }
}
```

It reads the pointer coordinate from the activator event (touch first, then
mouse), computes where the pointer sat inside the dragged node, then shifts the
transform so the node's centre lands under the pointer. It returns the untouched
`transform` whenever the rect or coordinates are missing, so it degrades safely.

### 3. Compact pill overlay instead of a full-width row ghost

A body-sized ghost centred on the pointer would cover the very chip being
targeted and hide its drop highlight. Render a small pill the pointer can sit on
top of without occluding the target:

```tsx
<DragOverlay modifiers={useMobileLayout ? [snapCenterToPointer] : undefined}>
  {activeDragJourney != null ? (
    useMobileLayout ? (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          maxWidth: 220,
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 6,
          opacity: 0.95,
          pointerEvents: 'none'
        }}
      >
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {activeDragJourney.title}
        </Typography>
      </Box>
    ) : (
      /* desktop: full JourneyCard */
    )
  ) : null}
</DragOverlay>
```

### 4. Continuous droppable measurement

A sticky, horizontally-scrollable drop row has rects that move after drag start.
Re-measure every frame so the drawn chip and its registered hit-area stay
aligned:

```tsx
<DndContext
  collisionDetection={
    useMobileLayout ? mobileCollisionDetection : closestCenter
  }
  measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
  sensors={sensors}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
```

Desktop (whole-card draggable, large drop zones) keeps `closestCenter` and the
full-card overlay via the `useMobileLayout` gate.

## Why This Matters

- **Ghost/cursor disagreement makes small targets unhittable.** When the handle
  is offset from the draggable body, the visible ghost and the collision cursor
  diverge. The user steers the ghost; dnd-kit decides hits by the cursor. The
  wider the row, the further apart they sit — so distant small chips can never
  be reached. Snapping the ghost to the pointer collapses the two reference
  frames into one.
- **A `closestCenter` fallback after `pointerWithin` causes phantom
  highlights.** `closestCenter` always returns the nearest droppable, so the
  fallback fires in dead space and lights up a target the user isn't aiming at.
  With pointer-only sensors there is no scenario that needs a coordinate-free
  fallback, so it is pure downside.
- **Stale rects break a scrolling drop row.** dnd-kit measures droppables once
  at drag start by default. A sticky, horizontally-scrollable container moves
  its children after that snapshot, so the drawn chip and its hit-area drift
  apart. `MeasuringStrategy.Always` keeps them aligned.

## When to Apply

Reach for this pattern when **any** of these hold (and especially when several
stack, as here):

- The drag handle is **offset from the draggable's visual body** (a handle
  column, a corner icon) rather than the whole element being the grab surface →
  snap the overlay to the pointer.
- Drop targets are **small relative to the draggable** (chips, icons, tags) →
  use `pointerWithin` so collision tracks the finger, not the wide element's
  centre.
- The drop container is **sticky and/or scrollable** during the drag →
  `MeasuringStrategy.Always`.
- The context uses **pointer-only sensors** (mouse/touch, no keyboard) → you can
  safely drop the `closestCenter` fallback. If you _do_ register a
  `KeyboardSensor`, keep a fallback, because keyboard drags have no pointer
  coordinates.

Conversely, when the whole element is the grab surface, targets are large, and
the layout is static (the desktop case here), the dnd-kit defaults are correct —
keep them, and scope the overrides behind a layout flag.

## Examples

```ts
// Before — wide row's centre vs small chip centres; nothing near.
collisionDetection = { closestCenter }

// Before (community recipe) — fallback fires in dead space, lights up the
// nearest chip even when the finger is over nothing.
const detect = (args) => {
  const hits = pointerWithin(args)
  return hits.length > 0 ? hits : closestCenter(args)
}

// After — pointer-only; no highlight until the finger is over a target.
const mobileCollisionDetection: CollisionDetection = (args) => pointerWithin(args)
```

```tsx
// Before — full-width, left-anchored ghost detaches from an offset handle and
// covers the chip being targeted.
<DragOverlay>
  <Box sx={{ maxWidth: 360 }}>
    <MobileTemplateListRow journey={activeDragJourney} hideDefaultDragHandle />
  </Box>
</DragOverlay>

// After — compact pill centred on the pointer; aim-the-ghost == aim-the-cursor.
<DragOverlay modifiers={[snapCenterToPointer]}>
  <Box sx={{ maxWidth: 220, px: 1.5, py: 1 /* pill styles */ }}>
    <Typography variant="body2" noWrap>{activeDragJourney.title}</Typography>
  </Box>
</DragOverlay>
```

The pattern lives in
`apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx`
(`mobileCollisionDetection`, `snapCenterToPointer`, the `DndContext`
`collisionDetection`/`measuring`, and the mobile `DragOverlay` pill). The
right-side drag handle that creates the offset is in
`apps/journeys-admin/src/components/TemplateGalleryPageList/MobileTemplateList/SortableMobileTemplateListRow.tsx`.

## Related

- `docs/solutions/design-patterns/dnd-kit-responsive-sensor-activation-2026-05-26.md`
  — the sibling half of the same component's drag hardening: _when_ a drag
  starts (per-viewport `TouchSensor` activation). This doc covers _where_ it
  lands and where the ghost sits. Together they describe reliable drag-and-drop
  in the mobile template gallery.
- `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md`
  — drag _state_ management for the same gallery (single-flight gating,
  `dropAnimation` snap-back, busy guards) — the transactional axis, orthogonal
  to collision/overlay.

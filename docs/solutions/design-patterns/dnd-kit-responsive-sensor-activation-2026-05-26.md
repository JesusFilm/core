---
title: Switching dnd-kit TouchSensor activation by viewport
date: 2026-05-26
category: design-patterns
module: journeys-admin
problem_type: design_pattern
component: tooling
severity: medium
applies_when:
  - A single DndContext serves both a whole-element draggable (desktop) and a small drag-handle draggable (mobile)
  - You want immediate drag on mobile from a dedicated handle, but a long-press protective delay on desktop where the whole element is draggable
  - Switching DndContexts per breakpoint would split state and break shared drop-zone routing
tags: [dnd-kit, sensors, touch, responsive, useMediaQuery, drag-and-drop]
---

# Switching dnd-kit TouchSensor activation by viewport

## Context

When the same dnd-kit `DndContext` powers two responsive layouts —
desktop where the whole card/row is the draggable, and mobile where
only a small handle column is draggable — the right `TouchSensor`
activation differs by layout:

- **Whole-element draggable (desktop):** any touch + movement on a card
  is also the gesture for scrolling the list. A `delay: 200ms` long-press
  protects vertical scroll from becoming an accidental drag.
- **Small-handle draggable (mobile):** the handle is a narrow ~44px
  column that the user touches deliberately. A long-press here is
  friction with no upside — accidental drags are basically impossible
  on such a small target. `distance: 8` (start drag after 8px of
  movement) gives immediate response without the wait.

`TouchSensor` activation is a single options object per sensor — it
doesn't vary per draggable. Two separate `DndContext`s would split
drag state and break shared drop-zone routing (the chip drop targets
should accept drops from any row regardless of which layout rendered
the row).

## Guidance

Switch the `TouchSensor` options object based on a viewport media
query while keeping a single `DndContext`:

```tsx
import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const isMobileLayout = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor, isMobileLayout ? { activationConstraint: { distance: 8 } } : { activationConstraint: { delay: 200, tolerance: 5 } }))
```

`useSensor`'s second argument is a plain options object. Changing it
between renders is safe — dnd-kit re-reads options when the next drag
starts, so the new activation rule applies on the next gesture.

`MouseSensor` keeps `distance: 8` for both layouts; the long-press
issue is touch-specific.

## Why This Matters

The naive "drop the 200ms delay globally" answer breaks tablets that
fall on the desktop side of the breakpoint — touch-on-card with no
delay turns every scroll attempt into a drag. The naive "keep the
delay always" answer makes the mobile drag handle feel laggy: the
user touches a dedicated handle and has to wait 200ms before anything
moves.

Splitting into two `DndContext`s would also work but adds real cost:
each context owns its own active-drag state, droppables, and sensor
list. Drop targets registered in one context cannot accept drops
initiated in the other. For a shared chip row that should be a drop
target regardless of which layout originated the drag, that splits
the design unnecessarily.

## When to Apply

- Shared dnd-kit `DndContext` across breakpoints.
- Different draggable surface area per breakpoint (e.g., whole card vs
  drag-handle column).
- Drop targets are shared across layouts.

If draggables and droppables are fully partitioned per layout (no shared
drop targets), two `DndContext`s is fine and arguably simpler.

## Examples

The pattern lives in
`apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx`
(NES-1695). The mobile rows bind dnd-kit `listeners` only to a
dedicated drag handle inside `SortableMobileTemplateListRow`, so a tap
on the row body still triggers `NextLink` navigation — combined with
the `distance: 8` activation, the handle starts a drag on the first
8px of movement while the rest of the row stays tappable.

Desktop continues to bind `listeners` to the whole card via
`DraggableJourneysGrid`, where the `delay: 200, tolerance: 5`
activation prevents scroll-into-drag.

## Related

- `apps/journeys-admin/src/components/TemplateGalleryPageList/Droppables/Droppables.tsx`
  — shared drop-zone encoding (`encodeDropZoneId` / `parseDropZoneId`)
  that survives the layout switch unchanged.
- `apps/journeys-admin/src/components/TemplateGalleryPageList/useDragEndHandler/`
  — the drag-end dispatcher; reuses the same drop-zone identity across
  both layouts because the encoded IDs are identical.

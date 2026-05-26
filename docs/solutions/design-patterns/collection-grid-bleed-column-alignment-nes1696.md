---
title: "Column-aligning an inset bordered container's grid with a full-width sibling grid (MUI negative-margin bleed)"
date: 2026-05-26
category: design-patterns
module: journeys-admin/template-gallery
problem_type: design_pattern
component: tooling
severity: low
applies_when:
  - "A bordered/padded container (e.g. MUI Card variant=outlined) hosts a grid that must column-align with a full-width sibling grid"
  - "Both grids share the same breakpoints and gap but sit in containers of different widths"
  - "The container uses box-sizing: border-box so border + padding count inside its width"
related_components:
  - apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx
  - apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionCard/CollectionCard.tsx
  - apps/journeys-admin/src/components/TemplateGalleryPageList/Droppables/Droppables.tsx
  - apps/journeys-admin/src/components/TemplateGalleryPageList/collectionLayout.ts
tags:
  - mui
  - grid-alignment
  - negative-margin
  - layout
  - box-sizing
  - shared-constants
  - theme-spacing
---

# Column-aligning an inset bordered container's grid with a full-width sibling grid (MUI negative-margin bleed)

## Context

In the Team Templates gallery (`apps/journeys-admin`, NES-1696) the page stacks two grids of template cards:

1. A **Collections** section — one or more bordered "collection boxes," each an MUI `<Card variant="outlined">` with a 1px border and inner padding, holding that collection's template cards.
2. An **All Templates** (unsectioned) section — a full-width grid of every ungrouped template, with no surrounding box.

Both are MUI `<Grid container>` with the **same breakpoints** (`{ xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }`). You'd expect column 2 of a collection box to line up vertically with column 2 of the All Templates grid below. It didn't.

The cause is a width mismatch. The collection grid lives **inside** the Card's content box, inset from the page width by `padding-left + padding-right + 2 × border`. The All Templates grid runs at the **full page content width**. The same breakpoint fractions over two different container widths produce different column boundaries and different card widths, so columns drift (worse toward the right) and cards aren't even the same size.

A naive earlier version made it worse by stacking **two** inset layers: the Card's own padding *plus* a redundant inner padding wrapper inside the shared grid component (an `outerPadding` prop). The collection side was inset twice; the unsectioned side not at all.

## Guidance

Make the bordered container's **content box** occupy the same horizontal span `[L, R]` as the full-width sibling, then render the **same grid component** (same breakpoints, same gap) in both places. When the two grids share identical geometry, column alignment is free — there's no per-column math to keep in sync.

1. **One inset layer, not two.** Render the same shared grid component in both sections and delete any redundant inner padding wrapper. The only inset on the collection side is the Card's own padding; the unsectioned side has none.
2. **Bleed the box outward with a negative margin** equal to `(card horizontal padding + border width)`. With `box-sizing: border-box` (MUI's default), pulling the box's outer edges left/right by exactly that amount makes the Card's *content* box equal the page content box. The inner grid then spans the same `[L, R]` as the sibling.
3. **Share the gap, too.** Use the same grid component for both so `spacing` is defined once — different gaps would diverge the interior column boundaries even at equal width.
4. **Put the bleed on the layout wrapper, not the Card.** Here the negative margin lives on the collections `Stack` wrapping each droppable, so the per-collection drag-over outline (on the droppable `Box`) bleeds outward *with* the card instead of being clipped or offset.
5. **Extract the coupled constants to one module** so the three values that must move in lockstep can't silently drift:

```ts
// collectionLayout.ts
export const COLLECTION_CARD_PADDING = 3          // theme spacing units
export const COLLECTION_CARD_BORDER_WIDTH = 1     // literal pixels
export const COLLECTION_GRID_SPACING = COLLECTION_CARD_PADDING
```

The bleed is computed from the first two; the gap is the third (kept equal to the padding by design, so the card→edge gap matches the card→card gap).

### The spacing-unit subtlety

This repo customizes the MUI theme spacing unit to **1 = 4px** (not the default 8px) — see [conventions/mui-spacing-token-is-4px](../conventions/mui-spacing-token-is-4px-2026-05-24.md) *(auto memory [claude])*. So `theme.spacing(3)` resolves to **12px**, not 24px. The border is a literal `1px`, not a spacing unit. The bleed therefore combines a spacing-unit term with a raw-pixel term via `calc()`:

```ts
mx: (theme) =>
  `calc(${theme.spacing(-COLLECTION_CARD_PADDING)} - ${COLLECTION_CARD_BORDER_WIDTH}px)`
// → calc(-12px - 1px) = -13px each side
```

Keep it derived — don't collapse it to `-13px` — so editing the padding constant keeps the bleed correct automatically.

## Why This Matters

- **Alignment becomes structural, not coincidental.** Two grids with the same breakpoints only align if their containers are the same width. Equalizing width once removes the entire class of "off by a few px per column" bugs instead of patching individual columns.
- **Eliminates silent drift.** The padding, the bleed, and the gap are three numbers that must agree. Hand-synced magic numbers across files drift the moment someone tweaks the padding. Deriving the bleed and gap from shared constants means one edit propagates correctly.
- **Avoids the doubled-inset trap.** A single, well-understood inset (the Card's padding) is easier to reason about and to bleed against than two stacked layers.
- **Keeps drag affordances correct.** Bleeding the wrapper (not the Card) keeps the drop-target outline tracking the visible card edges.

## When to Apply

Reach for the negative-margin bleed whenever a **bordered or padded container must host a grid (or any width-sensitive layout) that should column-align with a full-width sibling** rendered outside that container. Signals:

- Two sections use the same responsive grid breakpoints but live at different container widths.
- A card/panel/section has its own padding + border and sits inset from the page, while a sibling spans the full content width.
- You catch yourself trying to *adjust the breakpoints* of one grid to compensate — that's the wrong layer; equalize the container width instead.

Preconditions: the container uses `box-sizing: border-box` (MUI default) and the inset is computable (padding + border). If padding/border are responsive, the bleed must be responsive too (same breakpoints).

## Examples

### Before — two inset layers, box not bled

The shared grid added its own inner padding *and* the Card added padding, so the collection grid was inset twice; nothing pulled the box back out to page width.

```tsx
// Droppables.tsx — grid carried a redundant inner inset (outerPadding)
<SortableContext items={ids} strategy={rectSortingStrategy}>
  <Box sx={outerPadding ? { p: { xs: 2.5, sm: 4 } } : undefined}>
    <Grid container spacing={4}>
      {/* cards */}
    </Grid>
  </Box>
</SortableContext>
```

```tsx
// TemplateGalleryPageList.tsx — collections Stack at default (inset) width
<Stack spacing={2} sx={{ mb: 4 }}>
  {collections.map((collection) => (
    <DroppableCollectionWrapper /* ... */>
      <CollectionCard /* p: 2 */>
        <DraggableJourneysGrid /* outerPadding defaults true */ />
      </CollectionCard>
    </DroppableCollectionWrapper>
  ))}
</Stack>
```

Result: collection grid width = page width − (card padding ×2 + border ×2 + inner wrapper ×2); All Templates grid width = page width. Columns and card sizes don't match.

### After — single inset layer, box bled to page width

```ts
// collectionLayout.ts — the three coupled constants
export const COLLECTION_CARD_PADDING = 3        // 3 × 4px = 12px
export const COLLECTION_CARD_BORDER_WIDTH = 1   // px
export const COLLECTION_GRID_SPACING = COLLECTION_CARD_PADDING
```

```tsx
// Droppables.tsx — no inner wrapper; gap derived from the constant
<SortableContext items={ids} strategy={rectSortingStrategy}>
  <Grid container spacing={COLLECTION_GRID_SPACING}>
    {journeys.map((journey) => (
      <Grid key={journey.id} size={{ xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }}>
        <DraggableJourney journey={journey} disabled={publishedLock || dragInFlight} />
      </Grid>
    ))}
  </Grid>
</SortableContext>
```

```tsx
// CollectionCard.tsx — a single inset: the Card's own padding + border
<Card
  variant="outlined"
  sx={{
    p: COLLECTION_CARD_PADDING,                 // 12px
    borderWidth: COLLECTION_CARD_BORDER_WIDTH,  // 1px
    borderStyle: 'solid',
    borderColor: 'divider',
    borderRadius: 3,
    boxShadow: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.4)'
  }}
>
  {/* header + DraggableJourneysGrid */}
</Card>
```

```tsx
// TemplateGalleryPageList.tsx — bleed the Stack outward by padding + border
<Stack
  spacing={2}
  sx={{
    mb: 4,
    mx: (theme) =>
      `calc(${theme.spacing(-COLLECTION_CARD_PADDING)} - ${COLLECTION_CARD_BORDER_WIDTH}px)`
    // → calc(-12px - 1px) = -13px
  }}
>
  {/* DroppableCollectionWrapper → CollectionCard → DraggableJourneysGrid */}
</Stack>

{/* unsectioned section renders the SAME grid at native page width */}
<UnsectionedDroppable disabled={interactionsLocked}>
  <DraggableJourneysGrid journeys={unsectioned} publishedLock={false} dragInFlight={interactionsLocked} />
</UnsectionedDroppable>
```

With `box-sizing: border-box`, the bleed cancels the Card's padding + border at the outer edges, so the Card's content box spans the same `[L, R]` as the unsectioned grid. Identical breakpoints + identical spacing over identical width → columns and card sizes align exactly, with zero per-column compensation.

## Related

- [best-practices/template-gallery-page-collections-patterns-nes1539](../best-practices/template-gallery-page-collections-patterns-nes1539.md) — the sibling catalog of TemplateGalleryPageList patterns (cache, DnD, Formik, auth). This doc adds the layout/alignment pattern it doesn't cover.
- [conventions/mui-spacing-token-is-4px](../conventions/mui-spacing-token-is-4px-2026-05-24.md) — the authority for the bleed offset math; this repo's `theme.spacing(n)` is `n × 4px`, so always combine spacing terms with literal-px terms (like the 1px border) via `calc()`.
- Ticket: NES-1696. PR: #9252.

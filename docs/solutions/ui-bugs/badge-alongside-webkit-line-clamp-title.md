---
title: Adding a badge alongside a `-webkit-line-clamp` title in MUI
category: ui-bugs
date: 2026-04-28
tags:
  - mui
  - layout
  - chip
  - line-clamp
  - journeys-admin
  - editor
linear: NES-1549
---

# Adding a badge alongside a `-webkit-line-clamp` title in MUI

## Problem

When you place a small label/badge (e.g. an MUI `Chip`) next to a title that uses `display: -webkit-box` + `-webkit-line-clamp` for multi-line truncation, two things go wrong if you naively wrap them in a horizontal `Stack`:

1. On narrow widths (xs), the title clamps to 2 lines while the badge stays a single line. With `alignItems="center"` the badge floats vertically centred against the 2-line block, which looks misaligned.
2. The title can shrink past zero unless the row container has `minWidth: 0` and the title itself has `minWidth: 0, flexShrink: 1` — `-webkit-line-clamp` requires the inline element to have a constrained width to actually trigger ellipsis.

## Solution

Wrap the existing `Typography` and the new `Chip` in a `Stack direction="row"` with **breakpoint-aware** `alignItems`. Keep the title shrinkable, the chip not.

```tsx
<Stack direction="row" alignItems={{ xs: 'flex-start', md: 'center' }} gap={1} sx={{ minWidth: 0 }}>
  <Typography
    sx={{
      display: { xs: '-webkit-box', md: 'unset' },
      '-webkit-line-clamp': { xs: '2', md: '1' },
      '-webkit-box-orient': 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: 0,
      flexShrink: 1
    }}
  >
    {title}
  </Typography>
  <Chip label="TEMPLATE" size="small" sx={{ flexShrink: 0, height: 20, fontSize: 10 }} />
</Stack>
```

Key bits:

- `alignItems: { xs: 'flex-start', md: 'center' }` — line up with the first line on xs (where the title may wrap to 2), centre on md+ (where it stays one line).
- `minWidth: 0` on both the parent row and the title — required for flexbox children to shrink below their intrinsic width, which is what makes ellipsis kick in.
- `flexShrink: 0` on the chip so the title gets the squeeze, not the badge.

## Where this came up

Adding the "TEMPLATE" badge to the journey editor toolbar header — see [JourneyDetails.tsx](../../../apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/JourneyDetails.tsx). The original title `Typography` was the direct child of a vertical `Stack` and the line-clamp + ellipsis behaviour was clean. Wrapping it in a horizontal `Stack` re-introduced the issue above.

## Prevention

When adding any sibling element next to a clamped/ellipsised title, do these three things in one go:

1. Add `minWidth: 0` to the new row container.
2. Add `minWidth: 0` and `flexShrink: 1` to the title.
3. Set `alignItems` per-breakpoint if the title's clamp varies by breakpoint (`xs: '2'`, `md: '1'` etc.).

A quick visual check at xs in Storybook with a long title is the cheapest way to catch a regression — see the `TemplateBadge` story in `JourneyDetails.stories.tsx`.

## Related

- MUI `Chip` precedent for compact pill badges: [JourneyCard.tsx](../../../apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCard.tsx) ("New" badge).
- Existing `journey.template === true` checks: `Toolbar.tsx`, `Menu.tsx`, `Items.tsx`.

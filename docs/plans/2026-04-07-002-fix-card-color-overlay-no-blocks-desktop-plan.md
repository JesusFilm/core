---
title: "fix: Card color filter missing on desktop in contained mode with no blocks"
type: fix
status: completed
date: 2026-04-07
---

# fix: Card color filter missing on desktop in contained mode with no blocks

## Overview

The card color filter/overlay is not rendered on desktop (`sm`+ breakpoint) in contained mode when the card has an image but no content blocks. The bug was reported as NES-512 "Card color with RTL buggy" because it was noticed during RTL testing, but the root cause is **not RTL-specific** -- it affects both LTR and RTL equally.

## Problem Statement / Motivation

When NES-431 added the opacity/filter setting for Card properties, the implementation only provided a desktop color overlay in the **with-blocks** branch of `ContainedCover.tsx`. The **no-blocks** branch explicitly sets `background: 'unset'` on the `sm` breakpoint, meaning no color filter is applied on desktop when the card has no content blocks. This is a production bug.

## Proposed Solution

Update the no-blocks branch in `ContainedCover.tsx` to apply the `backgroundColor` as a full-card overlay on desktop, and make the `StyledGradientBackground` element cover the full card height on desktop (currently hardcoded to 300px).

## Technical Considerations

### Root Cause Analysis

In `ContainedCover.tsx`, there are two rendering branches inside `CardOverlayContentContainer`:

**With blocks (lines 237-311)** -- works correctly:
- Renders `overlay-gradient` element with `backgroundColor: ${baseBackgroundColor}FF` (solid color)
- Uses `mask: overlayGradient('right')` to create a directional fade from transparent (image side) to solid (content side)
- RTL works because `stylis-plugin-rtl` auto-flips `to right` -> `to left` and `pl` -> `pr`

**Without blocks (lines 312-328)** -- broken:
- Renders `StyledGradientBackground` with `background: { xs: linear-gradient(...), sm: 'unset' }`
- On mobile (`xs`): works -- renders a 300px gradient from transparent to backgroundColor at the bottom
- On desktop (`sm`): broken -- `'unset'` means no overlay at all

### Fix Approach

In the no-blocks branch, change the `sx` prop on `StyledGradientBackground`:

1. **Background**: Replace `sm: 'unset'` with `sm: backgroundColor`. The `backgroundColor` prop already carries the user-configured alpha/opacity, so using it directly creates a uniform color tint over the image at the correct opacity level.

2. **Height**: Add `height: { sm: '100%' }` to the `sx` prop override. The styled component's base `height: '300px'` is correct for mobile (partial gradient at bottom). On desktop, we need full-card coverage. Override via `sx` rather than changing the styled component definition to keep the mobile behavior intact.

### Why this is NOT RTL-specific

The no-blocks branch (lines 312-328) has zero references to `rtl`. The `background: 'unset'` applies identically for both LTR and RTL. The fix naturally resolves both directions since the overlay is a non-directional solid color.

## Acceptance Criteria

- [ ] On desktop, contained mode card with image + no blocks shows the color filter overlay
- [ ] The overlay uses the card's `backgroundColor` (including user-configured opacity)
- [ ] The overlay covers the full card area on desktop
- [ ] Mobile rendering remains unchanged (300px gradient at bottom)
- [ ] With-blocks rendering is not affected
- [ ] Works correctly in both LTR and RTL
- [ ] Unit tests added for the no-blocks rendering path
- [ ] Existing tests continue to pass

## Dependencies & Risks

- **Low risk**: The change is scoped to 2 lines in the `sx` prop of a single JSX element
- **No RTL-specific logic needed**: The fix is a solid color overlay, not directional
- **StyledGradientBackground base style unchanged**: Override via `sx` only, preserving mobile behavior
- **Video + no blocks**: Same fix applies -- the overlay tints the video at the configured opacity

## MVP

### ContainedCover.tsx (lines 312-328)

```tsx
// Before:
<StyledGradientBackground
  className="overlay-gradient"
  sx={{
    background: {
      xs: `linear-gradient(to bottom, ${reduceHexOpacity(backgroundColor, 100)} 0%, ${reduceHexOpacity(backgroundColor, 70)} 60%, ${backgroundColor} 100%)`,
      sm: 'unset'
    }
  }}
/>

// After:
<StyledGradientBackground
  className="overlay-gradient"
  sx={{
    height: { sm: '100%' },
    background: {
      xs: `linear-gradient(to bottom, ${reduceHexOpacity(backgroundColor, 100)} 0%, ${reduceHexOpacity(backgroundColor, 70)} 60%, ${backgroundColor} 100%)`,
      sm: backgroundColor
    }
  }}
/>
```

### ContainedCover.spec.tsx (new test)

```tsx
it('should render gradient background when no children', () => {
  const { getByTestId } = render(
    <ContainedCover
      backgroundColor="#FF000080"
      backgroundBlur={blurUrl}
      imageBlock={imageBlock}
    >
      {[]}
    </ContainedCover>
  )
  expect(getByTestId('CardOverlayContentContainer')
    .querySelector('.overlay-gradient')).toBeInTheDocument()
})
```

## Sources

- Linear issue: [NES-512](https://linear.app/jesus-film-project/issue/NES-512/card-color-with-rtl-buggy)
- Parent issue: [NES-431](https://linear.app/jesus-film-project/issue/NES-431/add-opacity-setting) (add opacity setting)
- Primary file: `libs/journeys/ui/src/components/Card/ContainedCover/ContainedCover.tsx:312-328`
- Test file: `libs/journeys/ui/src/components/Card/ContainedCover/ContainedCover.spec.tsx`
- Color utilities: `libs/journeys/ui/src/components/Card/utils/colorOpacityUtils/colorOpacityUtils.tsx`

---
title: "feat: Add blockFilled/blockOutlined button variants"
type: feat
status: active
date: 2026-04-09
---

# Add blockFilled/blockOutlined Button Variants (NES-1529)

## Overview

The journeys-admin app has 13+ buttons using `variant="contained" color="secondary"` with ad-hoc `sx` overrides for dimensions, borderRadius, and Typography wrappers. This produces inconsistent "dark, square-ish" buttons that don't match the Figma design spec.

Rather than fixing each instance, we add two new button variants (`blockFilled`, `blockOutlined`) to the MUI theme so buttons can be standardized by changing props, not by fighting the theme with `sx`. The existing `secondary` palette already has the right colors — `secondary.dark` (`#26262E`) is the intended fill color, not `secondary.main` (`#444451`).

## Problem Statement

Buttons across the app (sign-in flow, customization flow, dialogs) override the theme with:
- `color="secondary"` (dark gray `#444451`) instead of the intended dark surface color (`#26262E`)
- `borderRadius: 2` (8px) fighting the theme's 12px default
- Hardcoded `height: 48px`, `width: 216px`, `width: '100%'`
- `<Typography variant="subtitle2">` wrappers overriding the button's own font styling (weight 600 vs theme's 800)

The Figma design specifies a distinct button style (Size=Large, Type=Filled) with:
- Background: `#26262E` (Surface/Dark)
- Text: `#FFFFFF`, Montserrat Bold 700, 18px/20px
- Border radius: 8px
- Padding: 16px horizontal, 10px vertical

This doesn't match any existing MUI variant + color combination in the admin theme.

## Proposed Solution

No new palette color needed. The existing `secondary` palette already has the right values:
- `secondary.dark` = `#26262E` (`palette[900]`) — the intended fill/border color
- `secondary.light` = `#6D6D7D` (`palette[700]`) — available for other uses
- `secondary.contrastText` = `#FFFFFF` (`palette[0]`)

Hover color: `palette[800]` (`#444451`) — one step lighter than `secondary.dark`.

### 1. Add `blockFilled` button variant

A filled button with the compact 8px border radius and Figma-specified spacing.

| Property | Value | Notes |
|----------|-------|-------|
| `borderRadius` | `8px` | Per Figma (vs theme default 12px) |
| `padding` | `10px 16px` | Per Figma |
| `fontSize` | `18px` | Per Figma |
| `fontWeight` | `700` | Per Figma (Bold) |
| `lineHeight` | `20px` | Per Figma |
| `boxShadow` | `none` | Consistent with existing contained |
| `textTransform` | `none` | Already set by theme root |

Color-specific compound variants:

**`blockFilled` + `color="secondary"`:**
- `backgroundColor`: `palette[900]` (`#26262E`) — uses `secondary.dark`, not `secondary.main`
- `color`: `palette[0]` (`#FFFFFF`)
- `&:hover` → `backgroundColor`: `palette[800]` (`#444451`) — one step lighter

**`blockFilled` + `color="primary"`:**
- `backgroundColor`: `primary.main` (`#C52D3A`)
- `color`: `#FFFFFF`
- `&:hover` → `backgroundColor`: `primary.dark` (`#9E2630`)

### 2. Add `blockOutlined` button variant

An outlined button with matching compact shape.

| Property | Value | Notes |
|----------|-------|-------|
| `borderRadius` | `8px` | Matches blockFilled |
| `padding` | `10px 16px` | Matches blockFilled (adjusted for border) |
| `fontSize` | `18px` | Matches blockFilled |
| `fontWeight` | `700` | Matches blockFilled |
| `lineHeight` | `20px` | Matches blockFilled |
| `borderWidth` | `2px` | Consistent with existing outlined override |
| `backgroundColor` | `palette[0]` (`#FFFFFF`) | White background |

Color-specific compound variants:

**`blockOutlined` + `color="secondary"`:**
- `borderColor`: `palette[900]` (`#26262E`) — uses `secondary.dark`
- `color`: `palette[900]` (`#26262E`)
- `backgroundColor`: `palette[0]` (`#FFFFFF`)
- `&:hover` → `backgroundColor`: `palette[200]` (`#DEDFE0`, divider/lightest grey)
- `&:hover` → `borderWidth`: `2px` (maintain on hover)

**`blockOutlined` + `color="primary"`:**
- `borderColor`: `primary.main` (`#C52D3A`)
- `color`: `primary.main` (`#C52D3A`)
- `backgroundColor`: `palette[0]` (`#FFFFFF`)
- `&:hover` → `backgroundColor`: `palette[100]` (`#EFEFEF`)
- `&:hover` → `borderWidth`: `2px`

### 3. TypeScript augmentations

Required module augmentation so `variant="blockFilled"` and `variant="blockOutlined"` are type-safe:

```typescript
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    blockFilled: true
    blockOutlined: true
  }
}
```

No palette augmentation needed — `color="secondary"` and `color="primary"` already exist.

## Files to Change

| File | Change |
|------|--------|
| `libs/shared/ui/src/libs/themes/journeysAdmin/tokens/components.ts` | Add `blockFilled`/`blockOutlined` variants + compound variants per color + TypeScript augmentation |

## Acceptance Criteria

- [ ] `<Button variant="blockFilled" color="secondary">` renders: #26262E bg, white text, 8px radius, Montserrat 700 18px, padding 10px 16px
- [ ] `<Button variant="blockFilled" color="secondary">` hover shows #444451 bg
- [ ] `<Button variant="blockOutlined" color="secondary">` renders: white bg, #26262E border+text, 8px radius, 2px border
- [ ] `<Button variant="blockOutlined" color="secondary">` hover shows #DEDFE0 bg
- [ ] `<Button variant="blockFilled" color="primary">` renders: #C52D3A bg, white text, 8px radius
- [ ] `<Button variant="blockOutlined" color="primary">` renders: white bg, #C52D3A border+text, 8px radius
- [ ] Both variants are NOT fullWidth by default
- [ ] `size="large"` still controls height when used alongside these variants
- [ ] TypeScript autocomplete works for `variant="blockFilled"` and `variant="blockOutlined"`
- [ ] Existing `contained`/`outlined`/`text` variants are unchanged
- [ ] Build passes (`npm run build`)
- [ ] Existing tests pass

## Out of Scope (Follow-up)

- Migrating existing 13+ button instances to use new variants
- Updating `CustomizeFlowNextButton` component
- Updating sign-in flow buttons
- Updating DoneScreen buttons
- Removing the `BUTTON_NEXT_STEP_WIDTH`/`BUTTON_NEXT_STEP_HEIGHT` shared styles

## Sources

- Figma design: https://www.figma.com/design/Rt5hcy8zJIUwz4SmnfniSG/%E2%9C%85-NS---Editor--Truth-?node-id=26671-219423&m=dev
- Linear ticket: https://linear.app/jesus-film-project/issue/NES-1529/button-design-inconsistency
- Admin theme components: `libs/shared/ui/src/libs/themes/journeysAdmin/tokens/components.ts`
- Admin theme colors: `libs/shared/ui/src/libs/themes/journeysAdmin/tokens/colors.ts` (unchanged — `secondary.dark` already has the right value)
- TypeScript augmentation pattern: `libs/shared/ui/src/libs/themes/journeysAdmin/tokens/typography.ts`

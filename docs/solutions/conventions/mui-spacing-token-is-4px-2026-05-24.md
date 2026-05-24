---
title: MUI sx spacing token is 1 = 4px in this repo (not the default 8px)
date: 2026-05-24
category: conventions
module: libs/shared/ui/themes
problem_type: convention
component: tooling
severity: medium
applies_when:
  - 'Writing MUI sx spacing props (p, m, px, py, pt, pb, gap, spacing, etc.) in any app or lib that consumes the shared themes (base, journeysAdmin, journeyUi, website)'
  - 'Converting a Figma or design-spec pixel value into sx token values'
  - 'Calling theme.spacing(n) directly in styled components, makeStyles blocks, or stories'
  - 'Reviewing PRs that introduce MUI sx spacing values — verify the px math against the 4× scale, not the 8× default'
tags:
  - mui
  - theme
  - spacing
  - sx
  - design-tokens
  - convention
related_components:
  - tooling
---

# MUI sx spacing token is 1 = 4px in this repo (not the default 8px)

## Context

The default MUI spacing scale is `1 = 8px`. That's what every MUI tutorial, blog post, Stack Overflow answer, and LLM training set assumes. Contributors (and agents) reach for `p: 3` expecting 24px.

This repo's themes override that scale to `1 = 4px`. Every sx prop that resolves through `theme.spacing(n)` is affected, and the friction is **silent**: code compiles, renders something, doesn't match design specs — nothing throws or warns. You just see the wrong pixels.

The override is set in token files (not the top-level `theme.ts`), which makes it easy to miss when reading theme code:

- `libs/shared/ui/src/libs/themes/journeysAdmin/tokens/spacing.ts:4` — `adminSpacing = { spacing: 4 }` (auto memory [claude])
- `libs/shared/ui/src/libs/themes/base/tokens/spacing.ts:6` — `baseSpacing = { spacing: 4 }` (auto memory [claude])

The `base` and `journeysAdmin` themes apply this, and the other shared themes (`journeyUi`, `website`) follow the same `1 = 4px` convention via their own `tokens/spacing.ts`. Treat this as **monorepo-wide**, not journeys-admin-specific.

## Guidance

When writing or reviewing any `sx` spacing prop in an app that consumes the shared themes, the conversion is **px = N × 4**, not N × 8.

**Conversion reference:**

| px   | token |
| ---- | ----- |
| 4px  | `1`   |
| 8px  | `2`   |
| 12px | `3`   |
| 16px | `4`   |
| 20px | `5`   |
| 24px | `6`   |
| 32px | `8`   |
| 40px | `10`  |
| 48px | `12`  |

- When matching a design spec given in px, **divide by 4** to get the token.
- Don't rely on MUI documentation pixel values when picking spacing tokens — translate first.
- When iterating in the browser to eyeball a value, expect more `+1` increments to dial in (each step is only 4px, not 8px).
- Raw CSS strings like `padding: '10px 20px'` bypass the spacing token entirely and render literal pixel values — use sparingly when the target isn't a multiple of 4.

## Why This Matters

- **Silent drift from design specs.** A button with `padding: 1` reads as 4px, not 8px. Designs based on default MUI math look off everywhere the convention isn't followed, and nothing in the toolchain catches it.
- **LLM agents and new contributors default to wrong math.** Training data favors the MUI default, so `p: 3 = 24px` is the natural assumption. Without surfacing this convention, every new contributor and every fresh agent session repeats the mistake — exactly what prompted this doc.
- **Tighter iteration loop.** Once you know the math, the 4px scale gives you finer-grained control. `mt: 5` (20px) is a real value here, where on a default theme it would be 40px.
- **Raw CSS escape hatch exists.** For one-off pixel values that aren't a 4-multiple (e.g. 11px or 13px), drop to `padding: '11px'` and the token math doesn't apply. Use sparingly.

## When to Apply

Whenever writing or reviewing `sx` props in any app that consumes the shared themes (verify by checking `libs/shared/ui/src/libs/themes/`).

Spacing-resolved props to watch for:

- `p`, `m`
- `px`, `py`, `pt`, `pb`, `pl`, `pr`
- `mx`, `my`, `mt`, `mb`, `ml`, `mr`
- `gap`, `rowGap`, `columnGap`
- `spacing` (on `Stack`, `Grid`)
- `margin`, `padding` when given as a **number** (string values bypass the token)

Also applies to `theme.spacing(N)` calls in styled components, `makeStyles`, or stories.

## Examples

**Before (wrong, MUI default math):**

```tsx
// Intended: 24px padding around the dialog action area
sx={{
  '& .MuiDialogActions-root': {
    pt: 0,
    px: 3,  // resolves to 12px, not 24px
    pb: 3   // resolves to 12px, not 24px
  }
}}
```

**After (correct, repo-theme math):**

```tsx
sx={{
  '& .MuiDialogActions-root': {
    pt: 0,
    px: 6,  // 24px
    pb: 6   // 24px
  }
}}
```

**Stack spacing:**

```tsx
// Want 16px gap between children
<Stack spacing={4}>  // 4 × 4px = 16px (not 4 × 8px = 32px)
```

**Escape hatch for awkward values:**

```tsx
sx={{ padding: '11px' }}  // bypasses the token, renders 11px literally
```

**Session example that surfaced this convention:** I wrote `sx={{ px: 3, pb: 3 }}` on a dialog action area expecting 24px (MUI default math of `3 × 8`). It rendered 12px, because the theme's `spacing = 4` made it `3 × 4`. The user corrected: _"the sizing token is 1 = 4 px, so I think it should be six"_. Changing to `px: 6, pb: 6` produced the intended 24px.

## Related

- `libs/shared/ui/src/libs/themes/journeysAdmin/tokens/spacing.ts` — the override for the journeysAdmin theme
- `libs/shared/ui/src/libs/themes/base/tokens/spacing.ts` — the override for the base theme; other shared themes follow the same pattern
- [Badge alongside webkit-line-clamp title](../ui-bugs/badge-alongside-webkit-line-clamp-title.md) — example consumer where `gap={1}` resolves to 4px in journeys-admin

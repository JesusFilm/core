---
title: TEMPLATE chip not visible beside title in mobile editor dropdown
date: 2026-05-24
category: ui-bugs
module: journeys-admin/editor-toolbar
problem_type: ui_bug
component: tooling
symptoms:
  - "TEMPLATE chip squeezed beside the journey title inside the editor's mobile 3-dots dropdown menu"
  - 'On narrow viewports the title takes the full row and the chip wraps awkwardly or gets clipped'
  - "Users on mobile can't tell at a glance whether they're editing a template vs a regular journey"
root_cause: incomplete_setup
resolution_type: code_fix
severity: low
tags:
  - mui
  - stack-direction
  - responsive
  - mobile
  - journey-details
  - qa-459
---

# TEMPLATE chip not visible beside title in mobile editor dropdown

## Problem

The journey editor toolbar shows a `TEMPLATE` chip next to the journey title so the user can see at a glance that they're editing a template. On desktop (md+) the title + chip render directly in the toolbar. On mobile (xs/sm) the toolbar hides the `JourneyDetails` component and re-parents it into the 3-dots overflow menu — but `JourneyDetails` was built with a fixed `direction="row"` Stack for the title + chip, so inside the narrower dropdown the chip ends up squeezed against the title and either wraps awkwardly or gets clipped (QA-459).

## Symptoms

- TEMPLATE chip squeezed beside the journey title inside the editor's mobile 3-dots dropdown menu.
- On narrow viewports the title takes the full row and the chip wraps awkwardly or gets clipped.
- Users on mobile can't tell at a glance whether they're editing a template vs a regular journey.

## What Didn't Work

- **Surfacing a second TEMPLATE chip in the mobile toolbar** (next to the logo or undo/redo). Adds a separate render path that has to be kept in sync with the desktop chip; the toolbar at ~375px is already crowded.
- **Lowering the panel position / adding margin tricks** to free up toolbar space. Unrelated to the actual problem — the chip wasn't fighting for toolbar space, it was being re-parented into a container the original layout didn't anticipate.

## Solution

Change the inner Stack `direction` in `JourneyDetails` from a fixed `"row"` to a responsive `{ xs: 'column', md: 'row' }` so the chip stacks below the title at xs/sm (where the component renders inside the dropdown) and stays beside the title at md+ (where it renders directly in the toolbar):

```tsx
// apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/JourneyDetails.tsx
<Stack
  // QA-459: stack title + TEMPLATE chip vertically inside the
  // mobile dropdown menu so the chip sits clearly below the
  // title instead of getting squeezed against it. Desktop
  // toolbar (md+) keeps the original side-by-side layout.
  direction={{ xs: 'column', md: 'row' }}
  alignItems={{ xs: 'flex-start', md: 'center' }}
  gap={1}
  sx={{ minWidth: 0 }}
>
  <Typography>{journey.title}</Typography>
  {journey.template === true && <Chip label={t('TEMPLATE')} ... />}
</Stack>
```

The existing `alignItems="flex-start"` at xs already left-aligns the chip when stacked, so it falls into place naturally — no extra alignment props needed.

## Why This Works

`JourneyDetails` is rendered in two structurally different containers: the wide desktop toolbar and the narrow mobile dropdown. Hard-coding `direction="row"` assumes one container width; making it responsive lets the same component fit both contexts without forking the component or adding a parent-passed prop. Crucially, the breakpoint that flips the direction (`md`) matches the breakpoint that decides which container renders `JourneyDetails` — they're already coupled in the toolbar code, so reusing the same breakpoint here keeps the layout decision consistent.

## Prevention

- **When a component renders inside variable-width containers, audit fixed `direction`, `flexDirection`, and `width` props for responsive equivalents.** Especially true for shared components rendered by both a wide desktop layout and a narrower mobile overlay/dropdown/drawer.
- **Match breakpoints to parent breakpoints.** If the parent flips containers at `md`, the child's responsive props should also flip at `md`. Different breakpoints create dead zones where the child's layout doesn't match its actual container.
- **Avoid duplicating chip / badge render paths** to "fix" mobile placement. Adapt the existing render in place; a second copy will inevitably drift from the original.

## Related Issues

- Linear: [QA-459](https://linear.app/jesus-film-project/issue/QA-459)
- Original feature: NES-1549 (TEMPLATE badge added on desktop)
- PR [#9247](https://github.com/JesusFilm/core/pull/9247) — included this fix as a small follow-up to the collection flow refactor.

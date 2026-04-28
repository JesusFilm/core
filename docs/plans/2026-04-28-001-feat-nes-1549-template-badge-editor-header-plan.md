---
title: 'feat: Add TEMPLATE badge to journey editor header (NES-1549)'
type: feat
status: active
date: 2026-04-28
ticket: NES-1549
---

# feat: Add TEMPLATE badge to journey editor header

Show a styled "TEMPLATE" pill next to the journey title in the editor header bar whenever `journey.template === true`. Pure UI change — no GraphQL, data model, or feature flag work.

## Acceptance Criteria

- [ ] A small "TEMPLATE" chip appears immediately to the right of the journey title in the editor toolbar when `journey.template === true`.
- [ ] The chip is hidden when `journey.template !== true` (regular journeys).
- [ ] The chip is shown for ALL templates regardless of `team.id` (global + local). Open question deferred — refine later if product wants to differentiate.
- [ ] Chip styling matches the existing toolbar visual language (compact MUI `Chip`, small height, brand colour).
- [ ] Title truncation/ellipsis behaviour from `JourneyDetails` is preserved on narrow widths — the chip must not push the title off-screen on mobile.
- [ ] Existing tests for `JourneyDetails` and `Toolbar` continue to pass.
- [ ] New unit test asserts the chip renders for `template: true` and is absent for `template: false`.
- [ ] Storybook story added (or existing story extended) showing the template variant.
- [ ] `npx jest` passes for the touched specs and lint passes.

## Context

### Where the editor header lives
- Editor header bar: [apps/journeys-admin/src/components/Editor/Toolbar/Toolbar.tsx](apps/journeys-admin/src/components/Editor/Toolbar/Toolbar.tsx)
- Title is rendered inside a child component, [JourneyDetails.tsx](apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/JourneyDetails.tsx) — `journey.title` at line 42, wrapped in a Typography with `-webkit-line-clamp` ellipsis.
- `journey` comes from `useJourney()` (already imported in `JourneyDetails`).
- `journey.template` is already used elsewhere in the toolbar (`Menu/Menu.tsx:52`, `Items/Items.tsx:13`, `Toolbar.tsx:170`) — pattern: `journey?.template === true`.

### Existing badge precedent
[JourneyCard.tsx:165](apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCard.tsx) already uses a small MUI `Chip` for the "New" badge:

```tsx
<Chip
  label={t('New')}
  size="small"
  sx={{
    fontSize: 10,
    backgroundColor: 'warning.main',
    color: 'warning.contrastText',
    borderRadius: 11,
    height: 22,
    px: 0.5,
    border: 1.5,
    borderColor: '#eb5b3b'
  }}
/>
```

The TEMPLATE chip should use the same compact silhouette (size="small", height ~20-22, fontSize 10) but with a subtler colour (primary or secondary) so it reads as a category label rather than an alert.

### i18n
The toolbar uses `useTranslation('apps-journeys-admin')`. Translation keys are extracted from `t(...)` literals — use `t('TEMPLATE')` so it remains translatable.

## Proposed Implementation

### MVP

#### `apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/JourneyDetails.tsx`

Wrap the existing title `Typography` and a new `Chip` inside a horizontal `Stack`. Preserve the title's truncation by giving it `flex: 1, minWidth: 0` and keeping the `Chip` non-shrinking.

```tsx
import Chip from '@mui/material/Chip'
import { useTranslation } from 'next-i18next'

// ...inside the journey != null branch, replace the existing
// <Typography>{journey.title}</Typography> block with:
<Stack
  direction="row"
  alignItems="center"
  gap={1}
  sx={{ minWidth: 0 }}
>
  <Typography
    sx={{
      display: { xs: '-webkit-box', md: 'unset' },
      '-webkit-line-clamp': { xs: '2', md: '1' },
      '-webkit-box-orient': 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: 'secondary.dark',
      typography: { xs: 'subtitle2', md: 'subtitle1' },
      minWidth: 0,
      flexShrink: 1
    }}
  >
    {journey.title}
  </Typography>
  {journey.template === true && (
    <Chip
      label={t('TEMPLATE')}
      size="small"
      data-testid="TemplateBadge"
      sx={{
        flexShrink: 0,
        height: 20,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.5px',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderRadius: 11,
        px: 0.5
      }}
    />
  )}
</Stack>
```

#### `apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/JourneyDetails.spec.tsx`

Add cases:
- Template journey (`template: true`) renders `TemplateBadge` with text "TEMPLATE".
- Non-template journey (existing default mock) does not render `TemplateBadge`.

#### `apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/JourneyDetails.stories.tsx`

Add a `Template` story variant that injects `template: true` into the journey, so the badge can be reviewed in Storybook.

## Out of Scope

- Differentiating global vs local templates visually (deferred per ticket).
- Touching the global template list, template card, or non-editor surfaces.
- Backend / GraphQL changes — `journey.template` already exists on `JourneyFields`.
- Theming changes / new design tokens.

## Sources

- Linear: NES-1549
- Editor header: [Toolbar.tsx](apps/journeys-admin/src/components/Editor/Toolbar/Toolbar.tsx)
- Title host: [JourneyDetails.tsx](apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/JourneyDetails.tsx)
- Existing chip pattern: [JourneyCard.tsx:165](apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCard.tsx)
- Existing `journey.template` checks: `Menu/Menu.tsx:52`, `Items/Items.tsx:13`, `Toolbar.tsx:170`
- Frontend rules: [.claude/rules/frontend/apps.md](.claude/rules/frontend/apps.md) — MUI components, descriptive names, accessibility
- Jest rule: [.claude/rules/running-jest-tests.md](.claude/rules/running-jest-tests.md) — use `npx jest --config <app>/jest.config.ts --no-coverage <path>`

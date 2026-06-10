---
title: Share component surfaces across breakpoints — variant prop vs extraction
date: 2026-05-26
category: design-patterns
module: shared-ui
problem_type: design_pattern
component: tooling
severity: medium
applies_when:
  - Adding a second responsive surface (e.g. mobile) that must show the same actions or menu items as an existing one
  - Two render contexts need the same component but with different styling (light vs dark, image overlay vs flat background)
  - Avoiding logic drift between a desktop and mobile version of the same affordance
tags: [components, responsive, react, mui, props, refactor, drift-prevention]
---

# Share component surfaces across breakpoints — variant prop vs extraction

## Context

When a feature ships with both a desktop layout and a separate mobile
layout, the two surfaces often need the same actions or menu items
(Edit / Preview / Publish / Ungroup / View analytics). The wrong
default is to duplicate the menu in each layout — the two
implementations then drift the next time someone adds an action.

There are two related-but-distinct patterns for keeping the surfaces
in lockstep. Pick the right one for the situation.

## Guidance

### Pattern A: variant prop on a single component

Use when the component's **content is identical** across surfaces but
its **styling** depends on context — for example, an icon button that
sits over an image overlay on desktop (white icon, drop shadow) but
sits on a light background row on mobile (plain secondary icon).

Add a discriminated `variant` prop with a sensible default that
preserves existing behavior:

```tsx
export interface JourneyCardMenuProps {
  // ...existing props
  variant?: 'on-image' | 'plain'
}

export function JourneyCardMenu({ variant = 'on-image', ...rest }: JourneyCardMenuProps): ReactElement {
  return (
    <IconButton
      sx={
        variant === 'plain'
          ? { color: 'text.secondary', width: 32, height: 32 }
          : {
              color: hovered ? 'gray.400' : 'white',
              '& svg': { filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.4))' }
              // ...image-overlay styling
            }
      }
    >
      <MoreIcon />
    </IconButton>
  )
}
```

The default value (`'on-image'`) means existing call sites keep their
behavior with no migration. The new caller (the mobile row) opts in
explicitly via `variant="plain"`.

### Pattern B: extract a shared subcomponent both surfaces consume

Use when both surfaces need the **same logic and structure**, and the
parent components are otherwise distinct. The classic case: a desktop
card and a mobile filter strip both need the same 3-dot menu with the
same actions, the same disabled states, and the same confirmation
dialogs.

Extract the menu into its own component up front. Refactor the desktop
caller in the same change so both surfaces share one source of truth
from the start:

```
TemplateGalleryPageList/
  CollectionCard/
    CollectionCard.tsx          # was: inlined the menu + dialog
  CollectionActionsMenu/        # NEW
    CollectionActionsMenu.tsx   # 3-dot button + Menu + UngroupDialog
    index.ts
  MobileFilterHeaderStrip/
    MobileFilterHeaderStrip.tsx # uses CollectionActionsMenu
```

`CollectionCard` becomes thinner; `MobileFilterHeaderStrip` is born
sharing the same actions, guards (published / busy), and ungroup
confirmation dialog. Adding a new action later means editing one
file, not two.

### Choosing between A and B

| Signal                                                        | Pattern                                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Same structure, different styling per surface                 | **A: variant prop**                                                            |
| Same actions/logic, different parent layouts                  | **B: extract**                                                                 |
| Optional menu item that one surface needs and another doesn't | **A: optional callback prop** (see below)                                      |
| You're already touching both surfaces in the same PR          | **B: extract now** — the cost is lowest when both call sites are in your hands |

A and B are not mutually exclusive — in NES-1695, `JourneyCardMenu`
gained a `variant` prop (A) for the icon styling, while the
collection-level menu was extracted into `CollectionActionsMenu` (B)
because the desktop card and mobile strip needed identical actions
with identical guards.

### Bonus: optional opt-in via callback prop

When a menu item should appear only when the caller provides the
underlying dialog state, gate it on the presence of an optional
callback rather than a boolean flag:

```tsx
export interface DefaultMenuProps {
  // ...
  setOpenAnalyticsDialog?: () => void
}

return (
  // ...
  {template === true && (
    <>
      {setOpenAnalyticsDialog != null && (
        <MenuItem
          label={t('View analytics')}
          icon={<BarGroup3Icon color="secondary" />}
          onClick={() => {
            setOpenAnalyticsDialog()
            handleCloseMenu()
            setHasOpenDialog?.(true)
          }}
        />
      )}
      {/* ...existing items */}
    </>
  )}
)
```

The presence of the callback is the feature flag: callers that don't
own the dialog don't get the menu item, and there's no separate
boolean to keep in sync with the callback being supplied.

## Why This Matters

Duplicated menus drift. The first time someone adds an action they
update only one site, and the divergence is silent until QA notices a
discrepancy weeks later. Both patterns above are cheap up front (a
prop, or a directory move) and continue to pay back on every
subsequent change to the surface.

The opt-in callback pattern is specifically valuable for items that
exist only on one surface — it keeps the additive surface (existing
callers see no change) while making the new item discoverable to the
TypeScript compiler at every call site.

## When to Apply

- Adding a mobile (or any new) surface that must mirror an existing
  surface's actions.
- Modifying a component that already has two callers with copy-paste
  similarity — fix the duplication before adding a third.
- Introducing one-off variants of an existing component — prefer a
  `variant` prop over a sibling component until there are 3+ variants
  or the variants diverge in structure, not just styling.

## Examples

In NES-1695 (`apps/journeys-admin`):

- `JourneyCardMenu` gained `variant: 'on-image' | 'plain'` and
  `onAnalyticsRequest?: () => void`. The variant prop swapped IconButton
  styling; the optional callback added the "View analytics" menu item
  only for callers that own a `TemplateBreakdownAnalyticsDialog`.
- `CollectionActionsMenu` was extracted from the previous inline menu in
  `CollectionCard.tsx`. The desktop card was refactored to consume it,
  and the new `MobileFilterHeaderStrip` consumes the same component for
  collection-level actions. Both surfaces share Edit / Preview /
  Publish-or-Unpublish / Remove with identical guards and the same
  `CollectionUngroupDialog`.

## Related

- `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionActionsMenu/`
  — the extracted shared menu.
- `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/JourneyCardMenu.tsx`
  — variant + optional-callback patterns in one component.

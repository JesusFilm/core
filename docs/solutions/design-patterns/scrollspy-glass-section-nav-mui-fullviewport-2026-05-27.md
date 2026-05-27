---
title: 'Scrollspy glass section-nav for a full-viewport sectioned page (MUI, IntersectionObserver)'
date: 2026-05-27
category: design-patterns
module: journeys/ui/PublicGalleryPage
problem_type: design_pattern
component: tooling
severity: low
applies_when:
  - 'Building a section-nav for a full-viewport (100svh) sectioned scrolling page in MUI'
  - 'Tracking the active section with IntersectionObserver using a centre band (rootMargin -45% top and bottom)'
  - 'Splitting nav UI responsively: a fixed glass top bar on desktop vs a floating glass hamburger + right Drawer on mobile'
  - "Applying backdrop-filter glass to a MUI Drawer (needs a transparent Modal backdrop and backgroundImage: none)"
  - 'Smooth-scrolling to anchors while honouring prefers-reduced-motion and offsetting a fixed bar via scrollMarginTop'
related_components:
  - libs/journeys/ui/src/components/PublicGalleryPage/JourneyView/JourneyViewNav.tsx
  - libs/journeys/ui/src/components/PublicGalleryPage/JourneyView/JourneyView.tsx
  - libs/journeys/ui/src/components/PublicGalleryPage/AdminView/AdminView.tsx
  - libs/journeys/ui/src/components/PublicGalleryPage/PublicGalleryPage.spec.tsx
tags:
  - mui
  - intersection-observer
  - scrollspy
  - backdrop-filter
  - prefers-reduced-motion
  - drawer
  - responsive-nav
  - parallax
---

# Scrollspy glass section-nav for a full-viewport sectioned page (MUI, IntersectionObserver)

## Context

The NES-1694 restyle turned the public template gallery (`libs/journeys/ui/.../PublicGalleryPage`) into a full-viewport (`100svh`) sectioned page — a cover, then `Explore`/`More` template sections, then an optional `Strategy` media section. It needed wayfinding (a scrollspy section-nav) and a translucent "glass" bar/drawer that lets content blur through it as you scroll.

Several pieces interacted in non-obvious ways: MUI's `Drawer` scrim silently defeats the glass effect; a `scrollMarginTop` offset for a fixed bar leaves a phantom gap on mobile where no bar exists; the cover's parallax drift overlapped an absolutely-positioned CTA; and a read-only `AdminView` preview had drifted from the live `JourneyView`'s card-split rule. This doc captures the reusable pattern plus those gotchas.

## Guidance

### 1. Derive nav sections from rendered content, in scroll order

The nav must list exactly the sections that render. The cover is unconditional (so there's always ≥1 section); the rest are gated on the same conditions the sections themselves use. Build it in a `useMemo` keyed on those conditions, with stable ids in one `SECTION_IDS` const shared by the nav links, the section `id` attributes, and the observer:

```tsx
const navSections = useMemo<JourneyViewNavSection[]>(() => {
  // Cover uses a STATIC label, not the collection title — a long title
  // stretches/unbalances the centred desktop nav row. The full title is still
  // the hero of the cover section itself.
  const sections: JourneyViewNavSection[] = [
    { id: SECTION_IDS.cover, label: t('Overview') }
  ]
  if (featured.length > 0) sections.push({ id: SECTION_IDS.featured, label: t('Explore') })
  if (rest.length > 0) sections.push({ id: SECTION_IDS.set, label: t('More') })
  if (hasMedia) sections.push({ id: SECTION_IDS.media, label: t('Strategy') })
  return sections
}, [featured.length, rest.length, hasMedia, t])
```

> Don't use the collection title as the cover's nav label. On the centred desktop bar a long title stretches the row and looks unbalanced (the mobile drawer stacks vertically and tolerates length, but the desktop bar doesn't). A static label is robust for any title.

### 2. Scrollspy via IntersectionObserver with a thin centre band

The active section is the one crossing the viewport's vertical centre. A symmetric `rootMargin: '-45% 0px -45% 0px'` collapses the observation root to a ~10% centre band. Because the cover spans the full viewport at the top, it is the active link on first load.

**Track a set of currently-intersecting sections (enter AND leave), then pick the topmost in scroll order** — do *not* just `setActiveId` on the first `isIntersecting` entry:

```tsx
useEffect(() => {
  if (typeof IntersectionObserver !== 'function') return // jsdom / SSR guard
  const ids = sections.map((section) => section.id)
  const elements = ids
    .map((id) => document.getElementById(id))
    .filter((element): element is HTMLElement => element != null)
  if (elements.length === 0) return

  const visible = new Set<string>()
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id)
        else visible.delete(entry.target.id)
      }
      const next = ids.find((id) => visible.has(id)) // topmost in scroll order
      if (next != null) setActiveId(next)
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  )
  elements.forEach((element) => observer.observe(element))
  return () => observer.disconnect()
}, [sections])
```

GOTCHA — **don't use "last `isIntersecting` entry wins."** The naive version (`entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id) })`) has two bugs that surface when you reverse scroll direction right at a boundary: (1) at a boundary both the leaving and entering section briefly cross the thin band in one batched callback, and `forEach` ends on whichever entry is *last* in the array (order is not guaranteed document order), so the active link can land on the upper section while you're scrolling into the lower one; (2) it never handles `isIntersecting === false`, so once it's wrong it stays wrong (the leave event that should correct it is ignored). Tracking a set (reacting to leave too) and selecting deterministically by scroll order fixes both. When the band is momentarily empty (`next == null`), keep the last active section rather than clearing it.

### 3. "Glass" styling: translucent tint + backdrop blur, border only after scroll

Glass = a semi-transparent `background.default` tint over a `backdropFilter` blur, with the WebKit-prefixed variant for Safari/iOS. The bottom border is gated on a `scrolled` flag (rAF-throttled passive scroll listener, `window.scrollY > 8`) so the bar reads as borderless over the cover, then gains a divider once you leave the top:

```tsx
backgroundColor: (theme) => alpha(theme.palette.background.default, 0.6),
backdropFilter: 'saturate(180%) blur(8px)',
WebkitBackdropFilter: 'saturate(180%) blur(8px)',
borderBottom: '1px solid',
borderColor: scrolled ? 'divider' : 'transparent',
transition: 'border-color 200ms ease'
```

### 4. GOTCHA — the MUI Drawer scrim defeats the glass

A MUI `Drawer` is a `Modal`, whose default backdrop is a dark scrim. Over a glass drawer that scrim dims the page so you no longer see the blurred content *through* the glass. Make the backdrop transparent (taps still close it) and set `backgroundImage: 'none'` on the paper so the dark-mode elevation overlay doesn't fight the tint:

```tsx
<Drawer
  anchor="right"
  open={drawerOpen}
  onClose={handleCloseDrawer}
  slotProps={{
    paper: {
      sx: {
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.6),
        backgroundImage: 'none',
        backdropFilter: 'saturate(180%) blur(8px)',
        WebkitBackdropFilter: 'saturate(180%) blur(8px)'
      }
    },
    backdrop: { sx: { backgroundColor: 'transparent' } }
  }}
>
```

(MUI v7: backdrop styling is `slotProps.backdrop`, paper is `slotProps.paper`.)

### 5. Responsive desktop-bar / mobile-drawer split

Desktop (`md+`) is a `position: fixed` glass top bar (`display: { xs: 'none', md: 'flex' }`). Mobile (`xs`/`sm`) has **no bar** — a floating fixed glass hamburger (`display: { xs: 'inline-flex', md: 'none' }`) opens a right-anchored glass `Drawer`, so the panel reads as expanding from the button. A single `<Box component="nav" aria-label=…>` wraps both as one landmark.

### 6. GOTCHA — `scrollMarginTop` must be desktop-only

The fixed bar exists only on desktop, so the section scroll-anchor offset must be too. Every section uses a responsive value:

```tsx
scrollMarginTop: { xs: 0, md: `${GALLERY_NAV_HEIGHT}px` } // GALLERY_NAV_HEIGHT = 56
```

Leaving the 56px offset on mobile (where there is no bar) leaves a phantom gap above a section after a jump.

### 7. GOTCHA — parallax vs the cover CTA: flow layout, not absolute positioning

The cover header sits in a `useParallax` wrapper that drifts it *downward* (up to ~`strength × viewport`) as you scroll; an absolutely-positioned bottom CTA got overlapped. The fix is twofold:

- **Flow layout, not absolute.** The header lives in a `flex: 1` centred region; the CTA follows it in normal flow with a guaranteed top-padding gap, so the gap can't collapse. The CTA is never inside the parallax wrapper.

```tsx
<Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Box ref={introRef} sx={{ willChange: 'transform' }}>{/* parallaxed header */}</Box>
  </Box>
  <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'center', pt: { xs: 10, md: 14 } }}>
    {/* CTA — in flow, outside the parallax wrapper; targeted in tests by a
        data-testid since its label is shared with the nav links */}
  </Box>
</Box>
```

- **Halve the cover's parallax strength.** Other sections use the default `useParallax()` (0.06 desktop / 0.03 mobile); the cover uses `useParallax(0.03, 0.015)` so the drift can't exceed the `pt` gap.

### 8. GOTCHA — a shared-variant split must be identical in live view and admin preview

The "feature all three when exactly three" rule (so the `More` grid never shows a single bare card) lives in BOTH `JourneyView` and the read-only `AdminView` preview, and they must compute it identically. The preview had drifted to a fixed `2`, showing one bare card at 3 templates. Both now use:

```tsx
const featuredCount = data.items.length === 3 ? 3 : FEATURED_COUNT // FEATURED_COUNT = 2
const featured = data.items.slice(0, featuredCount)
const rest = data.items.slice(featuredCount)
```

This is the *derived-logic* face of the shared cross-app view pattern — the two views share a neutral data model but the split derivation was duplicated. See [shared-cross-app-view-component](../architecture-patterns/shared-cross-app-view-component-2026-05-26.md); the cleanest prevention is to extract the split into a shared helper rather than copy the constant into each variant.

### 9. One `scrollToSection` helper for reduced motion

A single exported helper does the smooth-scroll with a reduced-motion fallback, reused by both the nav links and the cover CTA, so the check isn't duplicated:

```tsx
export function scrollToSection(id: string): void {
  const element = document.getElementById(id)
  if (element == null) return
  element.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}
```

`useParallax` independently bails out entirely (never attaches its scroll listener) when reduced motion is set.

## Why This Matters

- **Content-derived sections** keep the nav truthful — no dead links to sections that didn't render — and the always-present cover guarantees the nav is never empty.
- **The 45% centre band narrows *when* a section is "active"** to a ~10% strip near the centre, but two sections still straddle it briefly at a boundary — which is exactly why the active section must be chosen deterministically (set of intersecting ids + topmost in scroll order) rather than by "last entry wins," or it sticks on the wrong section when you reverse direction at the boundary.
- **Glass only works if nothing opaque sits behind it.** The dark Modal scrim and the dark-mode elevation overlay are both invisible until they silently kill the effect — the two highest-value gotchas here.
- **`scrollMarginTop` is per-breakpoint** because its only justification (a fixed bar) is per-breakpoint; coupling them prevents the mobile phantom-gap regression.
- **Flow layout beats absolute positioning under parallax** — a normal-flow `pt` gap can't be overlapped by a transform on a sibling, whereas absolute children share the coordinate space the parallax drifts through.
- **Duplicated derived logic drifts.** The `AdminView` regression is the canonical example: sharing the data model is not enough when the derivation is copied.

## When to Apply

- A full-viewport (`100svh`-banded) sectioned page that needs a scrollspy section-nav.
- Any fixed/floating bar or drawer styled as "glass" (`backdrop-filter`) over scrolling content — especially a MUI `Modal`/`Drawer`.
- A responsive nav that is a bar on desktop but a hamburger/drawer on mobile, where sections rely on `scrollMarginTop`.
- A parallax/scroll-drift wrapper coexisting with a CTA or other anchored element.
- A read-only preview (admin/dialog) that re-renders a live layout and must stay in lockstep with it.

## Examples

- **Live page** — `JourneyView` renders cover + `Explore` + `More` + optional `Strategy`, computes `navSections`, and wires `JourneyViewNav` plus three `useParallax` refs (cover halved).
- **The nav** — `JourneyViewNav` is the reusable piece: desktop glass bar, mobile glass hamburger + right-anchored glass drawer, IntersectionObserver scrollspy, rAF scroll-border, exported `scrollToSection`/`GALLERY_NAV_HEIGHT`.
- **The mirror** — `AdminView` reuses `JourneyViewHeader`/`JourneyViewCard`/`JourneyViewMedia` and the identical `featuredCount` split, but swaps `100svh` bands for plain `py: 4` padding and drops parallax/scroll-reveal (a static, `aria-hidden`-wrapped preview). `PublicGalleryPage.spec.tsx` asserts the 3- and 4-template splits in both variants.

> Spacing note: this repo's MUI `sx` spacing token is `1 = 4px` (not the MUI default 8px), so `GALLERY_NAV_HEIGHT = 56` is a raw px constant while paddings like `pt: { md: 14 }` resolve to 56px. (auto memory [claude])

## Related

- [shared-cross-app-view-component](../architecture-patterns/shared-cross-app-view-component-2026-05-26.md) — the JourneyView/AdminView shared-view pattern; this nav's split-drift gotcha is its derived-logic counterpart.
- [collection-grid-bleed-column-alignment-nes1696](./collection-grid-bleed-column-alignment-nes1696.md) — sibling MUI template-gallery layout pattern.
- [template-gallery-page-collections-patterns-nes1539](../best-practices/template-gallery-page-collections-patterns-nes1539.md) — broader template-gallery/collections patterns.
- Linear: NES-1694 (public page restyle). (NES-* tickets live in Linear, not GitHub Issues.)

# Watch Homepage Mobile Layout

## Goals

- [x] Relax rigid widths in the floating search bar so it can fill narrow mobile viewports.
- [x] Resize carousel slides and skeleton placeholders to respect small screens without clipping.
- [x] Smooth out input spacing so the search affordance feels balanced on phones.

## Obstacles

- Tailwind utility strings were baked into JSX template literals, so widening support for arbitrary width utilities required careful updates in multiple components.
- The shared `Skeleton` helper only supported numeric dimensions, which made responsive placeholders impossible until the prop types were expanded.

## Resolutions

- Replaced the absolute-centered search wrapper with a full-width fixed bar that collapses padding below the tablet breakpoint.
- Added `min()`-based width utilities to carousel slides and swapped skeleton widths to `100%`, keeping cards within the viewport on compact devices.
- Extended the `Skeleton` component to accept string dimensions so responsive values can flow through without breaking existing consumers.

## Test Coverage

- `pnpm dlx nx lint watch` *(fails: pre-existing lint violations across the watch app)*

## User Flows

- Mobile visitor lands on `/watch` → floating search spans the viewport with comfortable padding → typing maintains the streamlined layout.
- Carousel renders on mobile → slides shrink to fit within the screen → skeletons mirror the card sizing while data loads.

## Follow-up Ideas

- Consider promoting the `min()` width helper into a shared Tailwind plugin so other carousels can reuse the pattern.
- Audit other sections for legacy pixel-based skeleton dimensions now that the helper supports responsive values.

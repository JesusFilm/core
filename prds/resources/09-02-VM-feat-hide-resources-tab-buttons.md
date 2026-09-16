# Remove the header tab buttons on the Resources page

## Goals

- Remove the header tab-button section from the `/resources` page.
- The section shows the Resources, Journeys, Watch, and Metaverse tabs on desktop.
- The same section shows one dropdown button on mobile.
- Keep the section on the other pages that use the shared `Header`.

## Implementation Strategy

- [x] Add a `hideTabButtons` prop to `Header`. When true, the `Header` does not render the `BottomAppBar` or its spacer.
- [x] Add a `hideHeaderTabButtons` prop to `PageWrapper` that passes through to `Header`.
- [x] Set `hideHeaderTabButtons` on the `PageWrapper` in `ResourcesView`.
- [x] Add unit tests for the new prop in `Header.spec.tsx`.

## Obstacles

- The existing `hideBottomAppBar` prop does not remove the bar. It hides the bar until the user scrolls. `VideoHero` depends on this behavior. A new prop was necessary.
- The existing test "should hide bottom app bar" queries the test id `BottomAppBar`, but the component uses `HeaderBottomAppBar`. The test passes without the prop. The test stays unchanged; the new tests query the correct test id.

## Resolutions

- The new `hideTabButtons` prop removes the bar fully and does not change the `VideoHero` fade behavior.

## Test Coverage

- `Header.spec.tsx`: a test shows the bar when the flags are on, and a test shows no bar when `hideTabButtons` is true.
- Full suite: `pnpm dlx nx run resources:test`.

## User Flows

- Open `/resources` → the page shows the heading and the search bar → the tab-button section is not visible.
- Open `/watch` or `/journeys` → the tab-button section is still visible.

## Follow-up Ideas

- Remove the section from more pages with the same prop, if the design asks for it.

## Addendum: align the section cards with the headings

### Goals

- Align the left edge of the card images with the section headings on `/resources`.

### Obstacles

- `ResourceSection` wrapped the carousel in a `Container` with 24 px padding.
- The `slidesOffsetBefore={-32}` compensation in `ContentCarousel` sets a margin through the `sx` prop.
- The Swiper stylesheet sets `margin-left: auto` on `.swiper`, and it can win the cascade. The margin then computes to 0 and the cards sit 32 px right of the headings.

### Resolutions

- The `Container` wrapper and the `slidesOffsetBefore` value are removed.
- A `Box` with `ml: -2` now offsets the 8 px card padding. The card image aligns with the heading at all breakpoints.
- `ContentCarousel` is a shared library component, so the fix stays local to `ResourceSection`.

### Test Coverage

- `nx run resources:test`: all tests pass.
- Manual check in Chrome on `http://localhost:4310/resources`: the headings, the search bar, and the card images share one left edge.

### User Flows

- Open `/resources` → each section heading and its card images start at the same left edge.

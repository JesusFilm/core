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

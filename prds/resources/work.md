# Beta banner for Watch routes

## Goals
- Add a clickable beta banner on Watch pages that sets the EXPERIMENTAL cookie and reloads the page.

## Implementation Strategy
- [x] Create a BetaBanner component using MUI layout with a single CTA click handler that sets the cookie and reloads.
- [x] Expose the component via an index file and add apps-resources translations for the banner copy.
- [x] Render the banner near the top of the app so it appears above Watch content without fixed positioning.

## Obstacles
- None encountered so far.

## Resolutions
- N/A

## Test Coverage
- Pending automated checks; manual verification to be completed after integration.

## User Flows
- Navigate to any /watch page → see beta banner → activate via click or keyboard → EXPERIMENTAL cookie set → page reloads into beta experience.

## Follow-up Ideas
- Consider hiding the banner when the EXPERIMENTAL cookie is already set to reduce repetition for returning beta users.

# Watch Home Advent Grid Implementation Log

## Goals
- Introduce a Christmas Advent grid on the Watch home page to highlight a daily video countdown to Christmas.
- Maintain the existing "Discover the full story" collections experience while extending it with seasonal programming.

## Implementation Strategy
- [x] Review existing collection showcase configuration used by the home page grid.
- [x] Define a new Christmas Advent source list that can surface the curated Advent collection and key Christmas content.
- [x] Render an additional `SectionVideoGrid` instance in the home collections rail with Advent-specific copy and analytics tagging.
- [x] Document the work performed, known limitations, and validation steps in this log.

## Obstacles
- The repository does not currently expose Advent-specific collection identifiers, making it unclear which IDs the new grid should hydrate.

## Resolutions
- Seeded the Advent grid with the published `2_0-ConsideringChristmas` media component and the `ChristmasAdventCollection` placeholder so the UI is ready once backend content is finalized.

## Test Coverage
- `pnpm dlx nx lint watch`

## User Flows
- Visit Watch home → Scroll to Discover the full story (Grid View) → Continue to new Christmas Advent grid → Choose Day N card → Play corresponding Advent video.

## Follow-up Ideas
- Confirm final Advent collection/video identifiers with the content team and update the configuration once the playlist is published.
- Consider adding localized copy for the Advent section via `next-i18next` if the section becomes permanent.

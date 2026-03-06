---
paths:
  - 'apis/api-journeys/src/app/modules/block/**/*.ts'
  - 'apis/api-journeys/src/app/modules/action/**/*.ts'
---

When adding a `customizable` field to a new block type or action type, you must also:

1. Update the detection logic in `JourneyCustomizableService.recalculate()` in `apis/api-journeys/src/app/modules/journey/journeyCustomizable.service.ts`
2. Ensure the block's update mutation flows through `BlockService.update()` (which already triggers recalculation). If the new block uses a custom update path that bypasses `BlockService.update()`, add a direct call to `recalculate()` from that path.

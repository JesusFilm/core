---
paths:
  - 'apis/api-journeys/src/app/modules/block/**/*.ts'
  - 'apis/api-journeys/src/app/modules/action/**/*.ts'
---

When adding a `customizable` field to a new block type or action type, you must also update the detection logic in `JourneyCustomizableService.recalculate()` in `apis/api-journeys/src/app/modules/journey/journeyCustomizable.service.ts` to check for the new block/action type's `customizable` field.

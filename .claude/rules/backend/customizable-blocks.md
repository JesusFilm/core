---
paths:
  - 'apis/api-journeys-modern/src/schema/action/**/*.ts'
  - 'apis/api-journeys-modern/src/schema/block/**/*.ts'
---

When adding a `customizable` field to a new block type or action type, you must also:

1. Update the detection logic in `recalculateJourneyCustomizable()` in `apis/api-journeys-modern/src/lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable.ts`
2. Ensure that any new mutation that modifies `customizable` on a block or action calls the appropriate recalculation function after the database write.


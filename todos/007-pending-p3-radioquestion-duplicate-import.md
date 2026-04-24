---
status: pending
priority: p3
issue_id: 'QA-359'
tags: [code-review, quality, typescript]
dependencies: []
---

# Remove Duplicate Import + Lint Suppress for `actionToTarget` in RadioQuestion.tsx

## Problem Statement

`RadioQuestion.tsx` has two separate import statements from the same module (`../../libs/plausibleHelpers`): one barrel import and one direct file import that duplicates `actionToTarget`. The direct import suppresses an import cycle lint rule that doesn't actually apply, since `actionToTarget` is already re-exported from the barrel `index.ts`.

## Findings

- `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx:12–21` — two imports:
  ```ts
  import {
    JourneyPlausibleEvents,
    fireCaptureEvent,
    keyify,
    templateKeyify
  } from '../../libs/plausibleHelpers'
  // eslint-disable-next-line import/no-cycle
  import { actionToTarget } from '../../libs/plausibleHelpers/plausibleHelpers'
  ```
- `libs/journeys/ui/src/libs/plausibleHelpers/index.ts` — already exports `actionToTarget` on line 2.
- The direct import to `plausibleHelpers.ts` with `eslint-disable-next-line import/no-cycle` is unnecessary — the barrel re-export is the correct path and doesn't trigger the cycle rule.
- Flagged by `kieran-typescript-reviewer` (P3).

## Proposed Solutions

### Option 1: Merge Imports into Single Barrel Import (Recommended)

**Approach:** Combine both imports into one:

```ts
import {
  JourneyPlausibleEvents,
  actionToTarget,
  fireCaptureEvent,
  keyify,
  templateKeyify
} from '../../libs/plausibleHelpers'
```

Remove the direct import line and the `eslint-disable-next-line` comment.

**Pros:** Consistent with `Button.tsx` and `VideoEvents.tsx` pattern; removes lint suppression.
**Cons:** None.

**Effort:** 5 min  
**Risk:** None

## Recommended Action

_To be filled during triage._

## Technical Details

**Affected files:**
- `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx:12–21`

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Ticket:** QA-359
- **Flagged by:** kieran-typescript-reviewer (P3)

## Acceptance Criteria

- [ ] `RadioQuestion.tsx` has a single import for all `plausibleHelpers` symbols via barrel
- [ ] `eslint-disable-next-line import/no-cycle` comment removed
- [ ] TypeScript compiles without errors
- [ ] `npx jest --config libs/journeys/ui/jest.config.ts --no-coverage 'libs/journeys/ui/src/components/RadioQuestion'` passes

## Work Log

### 2026-04-24 — Initial Discovery

**By:** CE Review (kieran-typescript-reviewer)

**Actions:**
- Identified duplicate import and unnecessary lint suppression
- Confirmed `actionToTarget` is already in `index.ts`

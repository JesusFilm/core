---
status: pending
priority: p2
issue_id: 'QA-359'
tags: [code-review, architecture, typescript, analytics, maintainability]
dependencies: []
---

# Type-Enforce `EVENT_TO_CAPTURE_MAP` on Server to Match Frontend Exhaustive Map

## Problem Statement

The frontend has an exhaustive `Record<BlockEventLabel, keyof JourneyPlausibleEvents | null>` that TypeScript enforces at compile time — adding a new `BlockEventLabel` without a mapping entry is a compile error. The server-side counterpart `EVENT_TO_CAPTURE_MAP` in `transformBreakdownResults.ts` uses `Record<string, string>`, giving it no such enforcement. A developer who adds a new `BlockEventLabel` + capture goal will get a TypeScript error on the frontend but no signal on the server, causing historical event misclassification silently.

## Findings

- `apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/transformBreakdownResults.ts:16–27` — `EVENT_TO_CAPTURE_MAP: Record<string, string>`. Accepts any string keys; no link to `BlockEventLabel` enum.
- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts:194–218` — `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT: Record<BlockEventLabel, ...>` is the exhaustive source of truth.
- Comments in both files cross-reference each other, but cross-package TypeScript enforcement is not possible without a shared constants package.
- Flagged independently by `kieran-typescript-reviewer` (P3) and `architecture-strategist` (P2).

## Proposed Solutions

### Option 1: Type `EVENT_TO_CAPTURE_MAP` as `Partial<Record<BlockEventLabel, string>>` (Recommended Short-Term)

**Approach:** Import `BlockEventLabel` from the generated GraphQL types (already available in the package) and retype the map:

```ts
import { BlockEventLabel } from '../../../../../__generated__/graphql'

const EVENT_TO_CAPTURE_MAP: Partial<Record<BlockEventLabel, string>> = {
  [BlockEventLabel.decisionForChrist]: 'christDecisionCapture',
  [BlockEventLabel.gospelPresentationStart]: 'gospelStartCapture',
  [BlockEventLabel.gospelPresentationComplete]: 'gospelCompleteCapture',
  [BlockEventLabel.prayerRequest]: 'prayerRequestCapture',
  [BlockEventLabel.rsvp]: 'rsvpCapture',
  [BlockEventLabel.specialVideoStart]: 'specialVideoStartCapture',
  [BlockEventLabel.specialVideoComplete]: 'specialVideoCompleteCapture',
  [BlockEventLabel.custom1]: 'custom1Capture',
  [BlockEventLabel.custom2]: 'custom2Capture',
  [BlockEventLabel.custom3]: 'custom3Capture',
}
```

Using `Partial` (not full `Record`) is appropriate because `inviteFriend` and `share` have no registered goals and the server map only handles historical raw-enum events — labels with no registered goal never appeared in the Plausible data stream.

**Pros:**
- IDE autocomplete and refactoring tools now understand the keys
- New `BlockEventLabel` values show up as IDE suggestions
- No cross-package changes needed

**Cons:**
- Still not compile-time exhaustive (Partial allows omitting entries without error)
- Does not prevent silent omissions for new labels with registered goals

**Effort:** 30 min  
**Risk:** Low

---

### Option 2: Extract Shared Constants Package (Long-Term)

**Approach:** Move `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` to a shared library (`libs/journeys/data` or similar) importable from both `libs/journeys/ui` and `apis/api-journeys-modern`. Derive `EVENT_TO_CAPTURE_MAP` from the same constant rather than duplicating.

**Pros:**
- Single source of truth; impossible to diverge
- Compile-time exhaustiveness enforced at both boundaries

**Cons:**
- Requires new shared lib + Nx project config
- Cross-package build dependency change
- Significant scope increase

**Effort:** 2–3 days  
**Risk:** Medium (build graph change)

---

### Option 3: Add Integration Test Asserting Map Parity

**Approach:** Add a test in `api-journeys-modern` that imports the frontend constant via a shared type and asserts both maps contain identical keys.

**Pros:** Lightweight runtime guard without structural changes.
**Cons:** Cross-package import in test is awkward; still no IDE assistance.

**Effort:** 1 hour  
**Risk:** Low

## Recommended Action

_To be filled during triage._

## Technical Details

**Affected files:**
- `apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/transformBreakdownResults.ts:16–27`

**Related files:**
- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts:194–218` — frontend counterpart

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Ticket:** QA-359
- **Flagged by:** kieran-typescript-reviewer (P3) + architecture-strategist (P2)

## Acceptance Criteria

- [ ] `EVENT_TO_CAPTURE_MAP` is typed with `BlockEventLabel` keys (at minimum `Partial<Record<BlockEventLabel, string>>`)
- [ ] TypeScript compiles in `api-journeys-modern` without errors
- [ ] Existing tests pass

## Work Log

### 2026-04-24 — Initial Discovery

**By:** CE Review (architecture-strategist + kieran-typescript-reviewer)

**Actions:**
- Identified type mismatch between frontend exhaustive map and server `Record<string, string>`
- Confirmed `BlockEventLabel` enum is available in both packages via GraphQL code generation

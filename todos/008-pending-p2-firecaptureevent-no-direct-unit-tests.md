---
status: pending
priority: p2
issue_id: '008'
tags: [code-review, testing, analytics, journeys-ui]
dependencies: ['007']
---

# Add direct unit tests for `fireCaptureEvent` helper in plausibleHelpers.spec.ts

## Problem Statement

`fireCaptureEvent` is the central helper for all Plausible capture event dispatch introduced in PR #9075. It is called 5 times across 3 components (`Button.tsx` ×2, `RadioQuestion.tsx` ×1, `VideoEvents.tsx` ×2) and encapsulates the mapping lookup, null-guard, `key`/`simpleKey`/`templateKey` construction, and `plausible()` call. Despite being the core correctness claim of the PR, it has zero direct unit tests in `plausibleHelpers.spec.ts`. Component specs test it indirectly for `custom1`/`custom2` labels only; critical label mappings (`decisionForChrist` → `christDecisionCapture`) are not verified at the helper level.

## Findings

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.spec.ts` — no `describe('fireCaptureEvent')` block
- `libs/journeys/ui/src/components/Button/Button.spec.tsx` — tests `custom1Capture` and `custom2Capture` via button click, but not the full `fireCaptureEvent` logic in isolation
- `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.spec.tsx` — similar indirect coverage
- `libs/journeys/ui/src/components/VideoEvents/VideoEvents.spec.tsx` — similar indirect coverage
- Raised by `kieran-typescript-reviewer` (P1) and `architecture-strategist` (P1) during ce-review of PR #9075

**Untested behaviors:**

1. When `eventLabel` is `null` → `fireCaptureEvent` should be a no-op (plausible not called)
2. When `eventLabel` maps to `null` (e.g., `inviteFriend`, `share`) → no-op
3. When `eventLabel` maps to a capture goal → plausible called with correct `key`, `simpleKey`, `templateKey`, `u`, and spread of `input`
4. That `key` uses `blockId` override (not `input.blockId`) in all cases

## Proposed Solutions

### Option 1: Add a `describe('fireCaptureEvent')` block in `plausibleHelpers.spec.ts`

**Approach:** Mock `usePlausible` return value, call `fireCaptureEvent` directly, assert on the mock.

```ts
describe('fireCaptureEvent', () => {
  const mockPlausible = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('is a no-op when eventLabel is null', () => {
    fireCaptureEvent(mockPlausible, null, { u: 'http://x', input: { id: 'e1', blockId: 'b1' }, stepId: 's1', blockId: 'b1', journeyId: 'j1' })
    expect(mockPlausible).not.toHaveBeenCalled()
  })

  it('is a no-op for eventLabels with no registered Plausible goal (inviteFriend)', () => {
    fireCaptureEvent(mockPlausible, BlockEventLabel.inviteFriend, { u: 'http://x', input: { id: 'e1', blockId: 'b1' }, stepId: 's1', blockId: 'b1', journeyId: 'j1' })
    expect(mockPlausible).not.toHaveBeenCalled()
  })

  it('fires christDecisionCapture for decisionForChrist label', () => {
    fireCaptureEvent(mockPlausible, BlockEventLabel.decisionForChrist, { u: 'http://x', input: { id: 'e1', blockId: 'b1' }, stepId: 's1', blockId: 'opt1', journeyId: 'j1' })
    expect(mockPlausible).toHaveBeenCalledWith(
      'christDecisionCapture',
      expect.objectContaining({
        u: 'http://x',
        props: expect.objectContaining({
          blockId: 'opt1', // override, not input.blockId
          id: 'e1'
        })
      })
    )
  })
})
```

**Pros:**

- Tests the exact behavior that caused QA-359
- Isolated from component rendering complexity
- Catches regressions without running component tests

**Cons:**

- Requires mocking `usePlausible` return type — same pattern used in component specs already

**Effort:** Small | **Risk:** Low

### Option 2: Add tests only for null-guard behavior; rely on existing component specs for mapping

**Approach:** Only add the two no-op tests. Keep mapping coverage in component specs.

**Pros:** Smaller diff
**Cons:** Doesn't directly test the mapping-to-event-name path that was the root cause of QA-359

**Effort:** XSmall | **Risk:** Low

## Recommended Action

Option 1 — full coverage for `fireCaptureEvent`. The helper is thin but its correctness is the primary claim of this bug fix. Three focused tests (null → no-op, unmapped → no-op, decisionForChrist → christDecisionCapture) are sufficient and fast.

## Technical Details

**Affected files:**

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.spec.ts`

**Jest config:** `libs/journeys/ui/jest.config.ts`

**Run command:**

```bash
npx jest --config libs/journeys/ui/jest.config.ts --no-coverage 'libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.spec.ts'
```

## Acceptance Criteria

- [ ] `describe('fireCaptureEvent')` block added to `plausibleHelpers.spec.ts`
- [ ] Test: `eventLabel = null` → `mockPlausible` not called
- [ ] Test: `eventLabel = BlockEventLabel.inviteFriend` → `mockPlausible` not called (no registered goal)
- [ ] Test: `eventLabel = BlockEventLabel.decisionForChrist` → `mockPlausible` called with `'christDecisionCapture'`
- [ ] Test verifies `blockId` override in props (not `input.blockId`)
- [ ] All tests pass: `npx jest --config libs/journeys/ui/jest.config.ts --no-coverage 'plausibleHelpers.spec.ts'`

## Work Log

- 2026-04-24: Identified by `kieran-typescript-reviewer` (P1) and `architecture-strategist` (P1) during ce-review of PR #9075. `fireCaptureEvent` is the core correctness claim of QA-359 but has no direct unit tests.

---
status: pending
priority: p3
issue_id: 'QA-359'
tags: [code-review, testing, quality, analytics]
dependencies: []
---

# Add Direct Unit Tests for `fireCaptureEvent` Helper

## Problem Statement

`fireCaptureEvent` is the primary correctness fix for QA-359 — it is the single helper that centralises capture event dispatch across 5 call sites. The spec file covers `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` mapping exhaustively (all 12 enum values). However, `fireCaptureEvent` itself has zero direct unit tests. Coverage comes only indirectly through component specs (`VideoEvents.spec.tsx`, `RadioQuestion.spec.tsx`, `Button.spec.tsx`), which each cover one happy-path call site. Edge cases for the helper itself are untested.

## Findings

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.spec.ts` — no test block for `fireCaptureEvent`.
- Missing test cases:
  - `eventLabel === null` → no call to `plausible`
  - `eventLabel === undefined` → no call to `plausible`
  - `eventLabel === BlockEventLabel.inviteFriend` → null-mapped, no call to `plausible`
  - `eventLabel === BlockEventLabel.decisionForChrist` → fires `christDecisionCapture` with correct `u`, `key`, `simpleKey`, `templateKey`
  - `templateTarget` is used in `templateKey.target`, not `target`
- Flagged by `kieran-typescript-reviewer` (P3).

## Proposed Solutions

### Option 1: Add Unit Tests to `plausibleHelpers.spec.ts`

**Approach:** Add a `describe('fireCaptureEvent')` block alongside the existing `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` tests:

```ts
describe('fireCaptureEvent', () => {
  const mockPlausible = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('does nothing when eventLabel is null', () => {
    fireCaptureEvent(mockPlausible, null, { u: 'https://example.com/j/s', input: {}, stepId: 's', blockId: 'b' })
    expect(mockPlausible).not.toHaveBeenCalled()
  })

  it('does nothing when eventLabel is undefined', () => {
    fireCaptureEvent(mockPlausible, undefined, { u: 'https://example.com/j/s', input: {}, stepId: 's', blockId: 'b' })
    expect(mockPlausible).not.toHaveBeenCalled()
  })

  it('does nothing when eventLabel maps to null (inviteFriend)', () => {
    fireCaptureEvent(mockPlausible, BlockEventLabel.inviteFriend, { u: 'https://example.com/j/s', input: {}, stepId: 's', blockId: 'b' })
    expect(mockPlausible).not.toHaveBeenCalled()
  })

  it('fires mapped capture event with correct u, key, simpleKey, templateKey', () => {
    const input = { stepId: 's1', blockId: 'b1', journeyId: 'j1' }
    fireCaptureEvent(mockPlausible, BlockEventLabel.decisionForChrist, {
      u: 'https://example.com/j1/s1',
      input,
      stepId: 's1',
      blockId: 'b1',
      journeyId: 'j1'
    })
    expect(mockPlausible).toHaveBeenCalledWith('christDecisionCapture', {
      u: 'https://example.com/j1/s1',
      props: expect.objectContaining({
        key: expect.stringContaining('christDecisionCapture'),
        simpleKey: expect.stringContaining('christDecisionCapture'),
        templateKey: expect.stringContaining('christDecisionCapture')
      })
    })
  })
})
```

**Pros:**

- Fast unit tests, no component rendering needed
- Directly validates the helper's null-guard, mapping lookup, and prop construction
- Proves the fix for QA-359 at the unit level

**Cons:** None significant.

**Effort:** 1 hour  
**Risk:** None

## Recommended Action

_To be filled during triage._

## Technical Details

**Affected files:**

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.spec.ts` — add new describe block

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Ticket:** QA-359
- **Flagged by:** kieran-typescript-reviewer (P3)

## Acceptance Criteria

- [ ] Test exists for `eventLabel === null` → no plausible call
- [ ] Test exists for `eventLabel === undefined` → no plausible call
- [ ] Test exists for null-mapped label (inviteFriend/share) → no plausible call
- [ ] Test exists for mapped label (decisionForChrist) → fires correct capture event name
- [ ] All tests pass

## Work Log

### 2026-04-24 — Initial Discovery

**By:** CE Review (kieran-typescript-reviewer)

**Actions:**

- Confirmed no direct unit tests for `fireCaptureEvent` in spec file
- Listed 4 missing test scenarios

---
status: complete
priority: p3
issue_id: '006'
tags: [code-review, analytics, testing, journeys-ui]
dependencies: ['002']
---

# BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT has no direct unit test

## Problem Statement

`BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` is the core correctness claim of PR #9075 — it maps `BlockEventLabel` enum values to their registered Plausible goal names. The component tests exercise `custom1Capture` and `custom2Capture` only. No test directly asserts that specific labels (e.g., `decisionForChrist`) map to their expected Plausible goal (e.g., `christDecisionCapture`). If a future rename of a key in `JourneyPlausibleEvents` breaks the mapping, the component tests may not catch it.

## Findings

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.spec.ts` — has tests for `keyify`, `reverseKeyify`, `templateKeyify`, and `actionToTarget`, but no test for `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT`
- Component tests (`RadioQuestion.spec.tsx`, `Button.spec.tsx`, `VideoEvents.spec.tsx`) cover `custom1` and `custom2` label mappings indirectly
- Critical mappings (`decisionForChrist` → `christDecisionCapture`, etc.) are untested

## Proposed Solutions

### Option 1: Add tests for BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT in plausibleHelpers.spec.ts

**Approach:**
```ts
describe('BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT', () => {
  it('maps decisionForChrist to christDecisionCapture', () => {
    expect(BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT[BlockEventLabel.decisionForChrist]).toBe('christDecisionCapture')
  })
  it('maps gospelPresentationStart to gospelStartCapture', () => { ... })
  // etc. for all entries
  it('returns undefined for inviteFriend', () => {
    expect(BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT[BlockEventLabel.inviteFriend]).toBeNull() // or undefined, depending on fix from todo 002
  })
})
```

**Pros:**
- Documents the expected mappings as executable specs
- Catches regressions if Plausible goal names are renamed

**Cons:**
- Tests data rather than behaviour; pure "snapshot" style

**Effort:** 30 minutes

**Risk:** Low

## Recommended Action

Add direct tests for the mapping constant in `plausibleHelpers.spec.ts`. This is especially important for the critical `decisionForChrist` → `christDecisionCapture` mapping that motivated the entire fix.

## Technical Details

**Affected files:**
- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.spec.ts`

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Found by:** kieran-typescript-reviewer (code review agent)

## Acceptance Criteria

- [ ] `plausibleHelpers.spec.ts` has a `describe('BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT')` block
- [ ] Each mapped label has an assertion for its expected Plausible event name
- [ ] `inviteFriend` and `share` have assertions confirming their intentional exclusion (null or absent)
- [ ] Tests pass

## Work Log

### 2026-04-24 - Identified during code review

**By:** kieran-typescript-reviewer agent

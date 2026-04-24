---
status: complete
priority: p1
issue_id: '001'
tags: [code-review, react, hooks, analytics, journeys-ui]
dependencies: []
---

# VideoEvents useEffect missing eventLabel/endEventLabel in dependency arrays

## Problem Statement

Two `useEffect` hooks in `VideoEvents.tsx` close over `eventLabel` and `endEventLabel` props but do not list them in the dependency arrays. This is a React stale-closure bug: if a parent re-renders with a different `eventLabel` or `endEventLabel`, the stale listener registered on the video player will continue using the old value — the new capture event will never fire.

## Findings

- `VideoEvents.tsx` START `useEffect` (dependency array around line 503–519): closes over `eventLabel` prop in the `startListener` function, but `eventLabel` is absent from the dep array
- `VideoEvents.tsx` COMPLETE `useEffect` (dependency array around line 794–807): closes over `endEventLabel` prop in the `completeListener` function, but `endEventLabel` is absent from the dep array
- Both props are `BlockEventLabel | null | undefined`, so their reference is stable per render but the exhaustive-deps lint rule would flag these
- In practice, `eventLabel` is likely set once and never changed for a given video block, so there is no visible symptom today — but it is a correctness violation that would cause silent bugs if the parent ever re-renders with different props

**PR:** [#9075](https://github.com/JesusFilm/core/pull/9075) — introduced during the capture event refactor

## Proposed Solutions

### Option 1: Add props to dependency arrays

**Approach:** Add `eventLabel` to the START `useEffect` dep array and `endEventLabel` to the COMPLETE `useEffect` dep array. This matches the rule of hooks and is the minimal correct fix.

**Pros:**
- Correct by React spec
- Fixes exhaustive-deps lint warning
- Minimal change

**Cons:**
- May cause the player listeners to be re-registered slightly more often if parent re-renders (acceptable — player `.off` / `.on` is cheap)

**Effort:** 15 minutes

**Risk:** Low

---

### Option 2: Suppress the lint warning with a comment explaining why the value is stable

**Approach:** Add `// eslint-disable-next-line react-hooks/exhaustive-deps` with a comment explaining that `eventLabel` is set by the block data at mount time and never changes.

**Pros:**
- Avoids re-registering listeners

**Cons:**
- Incorrect by React spec — the assumption may not hold forever
- Lint suppression without a defensive check is a code smell

**Effort:** 5 minutes

**Risk:** Medium (hides the issue)

## Recommended Action

Use Option 1. Add the props to the dep arrays. The cost is negligible and the code becomes correct by spec.

## Technical Details

**Affected files:**
- `libs/journeys/ui/src/components/VideoEvents/VideoEvents.tsx` — START useEffect dep array and COMPLETE useEffect dep array

**Related components:**
- `VideoEvents` component receives `eventLabel?: BlockEventLabel | null` and `endEventLabel?: BlockEventLabel | null` as props

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Found by:** kieran-typescript-reviewer (code review agent)

## Acceptance Criteria

- [ ] `eventLabel` appears in START `useEffect` dependency array
- [ ] `endEventLabel` appears in COMPLETE `useEffect` dependency array
- [ ] React exhaustive-deps lint rule does not flag either hook
- [ ] All VideoEvents tests pass

## Work Log

### 2026-04-24 - Identified during code review

**By:** CE review agent (kieran-typescript-reviewer)

**Actions:**
- Identified missing deps in both VideoEvents capture event useEffect hooks
- Confirmed both props are closed over inside the listener functions

**Learnings:**
- The bug is dormant today because block props don't change at runtime, but is a React correctness violation

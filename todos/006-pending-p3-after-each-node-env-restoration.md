---
status: pending
priority: p3
issue_id: 'QA-359'
tags: [code-review, testing, quality]
dependencies: []
---

# Fix Missing `afterEach` NODE_ENV Restoration in `appendEventToGoogleSheets` Block

## Problem Statement

The test file `apis/api-journeys-modern/src/schema/event/utils.spec.ts` uses `Object.defineProperty` to temporarily set `process.env.NODE_ENV = undefined` in `beforeEach` hooks. The outer `describe('event utils')` block has an `afterEach` that restores `NODE_ENV = 'test'`. However, the nested `describe('appendEventToGoogleSheets')` block sets `NODE_ENV = undefined` in its own `beforeEach` (line 493–495) but has an `afterEach` that only calls `jest.useRealTimers()` — it does not restore `NODE_ENV`. It relies entirely on the outer `afterEach` for cleanup.

If a test failure or uncaught exception prevents the outer `afterEach` from running, `NODE_ENV` remains `undefined` for subsequent test files in the same Jest worker process, potentially causing test pollution.

This was introduced by the recent commits on this branch as part of the `Object.defineProperty` migration.

## Findings

- `apis/api-journeys-modern/src/schema/event/utils.spec.ts:489–508` — `describe('appendEventToGoogleSheets')` `beforeEach` sets `NODE_ENV = undefined` (line 493–495) but its `afterEach` (line 505–507) only calls `jest.useRealTimers()`.
- The outer `describe` `afterEach` at line 62–68 does restore `NODE_ENV`, but relying on the outer hook for inner describe cleanup is fragile.
- The `sendEventsEmail` and `resetEventsEmailDelay` nested describes also lack their own `afterEach` for `NODE_ENV`, but these were pre-existing (not introduced by this PR).

## Proposed Solutions

### Option 1: Add `afterEach` NODE_ENV Restoration to Nested Block (Recommended)

**Approach:** Extend the existing `afterEach` in `describe('appendEventToGoogleSheets')`:

```ts
afterEach(() => {
  jest.useRealTimers()
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    writable: true,
    configurable: true
  })
})
```

**Pros:** Makes each describe block self-contained; no reliance on outer hooks for environment cleanup.
**Cons:** Slightly verbose.

**Effort:** 5 min  
**Risk:** None

---

### Option 2: Extract Helper

**Approach:** Create a shared helper for the `Object.defineProperty` pattern:

```ts
function setNodeEnv(value: string | undefined): void {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value,
    writable: true,
    configurable: true
  })
}
```

Use `setNodeEnv(undefined)` and `setNodeEnv('test')` throughout the file.

**Pros:** DRY; reduces copy-paste of the verbose `Object.defineProperty` call.
**Cons:** Adds a helper function that only exists in a test file.

**Effort:** 15 min  
**Risk:** None

## Recommended Action

_To be filled during triage._

## Technical Details

**Affected files:**

- `apis/api-journeys-modern/src/schema/event/utils.spec.ts:489–508`

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Ticket:** QA-359
- **Flagged by:** security-sentinel (P3)

## Acceptance Criteria

- [ ] `describe('appendEventToGoogleSheets')` `afterEach` restores `NODE_ENV = 'test'`
- [ ] All tests in the file pass

## Work Log

### 2026-04-24 — Initial Discovery

**By:** CE Review (security-sentinel)

**Actions:**

- Identified missing `NODE_ENV` restoration in `appendEventToGoogleSheets` `afterEach`
- Confirmed introduced by this branch's Object.defineProperty migration

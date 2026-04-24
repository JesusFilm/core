---
status: pending
priority: p2
issue_id: 'QA-359'
tags: [code-review, security, runtime-errors, analytics]
dependencies: []
---

# Wrap `reverseKeyify` JSON.parse in try/catch with Schema Validation

## Problem Statement

`reverseKeyify` at `plausibleHelpers.ts:145–153` calls `JSON.parse(key)` on a string that originates from Plausible's analytics API response (`action.property` from the `/api/v1/stats/breakdown` endpoint). There is no try/catch and no validation of the parsed result's shape. If Plausible returns a malformed, empty, or unexpected value — whether from data corruption, API change, or a crafted property value — `JSON.parse` throws an uncaught exception that crashes the analytics transformation pipeline.

The function's TypeScript return type declares a specific shape (an object with `stepId`, `event`, `blockId` etc.), but TypeScript provides no runtime enforcement of this shape after `JSON.parse`.

This is a pre-existing issue in the module this PR touches. While not introduced by PR #9075, it is surfaced here as part of the broader module review.

## Findings

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts:145–153` — `reverseKeyify` calls `JSON.parse(key)` with no try/catch.
- `libs/journeys/ui/src/libs/useJourneyAnalyticsQuery/transformJourneyAnalytics/transformJourneyAnalytics.ts:149` — `reverseKeyify` is called on `action.property` which is a string from the Plausible API response.
- If `action.property` is `null`, `undefined`, or not valid JSON, `JSON.parse` throws a `SyntaxError` with no recovery path.
- Return type `ReturnType<typeof reverseKeyify>` is used downstream to access `.stepId`, `.event`, etc. — a wrong shape propagates as trusted data.
- Flagged by `security-sentinel` (P2).

## Proposed Solutions

### Option 1: try/catch + null Return (Recommended)

**Approach:** Wrap `JSON.parse` in try/catch and return `null` on failure. Update call sites to handle the nullable return.

```ts
export function reverseKeyify(key: string): { stepId: string; event: string; blockId: string; target?: string; journeyId?: string } | null {
  try {
    const parsed = JSON.parse(key)
    if (typeof parsed?.stepId !== 'string' || typeof parsed?.event !== 'string' || typeof parsed?.blockId !== 'string') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}
```

Update call site in `transformJourneyAnalytics.ts` to skip the entry when `reverseKeyify` returns `null`.

**Pros:**

- Prevents analytics transformation crash on bad Plausible data
- Validates required fields at runtime
- Safe null return is easy to handle at call site

**Cons:**

- Requires updating call site(s) to handle `null`
- Silent failures could mask data quality issues (add a `console.warn` in catch)

**Effort:** 1 hour  
**Risk:** Low

---

### Option 2: try/catch Only (No Schema Validation)

**Approach:** Just add try/catch without the shape validation:

```ts
try {
  return JSON.parse(key)
} catch {
  return null
}
```

**Pros:** Minimal change; prevents crash on invalid JSON.
**Cons:** Does not catch cases where `JSON.parse` succeeds but returns a wrong shape (e.g., a plain string or array).

**Effort:** 15 min  
**Risk:** Very Low

## Recommended Action

_To be filled during triage._

## Technical Details

**Affected files:**

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts:145–153` — `reverseKeyify` function
- `libs/journeys/ui/src/libs/useJourneyAnalyticsQuery/transformJourneyAnalytics/transformJourneyAnalytics.ts:149` — call site

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Ticket:** QA-359
- **Flagged by:** security-sentinel (P2)

## Acceptance Criteria

- [ ] `reverseKeyify` does not throw on invalid JSON input
- [ ] `reverseKeyify` returns `null` (or a sentinel) when input is malformed or fails shape check
- [ ] Call site handles `null` return gracefully (skips entry or uses fallback)
- [ ] Unit test added for invalid JSON input → returns null

## Work Log

### 2026-04-24 — Initial Discovery

**By:** CE Review (security-sentinel)

**Actions:**

- Identified bare `JSON.parse` in `reverseKeyify` on Plausible API data
- Confirmed no try/catch or schema validation exists
- Identified single call site in `transformJourneyAnalytics.ts`

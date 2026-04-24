---
status: pending
priority: p2
issue_id: '003'
tags: [code-review, analytics, plausible, testing, journeys-ui, architecture]
dependencies: ['002']
---

# No test enforcing sync between BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT and EVENT_TO_CAPTURE_MAP

## Problem Statement

The PR introduces a client-side `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` (in `plausibleHelpers.ts`) to map enum values to Plausible goal names. A parallel server-side `EVENT_TO_CAPTURE_MAP` already exists in `transformBreakdownResults.ts` for the same purpose (backward-compat read-time normalization). Both maps encode the same 10-entry domain knowledge across two different packages. There is no test, type constraint, or CI check ensuring they remain in sync. If one is updated without the other, historical vs. new Plausible data will be aggregated under different event names, corrupting the template stats breakdown.

## Findings

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts` lines 192–205 — client-side map (enum keys, string values)
- `apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/transformBreakdownResults.ts` lines 16–27 — server-side map (string keys, string values)
- Both map the same 10 entries; at runtime the keys are identical strings (TypeScript enums with string values)
- No test imports both maps and asserts their equivalence
- The `goals` array in `service.ts` is a third related list that must also stay in sync

## Proposed Solutions

### Option 1: Add a cross-package integration test asserting map equivalence

**Approach:** In the `transformBreakdownResults.spec.ts` (or a new spec), import `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` and `EVENT_TO_CAPTURE_MAP` and assert:
- Every key in `EVENT_TO_CAPTURE_MAP` equals a key in `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT`
- Every non-null value in `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` appears in `EVENT_TO_CAPTURE_MAP`'s values

**Pros:**
- Catches drift at CI time
- Documents the relationship explicitly in executable form

**Cons:**
- Cross-package import may require build/jest config adjustments in the Nx monorepo
- Adds a test that tests data rather than behaviour

**Effort:** 2–3 hours

**Risk:** Low

---

### Option 2: Add explanatory comments cross-referencing the two maps

**Approach:** Add a comment to each map referencing the other and explaining why both exist.

```ts
// This map has a server-side counterpart: EVENT_TO_CAPTURE_MAP in transformBreakdownResults.ts.
// That map handles historical Plausible data recorded with raw enum values before this fix.
// Both maps must be kept in sync. See: apis/api-journeys-modern/.../transformBreakdownResults.ts
```

**Pros:**
- Zero effort
- Makes the relationship visible

**Cons:**
- Comments can be ignored; no enforcement

**Effort:** 15 minutes

**Risk:** Low (doesn't prevent drift)

## Recommended Action

Option 2 as an immediate improvement in this PR; Option 1 as a follow-up task. Cross-referencing comments are a minimal investment that surfaces the coupling for the next developer. A proper integration test should be added when there is bandwidth.

## Technical Details

**Affected files:**
- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts`
- `apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/transformBreakdownResults.ts`
- `apis/api-journeys-modern/src/workers/plausible/service.ts` (goals array — third related list)

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Found by:** architecture-strategist (code review agent)

## Acceptance Criteria

- [ ] Both maps have cross-referencing comments explaining why both exist and that they must stay in sync
- [ ] (Optional follow-up) A test asserts that the two maps cover the same event labels
- [ ] A comment on `goals` in `service.ts` references both maps

## Work Log

### 2026-04-24 - Identified during code review

**By:** architecture-strategist agent

**Actions:**
- Identified both maps in separate packages encoding the same domain knowledge
- Confirmed there is no test or type assertion linking them

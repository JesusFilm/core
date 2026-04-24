---
status: pending
priority: p2
issue_id: '009'
tags: [code-review, testing, analytics, server, plausible]
dependencies: []
---

# Add test for EVENT_TO_CAPTURE_MAP backward-compat path in transformBreakdownResults

## Problem Statement

`transformBreakdownResults.ts` contains `EVENT_TO_CAPTURE_MAP` which maps historical Plausible event names (e.g. `decisionForChrist`) to their canonical capture goal names (e.g. `christDecisionCapture`). This mapping is critical for backward compatibility: all Plausible data recorded before PR #9075 used the raw `BlockEventLabel` enum strings. Without this map, historical stats would disappear from the `TemplateBreakdownAnalyticsDialog`. Yet `transformBreakdownResults.spec.ts` has no test that exercises this rename path — there is no test asserting that a row with `event: 'decisionForChrist'` is correctly mapped to `christDecisionCapture` in the breakdown output.

## Findings

- `apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/transformBreakdownResults.ts` — `EVENT_TO_CAPTURE_MAP` maps old to new event names
- `apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/transformBreakdownResults.spec.ts` — no test for the rename path (confirmed by `architecture-strategist` during ce-review of PR #9075)
- If `EVENT_TO_CAPTURE_MAP` is inadvertently removed or a key is mistyped, historical data becomes invisible to the stats breakdown UI with no failing test

## Proposed Solutions

### Option 1: Add a test case in `transformBreakdownResults.spec.ts` for each renamed event

**Approach:** In the existing spec, add a fixture row with `event: 'decisionForChrist'` and assert the output contains `christDecisionCapture` with the correct count.

```ts
it('maps historical decisionForChrist events to christDecisionCapture via EVENT_TO_CAPTURE_MAP', () => {
  const breakdown = [{ property: JSON.stringify({ event: 'decisionForChrist', target: '', journeyId: 'j1' }), visitors: 3 }]
  const result = transformBreakdownResults(breakdown, { journeyId: 'j1' })
  expect(result.christDecisionCapture).toBe(3)
  expect(result.decisionForChrist).toBeUndefined()
})
```

Add similar cases for `gospelPresentationStart` → `gospelStartCapture`, etc. (or at minimum the most critical rename).

**Pros:**

- Directly tests backward compatibility — the key value of `EVENT_TO_CAPTURE_MAP`
- Fast to add (one `it()` per rename, or one data-driven test for all)

**Cons:**

- Requires understanding the `transformBreakdownResults` API shape

**Effort:** Small | **Risk:** Low

### Option 2: Add a single parameterized test covering all EVENT_TO_CAPTURE_MAP entries

**Approach:** Use `it.each` over all map entries:

```ts
it.each(Object.entries(EVENT_TO_CAPTURE_MAP))('maps historical %s to %s', (oldName, newName) => {
  ...
})
```

**Pros:** Single test covers all renames, fails if any entry breaks
**Cons:** Requires `EVENT_TO_CAPTURE_MAP` to be exported from the module

**Effort:** Small | **Risk:** Low

## Recommended Action

Option 1 for the critical rename (`decisionForChrist` → `christDecisionCapture`), plus a note to follow up with Option 2 when the map stabilizes. The critical rename is the one that caused QA-359, so it deserves an explicit regression test.

## Technical Details

**Affected files:**

- `apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/transformBreakdownResults.spec.ts`

**Jest config:** `apis/api-journeys-modern/jest.config.ts`

**Run command:**

```bash
npx jest --config apis/api-journeys-modern/jest.config.ts --no-coverage 'apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/transformBreakdownResults.spec.ts'
```

## Acceptance Criteria

- [ ] Test added: breakdown row with `event: 'decisionForChrist'` → output `christDecisionCapture` count correct
- [ ] Test added: `decisionForChrist` key does NOT appear in output (was renamed, not added alongside)
- [ ] All tests in `transformBreakdownResults.spec.ts` pass

## Work Log

- 2026-04-24: Identified by `architecture-strategist` (P1) during ce-review of PR #9075. `EVENT_TO_CAPTURE_MAP` backward compat path is entirely untested despite being critical for historical data.

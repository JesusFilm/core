---
status: pending
priority: p1
issue_id: '002'
tags: [code-review, analytics, plausible, journeys-ui, typescript]
dependencies: []
---

# inviteFriend and share BlockEventLabel values silently excluded from capture mapping

## Problem Statement

`BlockEventLabel` has 12 enum values, but `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` in `plausibleHelpers.ts` only maps 10 of them. `inviteFriend` and `share` are absent — with no comment explaining why. Any journey block configured with `eventLabel: BlockEventLabel.inviteFriend` or `eventLabel: BlockEventLabel.share` will silently fire no capture event. There is no TypeScript error, no runtime error, and no log entry — the tracking gap is completely invisible to developers.

This also means future developers adding new `BlockEventLabel` values have no clear signal about whether to include them in the mapping or leave them out.

## Findings

- `libs/journeys/ui/src/__generated__/globalTypes.ts` — `BlockEventLabel` enum has 12 values including `inviteFriend` and `share`
- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts` lines 192–205 — mapping covers only 10 values
- `apis/api-journeys-modern/src/workers/plausible/service.ts` `goals` array — does not include `inviteFriendCapture` or `shareCapture` (confirming no Plausible goals exist for these labels)
- The server-side `EVENT_TO_CAPTURE_MAP` in `transformBreakdownResults.ts` also excludes `inviteFriend` and `share`
- The `Partial<Record<BlockEventLabel, ...>>` type means TypeScript will never complain when a future `BlockEventLabel` value is added without a mapping entry

**PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)

## Proposed Solutions

### Option 1: Change type to `Record<BlockEventLabel, keyof JourneyPlausibleEvents | null>` and add explicit null entries

**Approach:** Replace `Partial<Record<...>>` with `Record<BlockEventLabel, keyof JourneyPlausibleEvents | null>`. Set `inviteFriend` and `share` to `null` explicitly (with a comment). Every future addition to `BlockEventLabel` will then require a conscious decision in the mapping.

```ts
export const BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT: Record<BlockEventLabel, keyof JourneyPlausibleEvents | null> = {
  [BlockEventLabel.decisionForChrist]: 'christDecisionCapture',
  // ...
  [BlockEventLabel.inviteFriend]: null, // no Plausible goal registered
  [BlockEventLabel.share]: null // no Plausible goal registered
}
```

**Pros:**

- Compile-time exhaustiveness — new `BlockEventLabel` values cause a TypeScript error until explicitly handled
- Makes intentional exclusions visible in code
- Eliminates silent data gaps forever

**Cons:**

- Requires updating the null-check in each component from `!= null` (which already handles `undefined`) to just `!= null` (same — `null` is caught too, so no component change needed)

**Effort:** 30 minutes

**Risk:** Low

---

### Option 2: Add a comment to `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` explaining the exclusions

**Approach:** Keep `Partial<Record<...>>` but add a comment listing which values are intentionally excluded and why.

```ts
// inviteFriend and share are excluded: no Plausible capture goals are registered for these labels.
// If goals are added for them in service.ts, add entries here too.
export const BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT: Partial<...> = { ... }
```

**Pros:**

- Minimal change
- Documents intent

**Cons:**

- Still no compile-time enforcement — future additions to `BlockEventLabel` remain silently unhandled

**Effort:** 5 minutes

**Risk:** Low (but leaves the systemic problem unfixed)

## Recommended Action

Option 1 is strongly preferred. The `Partial<Record<...>>` type is the root cause of the silent-failure risk. Changing it to an exhaustive `Record` with explicit `null` entries turns a runtime data gap into a compile-time error for all future additions.

## Technical Details

**Affected files:**

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts` — type and mapping definition
- Components (`RadioQuestion.tsx`, `Button.tsx`, `VideoEvents.tsx`) — null-check guards (no change needed; `captureEvent != null` already handles `null`)

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Found by:** kieran-typescript-reviewer, architecture-strategist (code review agents)

## Acceptance Criteria

- [ ] `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` is typed as `Record<BlockEventLabel, keyof JourneyPlausibleEvents | null>`
- [ ] `inviteFriend` and `share` entries are explicitly `null` with an explanatory comment
- [ ] Adding a new value to `BlockEventLabel` without updating the mapping causes a TypeScript compile error
- [ ] All existing tests pass (null entries are handled by existing `!= null` guards)

## Work Log

### 2026-04-24 - Identified during code review

**By:** CE review agents

**Actions:**

- Cross-referenced `BlockEventLabel` enum against mapping constant and server-side goals array
- Confirmed `inviteFriend` and `share` have no registered Plausible goals in service.ts
- Identified that `Partial<Record>` type silently allows future omissions

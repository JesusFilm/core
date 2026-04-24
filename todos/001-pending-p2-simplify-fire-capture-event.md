---
status: pending
priority: p2
issue_id: 'QA-359'
tags: [code-review, quality, typescript, simplicity]
dependencies: []
---

# Simplify `fireCaptureEvent` — Remove Useless Generic and Unreachable String Branch

## Problem Statement

`fireCaptureEvent` carries three complexity burdens that provide no compile-time or runtime safety benefit:

1. `<TInput extends object>` generic is immediately erased by an `as Props` cast at the return boundary — TypeScript provides zero additional safety over `object`.
2. `target?: Action | string | null` accepts raw strings that no caller ever passes — the string union is dead surface area inherited from `keyify`'s broader interface.
3. `stepId` is required in the options object at every call site, but all callers compute it identically as `input.stepId ?? ''`.

## Findings

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts:230` — `<TInput extends object>` generic erased by `as Props` on line 259. 5 call sites show the generic in action; none benefit from it.
- `plausibleHelpers.ts:225` — `target?: Action | string | null`: all callers pass either an `Action` object or omit `target`. No caller ever passes a plain string.
- `plausibleHelpers.ts:231` (options interface) — `stepId: string` is always `input.stepId ?? ''` at every call site (RadioQuestion.tsx:158, Button.tsx:219, Button.tsx:271, VideoEvents.tsx:474, VideoEvents.tsx:754).
- Both `code-simplicity-reviewer` and `kieran-typescript-reviewer` independently flagged these as over-engineering.

## Proposed Solutions

### Option 1: Remove Generic + Narrow Target + Derive stepId (Recommended)

**Approach:** Remove `<TInput extends object>`, change `input` to `object`, narrow `target` to `Action | null`, derive `stepId` inside the function from `(input as { stepId?: string | null }).stepId ?? ''`.

```ts
interface FireCaptureEventOptions {
  u: string
  input: object
  blockId: string
  target?: Action | null
  templateTarget?: string | null
  journeyId?: string
}

export function fireCaptureEvent(plausible: ReturnType<typeof usePlausible<JourneyPlausibleEvents>>, eventLabel: BlockEventLabel | null | undefined, { u, input, blockId, target, templateTarget, journeyId }: FireCaptureEventOptions): void {
  const captureEvent = eventLabel != null ? BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT[eventLabel] : null
  if (captureEvent == null) return

  const stepId = (input as { stepId?: string | null }).stepId ?? ''
  plausible(captureEvent, {
    u,
    props: {
      ...input,
      blockId,
      key: keyify({ stepId, event: captureEvent, blockId, target, journeyId }),
      simpleKey: keyify({ stepId, event: captureEvent, blockId, journeyId }),
      templateKey: templateKeyify({ event: captureEvent, target: templateTarget, journeyId })
    } as Props
  })
}
```

**Pros:**

- Removes 3 lines from function + 1 line per call site (5 call sites = −8 total LOC)
- Dead `string` surface removed from interface
- Simpler generic-free signature

**Cons:**

- `stepId` derivation is a type assertion inside the helper — readers need to understand the convention that all event inputs have `stepId`
- Requires updating all 5 call sites to remove `stepId:` option

**Effort:** 30 min  
**Risk:** Low

---

### Option 2: Remove Generic Only, Leave stepId and target as-is

**Approach:** Only remove the `<TInput extends object>` generic and change `input` type to `object`. Leave `stepId` and `target` unchanged.

**Pros:** Minimal change, lower risk.
**Cons:** Still has dead `string` branch; `stepId` duplication remains.

**Effort:** 15 min  
**Risk:** Very Low

## Recommended Action

_To be filled during triage._

## Technical Details

**Affected files:**

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts:220–262` — function + interface
- `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx:153–162` — call site
- `libs/journeys/ui/src/components/Button/Button.tsx:214–224` — call site (click event)
- `libs/journeys/ui/src/components/Button/Button.tsx:267–277` — call site (chat event)
- `libs/journeys/ui/src/components/VideoEvents/VideoEvents.tsx:468–479` — call site (start)
- `libs/journeys/ui/src/components/VideoEvents/VideoEvents.tsx:748–756` — call site (complete)

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Ticket:** QA-359
- **Flagged by:** code-simplicity-reviewer + kieran-typescript-reviewer (independent)

## Acceptance Criteria

- [ ] `fireCaptureEvent` has no generic type parameter
- [ ] `target` in `FireCaptureEventOptions` is `Action | null` (no `string`)
- [ ] All existing tests pass with no changes to test assertions
- [ ] TypeScript compiles without errors

## Work Log

### 2026-04-24 — Initial Discovery

**By:** CE Review (code-simplicity-reviewer + kieran-typescript-reviewer)

**Actions:**

- Identified 3 overlapping simplification opportunities in `fireCaptureEvent`
- Confirmed no caller passes a string for `target`
- Confirmed all call sites compute `stepId: input.stepId ?? ''` identically

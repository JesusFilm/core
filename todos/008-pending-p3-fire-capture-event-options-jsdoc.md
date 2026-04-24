---
status: pending
priority: p3
issue_id: 'QA-359'
tags: [code-review, documentation, quality, analytics]
dependencies: []
---

# Add JSDoc to `FireCaptureEventOptions` for `target`/`templateTarget` Distinction

## Problem Statement

`FireCaptureEventOptions` has two similar-looking target fields — `target` and `templateTarget` — that serve distinct purposes:

- `target: Action | string | null` — the full action object (or resolved string) used in the `key` prop via `keyify`. Provides step-level segmentation (which link/chat target was involved).
- `templateTarget: string | null` — a pre-resolved string (e.g. from `actionToTarget(action)`) used in `templateKey` for template-level aggregate breakdown.

VideoEvents call sites omit both (no action involved). RadioQuestion and Button pass both with different values. Without documentation, future callers must read through `fireCaptureEvent`'s implementation to understand what each field affects.

## Findings

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts:220–228` — interface has no JSDoc on the two target fields.
- Flagged by `architecture-strategist` (P3) and `kieran-typescript-reviewer` (P3) independently.

## Proposed Solutions

### Option 1: Add JSDoc Comments to Interface Fields

**Approach:**

```ts
interface FireCaptureEventOptions {
  u: string
  /** Event input object — spread into Plausible props. Must not contain PII. */
  input: object
  blockId: string
  /**
   * The block's navigation action. Used to build the `key` prop via keyify.
   * Pass undefined/null if the event has no action (e.g. video events).
   * Note: the explicit `blockId` option overrides any `blockId` in `input`.
   */
  target?: Action | null
  /**
   * The pre-resolved string target for `templateKey` (e.g. from actionToTarget(action)).
   * Controls template-level aggregate breakdown segmentation.
   * Pass undefined/null for events with no action target.
   */
  templateTarget?: string | null
  journeyId?: string
}
```

**Pros:** Zero runtime impact; documents the contract inline; future caller sees the explanation in IDE hover.
**Cons:** None.

**Effort:** 10 min  
**Risk:** None

## Recommended Action

_To be filled during triage._

## Technical Details

**Affected files:**
- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts:220–228`

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Ticket:** QA-359
- **Flagged by:** architecture-strategist (P3) + kieran-typescript-reviewer (P3)

## Acceptance Criteria

- [ ] `FireCaptureEventOptions.target` has a JSDoc comment explaining its role
- [ ] `FireCaptureEventOptions.templateTarget` has a JSDoc comment explaining its role
- [ ] TypeScript compiles without errors

## Work Log

### 2026-04-24 — Initial Discovery

**By:** CE Review (architecture-strategist + kieran-typescript-reviewer)

**Actions:**
- Identified two undocumented fields that are easily confused
- Wrote proposed JSDoc content

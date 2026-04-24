---
status: pending
priority: p2
issue_id: '007'
tags: [code-review, typescript, type-safety, analytics, journeys-ui]
dependencies: []
---

# Remove dead generic `<TInput extends object>` from `fireCaptureEvent`

## Problem Statement

`fireCaptureEvent<TInput extends object>` declares a generic type parameter that provides zero runtime or compile-time benefit. Inside the function body, `{ ...input, blockId, key, simpleKey, templateKey }` is immediately cast to `as Props` — which has a `[K: string]: any` index signature. The `TInput` constraint is erased at that exact point. All 5 call sites pass their `input` objects without any generic annotation and TypeScript never infers a useful `TInput`. The generic adds visual noise and misleads readers into thinking type safety flows through the helper.

## Findings

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts` lines 220–261
- `FireCaptureEventOptions<TInput extends object>` interface — `<TInput>` parameter unused in any meaningful constraint
- `fireCaptureEvent<TInput extends object>` function signature — generic erased by `as Props` inside the body
- All 5 call sites: `Button.tsx` (×2), `RadioQuestion.tsx` (×1), `VideoEvents.tsx` (×2) — none pass explicit generic arguments
- Raised by both `kieran-typescript-reviewer` (P3) and `code-simplicity-reviewer` (P1)

## Proposed Solutions

### Option 1: Remove the generic, use `input: Record<string, unknown>`

**Approach:** Strip `<TInput extends object>` from both the interface and function. Change `input: TInput` to `input: Record<string, unknown>` (stricter than `any`).

**Pros:**
- Accurate: callers spread arbitrary GraphQL input objects, and `as Props` already permits any shape
- ~4 lines removed, no call site changes
- Honest about the type contract

**Cons:**
- Forces callers to assert if they want to extract typed fields from `input` post-call (but no caller does this)

**Effort:** Small | **Risk:** None — pure type change, no runtime effect

### Option 2: Remove the generic, keep `input: Record<string, any>` matching Props index signature

**Approach:** Match the pre-existing `[K: string]: any` index signature of `Props` to make the internal spread self-consistent without a cast. Keep `as Props` for the full props object.

**Pros:** Aligns with `Props` type; minimal diff
**Cons:** `any` is less strict
**Effort:** Small | **Risk:** None

### Option 3: Keep the generic but add a meaningful constraint (e.g., `{ id: string; blockId: string }`)

**Approach:** Instead of removing, constrain `TInput` to the subset of fields that `fireCaptureEvent` actually reads (none — it only spreads `input`).

**Pros:** Keeps generic flavor for documentation purposes
**Cons:** Still misleading since `as Props` erases the constraint at the spread site; over-engineered

**Effort:** Small | **Risk:** Low

## Recommended Action

Option 1 — remove the generic entirely. The function's type contract is "pass any analytics input object and let the `Props` index signature absorb it". That's what `Record<string, unknown>` communicates accurately.

## Technical Details

**Affected files:**
- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts`

**Change:**
```ts
// Before
interface FireCaptureEventOptions<TInput extends object> {
  u: string
  input: TInput
  ...
}
export function fireCaptureEvent<TInput extends object>(
  plausible: ReturnType<typeof usePlausible<JourneyPlausibleEvents>>,
  eventLabel: BlockEventLabel | null | undefined,
  { u, input, stepId, blockId, target, templateTarget, journeyId }: FireCaptureEventOptions<TInput>
): void { ... }

// After
interface FireCaptureEventOptions {
  u: string
  input: Record<string, unknown>
  ...
}
export function fireCaptureEvent(
  plausible: ReturnType<typeof usePlausible<JourneyPlausibleEvents>>,
  eventLabel: BlockEventLabel | null | undefined,
  { u, input, stepId, blockId, target, templateTarget, journeyId }: FireCaptureEventOptions
): void { ... }
```

## Acceptance Criteria

- [ ] `<TInput extends object>` removed from `fireCaptureEvent` function signature
- [ ] `<TInput extends object>` removed from `FireCaptureEventOptions` interface
- [ ] `input: TInput` changed to `input: Record<string, unknown>` or `input: Record<string, any>`
- [ ] All 5 call sites still compile without changes
- [ ] TypeScript type-check passes

## Work Log

- 2026-04-24: Identified by `code-simplicity-reviewer` (P1) and `kieran-typescript-reviewer` (P3) during ce-review of PR #9075. Generic declared but immediately erased by `as Props` cast inside function body.

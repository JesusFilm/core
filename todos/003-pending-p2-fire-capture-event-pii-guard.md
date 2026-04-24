---
status: pending
priority: p2
issue_id: 'QA-359'
tags: [code-review, security, privacy, analytics, typescript]
dependencies: []
---

# Document/Guard `fireCaptureEvent` Against PII Input Types

## Problem Statement

`fireCaptureEvent` accepts `input: TInput extends object` (or `object`) and spreads `...input` directly into Plausible event props. Plausible is a third-party analytics service — whatever lands in `props` is transmitted to Plausible's servers and stored as custom event properties visible in the Plausible dashboard.

Current callers pass safe input types (`ButtonClickEventCreateInput`, `RadioQuestionSubmissionEventCreateInput`, `VideoStartEventCreateInput`) with no PII. However, the function's interface has no type guard preventing a future caller from passing `SignUpSubmissionEventCreateInput` (which contains `name` and `email`) or other PII-bearing types.

The pre-existing `SignUp.tsx` component already spreads PII-containing input directly into `plausible()` (not via `fireCaptureEvent`). This PR does not worsen the existing pattern but introduces a reusable helper that centralises the spread — making it the highest-leverage place to add a guard.

## Findings

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts:247–262` — `...input` spread into Plausible `props` with no filtering or validation.
- `libs/journeys/ui/src/components/SignUp/SignUp.tsx:122–145` — pre-existing pattern spreading `SignUpSubmissionEventCreateInput` (including `name`/`email`) to Plausible directly (separate PR needed).
- Current callers pass these safe types: `ButtonClickEventCreateInput`, `ChatOpenEventCreateInput`, `RadioQuestionSubmissionEventCreateInput`, `VideoStartEventCreateInput`, `VideoCompleteEventCreateInput`.
- Flagged by `security-sentinel` (P2).

## Proposed Solutions

### Option 1: Add JSDoc Warning at the Interface Level (Low Effort)

**Approach:** Add a clear comment to `FireCaptureEventOptions` warning callers not to pass PII-containing types:

```ts
interface FireCaptureEventOptions {
  u: string
  /**
   * The event input object — its properties are spread directly into Plausible event props.
   * MUST NOT contain user-submitted PII (email, name, phone, etc.).
   * Safe types: ButtonClickEventCreateInput, RadioQuestionSubmissionEventCreateInput,
   *   VideoStartEventCreateInput, VideoCompleteEventCreateInput.
   */
  input: object
  // ...
}
```

**Pros:** Zero runtime cost; zero refactoring; immediately actionable.
**Cons:** Comment is advisory only — a future caller can ignore it.

**Effort:** 10 min  
**Risk:** None

---

### Option 2: Type-Level PII Exclusion (More Robust)

**Approach:** Define a `SafeAnalyticsInput` type that uses TypeScript's conditional types to exclude known PII fields:

```ts
type HasPII<T> = 'email' extends keyof T ? true : 'name' extends keyof T ? true : false
type SafeAnalyticsInput<T extends object> = HasPII<T> extends true ? never : T

interface FireCaptureEventOptions<TInput extends object> {
  input: SafeAnalyticsInput<TInput>
  // ...
}
```

**Pros:** Compile-time enforcement — passing a PII type produces a TypeScript error.
**Cons:**

- Re-introduces the generic (conflicts with todo #001 to remove the generic)
- Conditional types add complexity
- Does not prevent PII being added to currently-safe types in the future

**Effort:** 1 hour  
**Risk:** Low-Medium

---

### Option 3: Runtime PII Field Stripping

**Approach:** Define a list of known PII field names and strip them from `input` before spreading:

```ts
const PII_FIELDS = ['email', 'name', 'phone', 'address'] as const
const safeInput = Object.fromEntries(Object.entries(input as Record<string, unknown>).filter(([k]) => !PII_FIELDS.includes(k as never)))
```

**Pros:** Belt-and-suspenders defence even if a PII type is accidentally passed.
**Cons:** Runtime cost; the PII field list must be maintained manually.

**Effort:** 30 min  
**Risk:** Low

## Recommended Action

_To be filled during triage._ Option 1 is the minimum viable action for this PR. Option 2 or 3 can be follow-up items.

## Technical Details

**Affected files:**

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts:220–228` — interface definition

**Related pre-existing issue:**

- `libs/journeys/ui/src/components/SignUp/SignUp.tsx:122–145` — spreads PII directly to Plausible (separate fix needed)

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Ticket:** QA-359
- **Flagged by:** security-sentinel (P2)

## Acceptance Criteria

- [ ] `FireCaptureEventOptions.input` has a documented contract about PII
- [ ] At minimum, a JSDoc comment warns future callers against passing PII types
- [ ] Ideally, TypeScript prevents known PII types at compile time

## Work Log

### 2026-04-24 — Initial Discovery

**By:** CE Review (security-sentinel)

**Actions:**

- Identified `...input` spread as a PII transmission footgun
- Confirmed current callers are safe
- Flagged pre-existing `SignUp.tsx` pattern as separate issue

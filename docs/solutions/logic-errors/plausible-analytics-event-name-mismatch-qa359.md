---
title: "Plausible Analytics Capture Events Overcounting — Event Name Mismatch, Wrong URL Parameter, and Missing templateKey Target"
date: 2026-04-24
ticket: "QA-359"
pr: "#9075"
status: solved
severity: high
category: logic-errors
tags:
  - plausible
  - analytics
  - event-tracking
  - naming-mismatch
  - url-attribution
  - stale-closure
  - type-safety
  - react-hooks
  - journeys-ui
components:
  - plausibleHelpers.ts
  - RadioQuestion.tsx
  - Button.tsx
  - VideoEvents.tsx
  - plausibleHelpers.spec.ts
symptoms: "Decision for Christ capture stat showed all radio option clicks, not just the one tagged with the event label — inflated count visible in Plausible dashboard"
root_cause_types:
  - naming_mismatch
  - wrong_parameter
  - stale_closure
  - type_safety
  - duplicate_code
---

## Problem

The "Decision for Christ" stat in the Plausible Analytics template stats breakdown was counting ALL radio option clicks on a card, not just the one radio option tagged with the `decisionForChrist` event label. Lucinda reported this for the World Cup project — the stat showed values 5–10× higher than expected.

## Root Cause

Three compounding primary bugs, plus four secondary bugs found during code review:

### Primary Bugs

**Bug 1 — Event name mismatch:** Frontend code fired `plausible('decisionForChrist', ...)` using the raw `BlockEventLabel` enum string, but the registered Plausible goals used a different naming convention:

| `BlockEventLabel` value | Registered Plausible goal |
|---|---|
| `decisionForChrist` | `christDecisionCapture` |
| `gospelPresentationStart` | `gospelStartCapture` |
| `gospelPresentationComplete` | `gospelCompleteCapture` |
| `prayerRequest` | `prayerRequestCapture` |
| `rsvp` | `rsvpCapture` |
| `specialVideoStart` | `specialVideoStartCapture` |
| `specialVideoComplete` | `specialVideoCompleteCapture` |
| `custom1`, `custom2`, `custom3` | `custom1Capture`, `custom2Capture`, `custom3Capture` |
| `inviteFriend`, `share` | (no registered goal) |

Plausible silently discarded events that didn't match a registered goal name, meaning no captures were being recorded correctly under the intended goals.

**Bug 2 — Wrong URL parameter:** The `u:` parameter (page URL that Plausible uses to attribute events to steps) was constructed using `blockId` instead of `stepId`:

```ts
// Wrong
u: `${window.location.origin}/${journey.id}/${blockId}`

// Correct
u: `${window.location.origin}/${journey.id}/${stepId}`
```

Plausible uses this URL to match events to pages in its breakdown. Using `blockId` broke journey-map breakdown and step-level attribution.

**Bug 3 — Missing `target` in capture event `templateKey`:** Base events (e.g., `radioQuestionSubmit`) included a `target` field in their `templateKey` for journey-map segmentation. Capture events omitted it, causing inconsistent breakdown data across the template stats pipeline.

### Secondary Bugs (found during CE code review)

**Bug 4 — Stale closure in VideoEvents useEffect:** The `eventLabel` prop was captured in the START event `useEffect` closure without being listed in the dependency array; same for `endEventLabel` in the COMPLETE event hook. If the prop changed after initial mount, the listener wouldn't re-register with the new value.

**Bug 5 — Non-exhaustive TypeScript type:** `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` was typed as `Partial<Record<BlockEventLabel, ...>>`, allowing new `BlockEventLabel` enum values to be silently omitted from the mapping without a compile error.

**Bug 6 — Duplicated dispatch code:** The capture-event dispatch pattern (check label → look up mapped goal → fire plausible with key/simpleKey/templateKey) was copy-pasted 5 times across 3 files with pre-existing drift between them — `key` and `simpleKey` handling differed between VideoEvents and RadioQuestion/Button without documentation.

**Bug 7 — Chat capture templateTarget inconsistency:** The base `chatButtonClick` event used the literal `'chat'` for its `templateKey.target`, but the capture event used `actionToTarget(action)`. Both produced `'chat'` at runtime for valid chat buttons, but the inconsistency was a maintenance trap.

## Investigation Path

1. Lucinda reported inflated "Decision for Christ" stats for the World Cup project via QA-359
2. `ce-plan` analysis identified the event name mismatch as the primary cause — traced the registration mismatch between `BlockEventLabel` enum string values and actual Plausible goal names
3. `ce-work` implemented the `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` mapping and fixed the URL/templateKey bugs
4. `ce-review` surfaced 6 additional issues (P1: stale closures and non-exhaustive type; P2: duplicate pattern and chat inconsistency; P3: missing tests)
5. All 6 additional issues fixed in a follow-up commit — extracted `fireCaptureEvent` helper, fixed dep arrays, updated tests

## Solution

### Step 1: Create an Exhaustive Event Name Mapping

Add `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` to `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts`:

```ts
// Maps BlockEventLabel enum values to their registered Plausible capture goal names.
// Uses Record (not Partial) so TypeScript requires an explicit entry for every BlockEventLabel.
// Adding a new BlockEventLabel without updating this map is a compile error.
// Server-side counterpart: EVENT_TO_CAPTURE_MAP in
// apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/transformBreakdownResults.ts
// Both maps must stay in sync.
export const BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT: Record<
  BlockEventLabel,
  keyof JourneyPlausibleEvents | null
> = {
  [BlockEventLabel.decisionForChrist]: 'christDecisionCapture',
  [BlockEventLabel.gospelPresentationStart]: 'gospelStartCapture',
  [BlockEventLabel.gospelPresentationComplete]: 'gospelCompleteCapture',
  [BlockEventLabel.prayerRequest]: 'prayerRequestCapture',
  [BlockEventLabel.rsvp]: 'rsvpCapture',
  [BlockEventLabel.specialVideoStart]: 'specialVideoStartCapture',
  [BlockEventLabel.specialVideoComplete]: 'specialVideoCompleteCapture',
  [BlockEventLabel.custom1]: 'custom1Capture',
  [BlockEventLabel.custom2]: 'custom2Capture',
  [BlockEventLabel.custom3]: 'custom3Capture',
  // No Plausible capture goals are registered for these labels.
  [BlockEventLabel.inviteFriend]: null,
  [BlockEventLabel.share]: null
}
```

**Critical:** Use `Record<BlockEventLabel, ...>` (exhaustive), not `Partial<Record<...>>`. This forces TypeScript to error when a new `BlockEventLabel` value is added without a corresponding mapping entry.

### Step 2: Extract the `fireCaptureEvent` Helper

Replace the 5 duplicated dispatch blocks with a single shared helper:

```ts
interface FireCaptureEventOptions {
  u: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: Record<string, any>
  stepId: string
  blockId: string
  target?: Action | string | null
  templateTarget?: string | null
  journeyId?: string
}

export function fireCaptureEvent(
  plausible: ReturnType<typeof usePlausible<JourneyPlausibleEvents>>,
  eventLabel: BlockEventLabel | null | undefined,
  { u, input, stepId, blockId, target, templateTarget, journeyId }: FireCaptureEventOptions
): void {
  const captureEvent =
    eventLabel != null ? BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT[eventLabel] : null
  if (captureEvent == null) return

  plausible(captureEvent, {
    u,
    props: {
      ...input,
      key: keyify({ stepId, event: captureEvent, blockId, target, journeyId }),
      simpleKey: keyify({ stepId, event: captureEvent, blockId, journeyId }),
      templateKey: templateKeyify({ event: captureEvent, target: templateTarget, journeyId })
    }
  })
}
```

The `key` includes `target` (for journey-map breakdown); `simpleKey` omits it (for aggregate stats). Callers pass `templateTarget` explicitly to control journey-template breakdown segmentation.

### Step 3: Replace Duplicated Blocks at Call Sites

Before (broken — wrong event name, wrong blockId URL, duplicated):

```ts
const captureEvent =
  radioOptionBlock.eventLabel != null
    ? BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT[radioOptionBlock.eventLabel]
    : null
if (captureEvent != null) {
  plausible(captureEvent, {
    u: `${window.location.origin}/${journey.id}/${blockId}`, // ❌ blockId
    props: { ...input, key: ..., simpleKey: ..., templateKey: ... }
  })
}
```

After (correct):

```ts
// RadioQuestion
fireCaptureEvent(plausible, radioOptionBlock.eventLabel, {
  u: `${window.location.origin}/${journey.id}/${input.stepId}`, // ✓ stepId
  input: input as Record<string, any>,
  stepId: input.stepId ?? '',
  blockId: radioOptionBlock.id,
  target: radioOptionBlock.action,
  templateTarget: actionToTarget(radioOptionBlock.action),
  journeyId: journey?.id
})

// Button — click event
fireCaptureEvent(plausible, eventLabel, {
  u: `${window.location.origin}/${journey.id}/${input.stepId}`,
  input: input as Record<string, any>,
  stepId: input.stepId ?? '',
  blockId: input.blockId,
  target: action,
  templateTarget: actionToTarget(action),
  journeyId: journey?.id
})

// Button — chat event (templateTarget is always 'chat')
fireCaptureEvent(plausible, eventLabel, {
  u: `${window.location.origin}/${journey.id}/${input.stepId}`,
  input: input as Record<string, any>,
  stepId: input.stepId ?? '',
  blockId: input.blockId,
  target: action,
  templateTarget: 'chat', // literal, matches base chatButtonClick event
  journeyId: journey?.id
})

// VideoEvents (no target — video capture events don't have an action target)
fireCaptureEvent(plausible, eventLabel, {
  u: `${window.location.origin}/${journey.id}/${input.stepId}`,
  input: input as Record<string, any>,
  stepId: input.stepId ?? '',
  blockId: input.blockId,
  journeyId: journey?.id
})
```

### Step 4: Fix Stale Closures in VideoEvents

Add missing props to `useEffect` dependency arrays:

```ts
// START event — add eventLabel
}, [player, blockId, calledStart, videoStartEventCreate, start,
    videoTitle, videoId, stepId, source, journey, plausible, eventLabel])

// COMPLETE event — add endEventLabel
}, [player, end, calledComplete, videoCompleteEventCreate, blockId,
    videoTitle, videoId, stepId, source, journey, plausible, action, endEventLabel])
```

### Step 5: Add Unit Tests for All Mappings

In `plausibleHelpers.spec.ts`, add tests for every `BlockEventLabel` entry:

```ts
describe('BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT', () => {
  it('maps decisionForChrist to christDecisionCapture', () => {
    expect(BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT[BlockEventLabel.decisionForChrist])
      .toBe('christDecisionCapture')
  })
  // ... one test per enum value
  it('returns null for inviteFriend (no registered Plausible goal)', () => {
    expect(BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT[BlockEventLabel.inviteFriend]).toBeNull()
  })
  it('returns null for share (no registered Plausible goal)', () => {
    expect(BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT[BlockEventLabel.share]).toBeNull()
  })
})
```

## Key Design Decisions

**Exhaustive `Record` vs `Partial<Record>`:** The exhaustive type means TypeScript errors at compile time if a new `BlockEventLabel` is added without updating the mapping. A `Partial<Record>` would silently return `undefined`, causing the wrong goal name (or no event) to fire — exactly the class of bug this PR is fixing.

**`fireCaptureEvent` helper:** Centralizes the lookup, null-guard, and prop construction in one place. The 5 pre-existing copies had already drifted — VideoEvents used the same value for `key` and `simpleKey` (no target distinction) while RadioQuestion and Button differed. One helper enforces one pattern.

**`'chat'` literal vs `actionToTarget(action)` for chat capture `templateTarget`:** The base `chatButtonClick` event already uses the literal `'chat'`. `createChatEvent` is only called for chat interactions, so `actionToTarget` would always return `'chat'` anyway. The literal makes the intent explicit and prevents future drift if `actionToTarget` behavior changes.

## Dual-Map Synchronization

`BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` (frontend, `libs/journeys/ui`) has a server-side counterpart: `EVENT_TO_CAPTURE_MAP` in `apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/transformBreakdownResults.ts`.

The server-side map handles historical Plausible events recorded before this fix, which used raw `BlockEventLabel` string values (e.g., `'decisionForChrist'`) as the event name. Both maps cover the same 10 labels (excluding `inviteFriend` and `share` which have no registered goals).

**When adding a new `BlockEventLabel`:**
1. Add the entry to `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` — TypeScript compile error enforces this
2. Add the entry to `EVENT_TO_CAPTURE_MAP` on the server — no enforcement; manual process
3. Register the new goal in the Plausible dashboard
4. Update tests in both packages

Mismatches between the two maps cause historical events to aggregate under a different name than new events, corrupting template stats breakdown.

## Prevention Strategies

### Event Name Mismatches

- **Use exhaustive `Record<BlockEventLabel, ...>` always** — never `Partial<Record>` for enum-to-goal mappings
- **Name Plausible goals before writing code** — capture the goal name in the ticket/PR so there's no ambiguity
- **Unit test every mapping entry** — one assertion per enum value catching any future rename

### Wrong URL Parameters

- Always use `stepId` (page-level step identifier) not `blockId` (internal component ID) in the `u:` parameter
- Add inline comments where the URL is constructed: `// stepId for page attribution, NOT blockId`
- Unit test: assert `u` contains `stepId` explicitly

### Stale Closures in useEffect

- Enable `react/exhaustive-deps` ESLint rule as an error (not warning) in CI
- Code review: every `useEffect` that closes over a prop must list that prop in its dependency array
- Test pattern: render with one set of props, re-render with different props, assert the effect uses the new values

### Dual-Map Sync (BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT ↔ EVENT_TO_CAPTURE_MAP)

- Any PR touching one map must update the other — enforce in PR checklist
- Both files contain cross-reference comments pointing to the other
- Consider generating the server-side map from the client-side constant during build to make sync automatic

### Code Review Checklist for Analytics Events

- [ ] Capture event uses the registered Plausible goal name, not the raw enum string
- [ ] `u:` parameter uses `stepId`, not `blockId`
- [ ] `templateKey` includes `target` for journey-map breakdown
- [ ] `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` is `Record<BlockEventLabel, ...>` (exhaustive)
- [ ] If adding a new label, both frontend and server maps are updated
- [ ] If using `useEffect`, all referenced props are in the dependency array
- [ ] `fireCaptureEvent` helper is used instead of duplicating the dispatch pattern
- [ ] Unit test covers the new mapping entry and verifies payload structure

## Related

- Server-side counterpart: `EVENT_TO_CAPTURE_MAP` in `apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/transformBreakdownResults.ts`
- Plausible goals registration: `apis/api-journeys-modern/src/workers/plausible/service.ts` (goals array)
- PR: [#9075](https://github.com/JesusFilm/core/pull/9075)

---
title: "fix: Decision for Christ stats counting all radio option selections"
type: fix
status: active
date: 2026-04-24
---

# fix: Decision for Christ Stats Overcounting (QA-359)

## Overview

Template roll-up stats show the "Decision for Christ" capture event counting for ALL radio option clicks (Yes, No, Already), rather than only counting when the specific radio option tagged with `decisionForChrist` eventLabel is selected. This affects the `TemplateBreakdownAnalyticsDialog` shown to template owners.

## Investigation Findings

### 1. How RadioQuestion fires Plausible events

`libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx:103-188`

The `handleClick(radioOptionBlockId, radioOptionLabel)` handler:
1. Fires `radioQuestionSubmissionEventCreate` mutation for ALL option clicks
2. Finds the specific clicked option: `children.find(child => child.id === radioOptionBlockId)`
3. Fires `plausible('radioQuestionSubmit', {...})` for ALL options
4. **Only if** `radioOptionBlock.eventLabel != null`: fires `plausible(radioOptionBlock.eventLabel, {...})`

**The code is correct** — the capture event only fires for the specific option with the label set.

### 2. Where eventLabel is stored

- **On `RadioOptionBlock` (individual options)**, NOT `RadioQuestionBlock` (parent)
- `RadioQuestionFields` has no `eventLabel` field
- `RADIO_OPTION_FIELDS` fragment includes `eventLabel` and is composed into `BLOCK_FIELDS`
- Data IS fetched correctly when rendering journeys

### 3. The naming mismatch (confirmed)

| Layer | Event name used |
|---|---|
| `BlockEventLabel` enum | `decisionForChrist`, `gospelPresentationStart`, ... |
| `JourneyPlausibleEvents` type / registered Plausible goals | `christDecisionCapture`, `gospelStartCapture`, ... |
| `EVENT_TO_CAPTURE_MAP` in `transformBreakdownResults.ts` | Maps `decisionForChrist` → `christDecisionCapture` |

**The mapping exists and is correct** (added in `bd75f00bc`). However, there is no TypeScript enforcement preventing the wrong event name from being passed — `plausible(radioOptionBlock.eventLabel)` passes a `BlockEventLabel` string directly, and the `JourneyPlausibleEvents` interface uses the `*Capture` variant names. Only the `[K: string]: any` index signature on the base `Events` interface prevents a compile error.

### 4. Confirmed bugs found in the code

**Bug A — Wrong URL in capture event (`u` parameter)**

`RadioQuestion.tsx:154`:
```ts
// Capture event (decisionForChrist):
u: `${window.location.origin}/${journey.id}/${input.blockId}` // blockId = RadioQuestion block ID!

// radioQuestionSubmit event:
u: `${window.location.origin}/${journey.id}/${input.stepId}` // stepId = Step block ID ✅
```

`input.blockId` is the **RadioQuestion block's ID**, not the step/card ID. Plausible uses this URL for page-level attribution. This means capture events appear on a "page" that doesn't correspond to any real journey step URL, potentially preventing Plausible from correctly linking them to the journey.

**Bug B — templateKey missing `target` for capture events**

`RadioQuestion.tsx:168-173`:
```ts
// Capture event templateKey (no target):
templateKeyify({ event: radioOptionBlock.eventLabel, journeyId: journey?.id })

// radioQuestionSubmit templateKey (has target):
templateKeyify({ event: 'radioQuestionSubmit', target: actionToTarget(radioOptionBlock.action), journeyId: journey?.id })
```

The `target` is omitted from the capture event's `templateKey`. This is inconsistent and may cause `transformBreakdownResults` to miss chat/link aggregation for capture events.

**Bug C — Type unsafety: `BlockEventLabel` values fired as Plausible events but not declared in `JourneyPlausibleEvents`**

The `JourneyPlausibleEvents` interface includes `christDecisionCapture` but NOT `decisionForChrist`. There's no compile-time guarantee that the event fired (`decisionForChrist`) matches the declared interface key. The `EVENT_TO_CAPTURE_MAP` in `transformBreakdownResults.ts` is a runtime workaround for this mismatch, but it's easy to miss when adding new event labels.

### 5. Template site event flow

`apps/journeys/src/components/JourneyPageWrapper/JourneyPageWrapper.tsx:40-47`

`PlausibleProvider` sends ALL events to three domains simultaneously:
- Journey site: `api-journeys-journey-${journeyId}`
- Team site: `api-journeys-team-${teamId}`
- Template site: `api-journeys-template-${fromTemplateId}`

All capture events ARE being sent to the template site. The Plausible goals registered on the template site (via `apis/api-journeys-modern/src/workers/plausible/service.ts:91-126`) include `christDecisionCapture`, but NOT `decisionForChrist`. This means:
- Plausible **goal conversion** tracking won't fire for `decisionForChrist` events
- However, the **breakdown API** by `event:props:templateKey` returns all custom events regardless of goals

### 6. Stats pipeline

```
Journey user clicks "Yes" (decisionForChrist option)
  → plausible('radioQuestionSubmit', { templateKey: {"event":"radioQuestionSubmit","target":"","journeyId":"xxx"} })
  → plausible('decisionForChrist',   { templateKey: {"event":"decisionForChrist","target":"","journeyId":"xxx"} })
  
Template site receives both events

templateFamilyStatsBreakdown query:
  → GET /api/v1/stats/breakdown?property=event:props:templateKey (NO event name filter)
  → Returns all events by unique templateKey value
  
transformBreakdownResults:
  → Parses each templateKey JSON
  → Maps 'decisionForChrist' → 'christDecisionCapture' via EVENT_TO_CAPTURE_MAP
  → Groups by journeyId
  
Frontend filters stats to only show: [christDecisionCapture, gospelStartCapture, ...]
```

### 7. Root cause hypothesis

**Most likely**: Bug A (wrong URL using `blockId` instead of `stepId`) may be causing Plausible to track `decisionForChrist` events on a non-existent page URL, and the Plausible API might be either silently dropping these events OR some Plausible API quirk causes the visitors count to be aggregated differently.

**Alternative**: The QA may have observed the `radioQuestionSubmit` count (which counts ALL radio option clicks) being misidentified as "Decision for Christ" due to a display or filtering issue that existed before `bd75f00bc` was merged. In that pre-fix state, `christDecisionCapture` always showed 0, but `radioQuestionSubmit` showed the total.

**Requires runtime verification**: Check the actual Plausible API response for a known template to see what `templateKey` values are present and whether `decisionForChrist` events appear with the expected counts.

## Proposed Solution

### Phase 1: Fix the confirmed code bugs

**1. Fix Bug A — Correct the URL for capture events in `RadioQuestion.tsx`**

Change `input.blockId` → `input.stepId` in the capture event's `u` parameter:
```ts
// libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx
plausible(radioOptionBlock.eventLabel, {
  u: `${window.location.origin}/${journey.id}/${input.stepId}`, // was: input.blockId
  ...
})
```

Check all other components that fire capture events (`Button.tsx`, `Card.tsx`, `VideoEvents.tsx`) for the same URL issue.

**2. Fix Bug B — Add `target` to capture event templateKey**

```ts
templateKey: templateKeyify({
  event: radioOptionBlock.eventLabel,
  target: actionToTarget(radioOptionBlock.action), // add this
  journeyId: journey?.id
})
```

**3. Fix Bug C — Add type-safe mapping for BlockEventLabel → JourneyPlausibleEvents**

Create a mapping function in `plausibleHelpers.ts`:
```ts
// libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts
export const BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT: Partial<Record<BlockEventLabel, keyof JourneyPlausibleEvents>> = {
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
}
```

Use this in `RadioQuestion.tsx`:
```ts
// Replace:
if (radioOptionBlock.eventLabel != null) {
  plausible(radioOptionBlock.eventLabel, { ... })
}

// With:
const captureEvent = radioOptionBlock.eventLabel != null
  ? BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT[radioOptionBlock.eventLabel]
  : null
if (captureEvent != null) {
  plausible(captureEvent, {
    u: `${window.location.origin}/${journey.id}/${input.stepId}`,
    props: {
      ...input,
      key: keyify({ ..., event: captureEvent, ... }),
      simpleKey: keyify({ ..., event: captureEvent, ... }),
      templateKey: templateKeyify({ event: captureEvent, target: ..., journeyId: ... })
    }
  })
}
```

This fires `christDecisionCapture` directly instead of `decisionForChrist`, making:
- The fired event name match the registered Plausible goal ✅
- The templateKey's `event` field use the correct name ✅
- The `EVENT_TO_CAPTURE_MAP` in `transformBreakdownResults.ts` potentially unnecessary for NEW data (keep for backward compatibility with old data)

Apply the same pattern to `Button.tsx`, `Card.tsx`, and `VideoEvents.tsx`.

### Phase 2: Apply same fixes to all other event label components

Check these files for the same URL and type-safety issues:
- `libs/journeys/ui/src/components/Button/Button.tsx`
- `libs/journeys/ui/src/components/Card/Card.tsx`
- `libs/journeys/ui/src/components/VideoEvents/VideoEvents.tsx`

### Phase 3: Verify Plausible goal registration

Update registered goals in `apis/api-journeys-modern/src/workers/plausible/service.ts` to confirm the goal names match the event names being fired. After Phase 1's fix, `christDecisionCapture` events would be fired directly, matching the existing goals — this should already be correct.

## Acceptance Criteria

- [ ] `plausible('christDecisionCapture')` fires only when the radio option with `decisionForChrist` eventLabel is clicked (verify in Plausible dashboard or test environment)
- [ ] `plausible('christDecisionCapture')` does NOT fire when other options (No, Already) are clicked
- [ ] The capture event uses `stepId` in its URL (not `blockId`)
- [ ] The `templateKey` for capture events includes `target`
- [ ] `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` mapping is defined in `plausibleHelpers.ts` and covers all `BlockEventLabel` values
- [ ] TypeScript correctly types the capture event name (no implicit `any` workaround)
- [ ] `transformBreakdownResults.ts` `EVENT_TO_CAPTURE_MAP` is kept for backward compatibility with historical `decisionForChrist` events
- [ ] Updated unit tests for `RadioQuestion.spec.tsx` verify the correct plausible event name is fired (`christDecisionCapture`) and not the raw enum value (`decisionForChrist`)
- [ ] Same fix applied to `Button.tsx`, `Card.tsx`, and `VideoEvents.tsx`

## Technical Considerations

- **Backward compatibility**: Old Plausible data (fired as `decisionForChrist`) will still be mapped correctly via `EVENT_TO_CAPTURE_MAP`. New data (fired as `christDecisionCapture`) will not need mapping. Both will appear under `christDecisionCapture` in the stats.
- **No DB migration needed**: This is purely a frontend event tracking fix.
- **Plausible site goal re-registration NOT needed**: Existing `christDecisionCapture` goals already match the corrected event names.

## System-Wide Impact

- **Interaction graph**: `RadioQuestion.handleClick` → `plausible()` → Plausible API → `transformBreakdownResults` → `TemplateBreakdownAnalyticsDialog`
- **Other capture event components**: `Button.tsx`, `Card.tsx`, `VideoEvents.tsx` all have the same pattern and may have the same bugs; each needs inspection
- **Historical data**: `EVENT_TO_CAPTURE_MAP` must remain to correctly map older `decisionForChrist` events stored in Plausible

## Files to Change

- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts` — add `BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT` mapping
- `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx` — use mapping + fix URL + add target to templateKey
- `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.spec.tsx` — update test expectations for event name
- `libs/journeys/ui/src/components/Button/Button.tsx` — same pattern, needs investigation + fix
- `libs/journeys/ui/src/components/Card/Card.tsx` — same pattern, needs investigation + fix
- `libs/journeys/ui/src/components/VideoEvents/VideoEvents.tsx` — same pattern, needs investigation + fix

## Sources & References

- `RadioQuestion.tsx:103-188` — event firing logic
- `RadioOption.tsx:39-44` — onClick handler
- `plausibleHelpers.ts:55-91` — JourneyPlausibleEvents types, templateKeyify
- `transformBreakdownResults.ts:16-34` — EVENT_TO_CAPTURE_MAP
- `service.ts:91-126` — Plausible goals registration
- `JourneyPageWrapper.tsx:40-57` — multi-domain Plausible config
- `TemplateBreakdownAnalyticsDialog.tsx:72-96` — query config
- `blockFields.ts:57-59` — RadioOptionBlock uses RadioOptionFields (includes eventLabel)
- Commit `e3d2eab17` — added capture event firing to RadioQuestion (Jan 7 2026)
- Commit `bd75f00bc` — added EVENT_TO_CAPTURE_MAP to transformBreakdownResults

---
status: pending
priority: p2
issue_id: '005'
tags: [code-review, analytics, plausible, journeys-ui, quality]
dependencies: []
---

# chatButtonClick base event and its capture event use different templateKey targets

## Problem Statement

In `Button.tsx` `createChatEvent`, the base `chatButtonClick` Plausible event fires `templateKey` with a hardcoded `target: 'chat'`. The new capture event (added by this PR) fires `templateKey` with `target: actionToTarget(action)`. For valid chat actions (`ChatAction`, `PhoneAction`, and messenger-platform `LinkAction`), `actionToTarget` returns `'chat'` — so both agree in practice. However, the inconsistency creates a maintenance trap: if `actionToTarget` is modified or if a new action type is introduced that returns something other than `'chat'` for a chat button, the two events would diverge silently.

## Findings

- `libs/journeys/ui/src/components/Button/Button.tsx` around line 284:
  ```ts
  // primary chatButtonClick event:
  templateKey: templateKeyify({ event: 'chatButtonClick', target: 'chat', journeyId: journey.id })
  ```
- Same file around line 312:
  ```ts
  // capture event:
  templateKey: templateKeyify({ event: chatCaptureEvent, target: actionToTarget(action), journeyId: journey?.id })
  ```
- `actionToTarget` for any action that triggers `createChatEvent` (which requires a `messagePlatforms` URL or `ChatAction`) will return `'chat'` — so today these produce the same `templateKey.target` value
- The test for this scenario expects `actionToTarget(action)` in the spec, which correctly evaluates to `'chat'` for the test's m.me LinkAction

## Proposed Solutions

### Option 1: Use `actionToTarget(action)` for both the base and capture events

**Approach:** Change the hardcoded `target: 'chat'` in the primary `chatButtonClick` templateKey to `target: actionToTarget(action)` for consistency.

**Pros:**
- Both events derive `target` the same way
- Eliminates the inconsistency

**Cons:**
- `actionToTarget` can return `null` for non-chat actions, but `createChatEvent` is only called for chat buttons so this is safe
- Minor change to existing base event behaviour (though the value at runtime is identical)

**Effort:** 5 minutes

**Risk:** Low

---

### Option 2: Use the literal `'chat'` in both

**Approach:** Change the capture event to use `target: 'chat'` matching the base event, since `createChatEvent` by definition only fires for chat interactions.

**Pros:**
- Makes the intent explicit — this is always a chat event

**Cons:**
- Bypasses `actionToTarget` which is the canonical way to derive target strings

**Effort:** 5 minutes

**Risk:** Low

## Recommended Action

Option 2 (literal `'chat'`) is marginally clearer given that `createChatEvent` only fires for chat actions by definition. The base event already uses the literal and it's the authoritative value for this event type.

## Technical Details

**Affected files:**
- `libs/journeys/ui/src/components/Button/Button.tsx` — `createChatEvent` capture event `templateKey`
- `libs/journeys/ui/src/components/Button/Button.spec.tsx` — test expectation for `templateKey` in chat capture event

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Found by:** kieran-typescript-reviewer, architecture-strategist (code review agents)

## Acceptance Criteria

- [ ] `chatButtonClick` base event and its capture event use the same method to derive `templateKey.target`
- [ ] Button.spec.tsx test expectation is updated to match
- [ ] All Button tests pass

## Work Log

### 2026-04-24 - Identified during code review

**By:** CE review agents

**Actions:**
- Compared templateKey construction in chatButtonClick and its capture shadow in createChatEvent
- Verified that actionToTarget(action) returns 'chat' for all valid chat button actions

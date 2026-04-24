---
status: complete
priority: p2
issue_id: '004'
tags: [code-review, analytics, refactor, journeys-ui, architecture, quality]
dependencies: []
---

# Capture event firing pattern duplicated 5 times across 3 components

## Problem Statement

The PR introduces a capture-event dispatch block that is nearly identical across five call sites in three files. The pattern is copy-pasted with minor variations, creating a maintenance risk: any future change to how capture events are fired (e.g., adding a new prop, changing the URL scheme, adding error handling) must be applied in five places. Past copy-paste drift is already visible — `key`/`simpleKey` handling differs between VideoEvents and RadioQuestion/Button without documentation explaining why.

## Findings

The following block (with variable name substitutions) appears 5 times:

```ts
// RadioQuestion.tsx:153–182
// Button.tsx createClickEvent:215–244
// Button.tsx createChatEvent:289–317
// VideoEvents.tsx START:470–493
// VideoEvents.tsx COMPLETE:766–789

const captureEvent = label != null ? BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT[label] : null
if (captureEvent != null) {
  plausible(captureEvent, {
    u: `${window.location.origin}/${journey.id}/${input.stepId}`,
    props: {
      ...input,
      key: keyify({ stepId, event: captureEvent, blockId, target, journeyId }),
      simpleKey: keyify({ stepId, event: captureEvent, blockId, journeyId }),
      templateKey: templateKeyify({ event: captureEvent, target, journeyId })
    }
  })
}
```

Inconsistencies already present across sites:
- VideoEvents (`startCaptureKey` / `completeCaptureKey`) reuses the same value for both `key` and `simpleKey` (no `target` distinction)
- RadioQuestion and Button compute `key` with target and `simpleKey` without — different from VideoEvents pattern
- Button `createChatEvent` templateKey uses `actionToTarget(action)` while the primary `chatButtonClick` event uses the literal `'chat'`

Estimated ~60 LOC that could be reduced to 5 call sites of ~3 lines each with a shared helper.

## Proposed Solutions

### Option 1: Extract `fireCaptureEvent` helper into `plausibleHelpers.ts`

**Approach:**

```ts
// In plausibleHelpers.ts
export function fireCaptureEvent(
  plausible: ReturnType<typeof usePlausible<JourneyPlausibleEvents>>,
  eventLabel: BlockEventLabel | null | undefined,
  {
    journey,
    input,
    stepId,
    blockId,
    target,
  }: {
    journey: { id: string }
    input: Record<string, unknown>
    stepId: string | undefined
    blockId: string
    target: Action | string | null
  }
): void {
  const captureEvent = eventLabel != null ? BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT[eventLabel] : null
  if (captureEvent == null) return

  plausible(captureEvent, {
    u: `${window.location.origin}/${journey.id}/${stepId ?? ''}`,
    props: {
      ...input,
      key: keyify({ stepId: stepId ?? '', event: captureEvent, blockId, target, journeyId: journey.id }),
      simpleKey: keyify({ stepId: stepId ?? '', event: captureEvent, blockId, journeyId: journey.id }),
      templateKey: templateKeyify({ event: captureEvent, target: typeof target === 'string' ? target : actionToTarget(target as Action), journeyId: journey.id })
    }
  })
}
```

**Pros:**
- Single place to update for all capture events
- Eliminates copy-paste drift
- Makes inconsistencies visible and forces a deliberate decision

**Cons:**
- Adds abstraction; requires agreeing on the unified signature
- May need different `target` handling for VideoEvents (no action) vs RadioQuestion/Button (has action)
- Medium effort — needs careful review of each call site to confirm the unified signature covers all cases

**Effort:** 3–4 hours

**Risk:** Low (behaviour-preserving refactor with existing tests)

---

### Option 2: Leave as-is, add comments at each call site linking to the others

**Approach:** Add a `// See also: Button.tsx:215, VideoEvents.tsx:470` comment at each site to make the connection visible.

**Pros:**
- Zero behaviour risk
- Minimal effort

**Cons:**
- Doesn't eliminate drift risk
- Comments rot

**Effort:** 15 minutes

**Risk:** Low

## Recommended Action

Option 1 as a follow-up PR (not this PR — the fix is already shipped and correct; the extraction is a maintenance improvement). Option 2 as a quick win in this PR.

## Technical Details

**Affected files:**
- `libs/journeys/ui/src/libs/plausibleHelpers/plausibleHelpers.ts` — new helper
- `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx`
- `libs/journeys/ui/src/components/Button/Button.tsx`
- `libs/journeys/ui/src/components/VideoEvents/VideoEvents.tsx`

## Resources

- **PR:** [#9075](https://github.com/JesusFilm/core/pull/9075)
- **Found by:** code-simplicity-reviewer, architecture-strategist (code review agents)

## Acceptance Criteria

- [ ] Capture event dispatch is consolidated into a shared helper (or sites have cross-reference comments)
- [ ] The inconsistency between VideoEvents and RadioQuestion/Button `key`/`simpleKey` patterns is documented or resolved
- [ ] All component tests pass after refactor

## Work Log

### 2026-04-24 - Identified during code review

**By:** code-simplicity-reviewer, architecture-strategist agents

**Actions:**
- Counted 5 near-identical dispatch blocks across 3 files
- Identified pre-existing drift between VideoEvents and Button/RadioQuestion key patterns

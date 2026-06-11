---
title: 'fix: Analytics overlay referrer nodes not rendering'
type: fix
status: completed
date: 2026-03-18
linear: NES-781
deepened: 2026-03-18
---

# fix: Analytics overlay referrer nodes not rendering

## Outcome

**PR:** [#8879](https://github.com/JesusFilm/core/pull/8879)
**Actual root cause:** ReactFlow's `onNodesChange` handler from the step `useNodesState` received changes for ALL nodes (including referrer nodes). `applyNodeChanges` returns a new array even when no changes match, causing an infinite re-render loop (1000s+ renders/min).
**Actual fix:** A combined `onNodesChange` handler that routes changes to the correct `useNodesState` handler (step vs referrer) based on node ID. Single-file change to `JourneyFlow.tsx`.
**What wasn't needed:** The React Compiler, Apollo `onCompleted`, `hideReferrers` mutation, and `JSON.stringify` hypotheses explored below were all investigated and ruled out during implementation. The plan's analysis below is preserved as-is for historical context.
**Authoritative reference:** [`docs/solutions/runtime-errors/reactflow-multiple-usenodesstate-infinite-rerender.md`](../solutions/runtime-errors/reactflow-multiple-usenodesstate-infinite-rerender.md)

---

## Enhancement Summary

**Deepened on:** 2026-03-18
**Research agents used:** architecture-strategist, julik-frontend-races-reviewer, kieran-typescript-reviewer, performance-oracle, code-simplicity-reviewer, pattern-recognition-specialist, framework-docs-researcher, best-practices-researcher, git-history-analyzer, security-sentinel

### Key Discoveries

1. **The actual trigger was the React Compiler** (`219159faf`, Aug 27, 2025) — enabled `reactCompiler: true` in `journeys-admin/next.config.js` just 2 weeks before the bug was reported (Sep 10, 2025). The compiler auto-memoizes closures/objects, which broke the `onCompleted` callback pattern used by `useJourneyAnalyticsQuery`
2. **A latent issue from Aug 2024** (`36894d4af`) removed `JSON.stringify` from a `useEffect` dependency — this was dormant because `analytics?.referrers` was a stable reference, but became problematic under the React Compiler's changed memoization behavior
3. **`visit:referrer` returns valid data** — confirmed via browser DevTools (returns `"Direct / None"` with visitors). No query property change needed
4. **Apollo `onCompleted` is officially deprecated** in Apollo Client 3.13 (which this project upgraded to on Apr 4, 2025) and removed in 4.0 — the `useMemo` refactor is the recommended replacement
5. **ReactFlow officially requires immutable node updates** — the `hideReferrers` mutation is a confirmed anti-pattern per ReactFlow docs

### Revised Root Cause Priority

1. **PRIMARY**: React Compiler memoization breaks the `onCompleted` callback pattern — the compiler memoizes the `options` object and `onCompleted` closure passed to `useJourneyAnalyticsQuery`, causing Apollo to see stale callbacks or skip `onCompleted` calls entirely. This means analytics data never reaches EditorProvider, so referrer nodes never render.
2. **SECONDARY**: `hideReferrers` direct mutation prevents ReactFlow from detecting visibility changes on toggle off→on (confirmed anti-pattern per ReactFlow docs)
3. **LATENT**: The `JSON.stringify` removal (`36894d4af`, Aug 2024) made the `useEffect` dependency unreliable for deep comparison, but this was dormant while `analytics?.referrers` was a stable reference from the reducer. Under the React Compiler, changed memoization timing may cause this to trigger. **This also explains the "flashing" symptom** — if the effect fires on every render during drag, it resets referrer nodes each frame.
4. ~~**DATA LAYER**: `visit:referrer` may return sparser data than `visit:source`~~ — **CONFIRMED WORKING** (API returns "Direct / None" with visitors)

### Timeline

| Date             | Event                                    | Impact                                                           |
| ---------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| Jun 2024         | `f178afffc` — feat: plausible            | Original analytics feature with `visit:referrer`                 |
| Jun 2024         | `474b42be5` — feat: referrer nodes       | Working referrer nodes with `JSON.stringify` dependency          |
| Aug 2024         | `36894d4af` — revert: eslint             | Removed `JSON.stringify` — latent issue, nodes still work        |
| Apr 2025         | `83a2b1954` — Apollo Client v3.13.6      | `onCompleted` deprecated but still functional                    |
| Apr 2025         | NES-310 created                          | Nodes rendering, "Other sources" accordion not opening           |
| **Aug 27, 2025** | **`219159faf` — React Compiler enabled** | **Compiler memoizes `onCompleted` callback, breaking data flow** |
| Sep 10, 2025     | NES-781 reported                         | Nodes no longer rendering                                        |

---

## Overview

When the analytics overlay is toggled on in the journey editor, referrer nodes (traffic source indicators like "Direct / None", "Google", etc.) are not rendering on the ReactFlow canvas. The data is confirmed to exist — the reports page (embedded Plausible dashboard) shows traffic sources including "Direct / None". This means the issue is in the data pipeline between the GraphQL query and the ReactFlow rendering, not in Plausible itself.

**Linear ticket:** [NES-781](https://linear.app/jesus-film-project/issue/NES-781/analytics-overlay-toggle-on-doesnt-show-the-source-links-anymore)
**Parent ticket:** [NES-310](https://linear.app/jesus-film-project/issue/NES-310/expand-other-sources-item-in-the-interface-in-analytics-overlay) — Expand "Other sources" item in analytics overlay

## Problem Statement

The analytics overlay feature has three layers that must all work correctly for referrer nodes to render:

1. **Data layer**: GraphQL query → Plausible v1 API → response parsing
2. **State layer**: Apollo `onCompleted` → `transformJourneyAnalytics` → EditorProvider dispatch
3. **Render layer**: `useEffect` hooks in JourneyFlow → ReactFlow nodes/edges

### The Breaking Change

The breakage was caused by two changes compounding:

**1. Latent issue — `36894d4af` (Aug 4, 2024, "revert: eslint"):**
Removed `JSON.stringify` from the referrer `useEffect` dependency:

```typescript
// ORIGINAL (working)
}, [JSON.stringify(analytics?.referrers)])
// CHANGED TO
}, [analytics?.referrers, setReferrerEdges, setReferrerNodes])
```

This was dormant because `analytics?.referrers` is stored in the EditorProvider reducer and maintains a stable reference between renders — the effect correctly fires only when new data is dispatched.

**2. Trigger — `219159faf` (Aug 27, 2025, "feat: add react compiler"):**
Enabled `reactCompiler: true` in `journeys-admin/next.config.js`. The React Compiler auto-memoizes components, closures, and objects. This critically affects:

- The `onCompleted` callback in `AnalyticsOverlaySwitch` — the compiler may memoize the arrow function, causing Apollo to see a stale closure that never dispatches to EditorProvider
- The `options` object passed to `useJourneyAnalyticsQuery` — memoization may prevent Apollo from detecting that `onCompleted` should fire
- Effect dependency timing — the compiler may change when re-renders happen, affecting effect scheduling

**Evidence**: Nodes were confirmed rendering in **April 2025** (NES-310 was about "Other sources" not expanding, not about missing nodes). The React Compiler was enabled **August 27, 2025**. The bug was reported **September 10, 2025** — exactly 2 weeks later.

A previous attempt to fix NES-781 (branch `jianweichong/nes-781-analytics-overlay-toggle-on-doesnt-show-the-source-links`, Sep 2025) addressed symptoms (infinite loops, filtering referrer node changes) but was never merged because it didn't identify the root cause.

### Additional Symptom: Referrer Nodes Flash During Drag

When the referrer nodes do manage to render (observed on the NES-781 branch), they "flash" (rapidly disappear and reappear) whenever another node is dragged on the canvas. This is caused by the same root cause: the unstable `analytics?.referrers` dependency fires the `useEffect` on every re-render. During drag, ReactFlow updates node positions via `onNodesChange` at ~60fps, each triggering a re-render that re-fires the effect, resetting referrer nodes each frame. The `JSON.stringify` fix stabilizes the dependency so the effect only fires when the actual data changes, not on every render.

### Root Cause Analysis (revised with research findings)

#### Root Cause 1 (PRIMARY): React Compiler breaks `onCompleted` callback pattern

The React Compiler auto-memoizes the `onCompleted` callback and `options` object in `AnalyticsOverlaySwitch.tsx:60-82`. When the compiler memoizes these, Apollo Client may receive a stale `onCompleted` or skip calling it entirely. Since `useJourneyAnalyticsQuery` depends on `onCompleted` + `useState` to propagate transformed data, the dispatch to `SetAnalyticsAction` never fires, and `analytics` in the EditorProvider stays `undefined`. The referrer `useEffect` in JourneyFlow sees `analytics?.referrers == null` and does nothing.

#### Root Cause 2 (REQUIRED FIX): Direct mutation in `hideReferrers`

In `JourneyFlow.tsx:555-561`:

```typescript
const hideReferrers =
  <T extends Node | Edge>(hidden: boolean) =>
  (nodeOrEdge: T) => {
    nodeOrEdge.hidden = hidden // MUTATES the object directly
    return nodeOrEdge
  }
```

**ReactFlow officially requires immutable node updates.** From the [ReactFlow update-node example](https://reactflow.dev/examples/nodes/update-node): _"It's important that you create a new node object in order to notify React Flow about the change."_ The `.map()` creates a new array, but every element is the same object reference — ReactFlow's internal diffing sees identical references and skips re-rendering.

**This causes a specific failure on toggle off→on:** When the user toggles analytics OFF, `hideReferrers` mutates nodes to `hidden = true`. When toggled back ON, `.map()` with `hideReferrers(false)` mutates the same objects to `hidden = false` but returns the same references. ReactFlow does not detect the change, and nodes stay hidden.

#### Root Cause 3 (CONTRIBUTING): Apollo `onCompleted` unreliability

The `useJourneyAnalyticsQuery` hook stores transformed data via `onCompleted` + `useState`. Apollo Client 3.x `onCompleted` has documented issues:

- **Cache-first reads skip `onCompleted`** — if variables revert to previously-cached values, data comes from cache without calling `onCompleted` ([react-apollo#2177](https://github.com/apollographql/react-apollo/issues/2177))
- **Stale closure** — `onCompleted` captures the callback from a previous render ([apollo-client#12316](https://github.com/apollographql/apollo-client/issues/12316))
- **Officially deprecated** in Apollo Client 3.13 with removal in 4.0 ([apollo-client#12352](https://github.com/apollographql/apollo-client/issues/12352))

#### Root Cause 4 (VERIFY): `visit:referrer` vs `visit:source` data differences

The query uses `property: "visit:referrer"` which was always the intended property (since commit `f178afffc`, Jun 2024). However, `visit:referrer` returns raw referrer URLs while `visit:source` returns categorized labels. For journeys with mostly direct/UTM traffic:

- `visit:source` reliably returns `"Direct / None"`, `"newsletter"` etc.
- `visit:referrer` may return empty results for UTM-tagged traffic without a `Referer` header (common in email clients, Android apps)

### Race Condition Analysis (from frontend races review)

The two separate `useEffect` hooks have an ordering dependency:

1. Toggle ON → `showAnalytics = true`
2. **Effect 2 runs** (visibility): maps over `referrerNodes` setting `hidden = false` — but nodes are **empty**
3. Query fires and completes
4. **Effect 1 runs** (data): sets new referrer nodes — but they have no `hidden` property set
5. **Effect 2 does NOT re-run** — `showAnalytics` hasn't changed

On first toggle, nodes appear because `hidden: undefined` defaults to visible in ReactFlow. But on toggle off→on, the mutation poison from Root Cause 2 means nodes stay hidden permanently.

## Proposed Solution

### Phase 1: Verify the data layer — CONFIRMED

The GraphQL response for `journeyReferrer` returns populated data:

```json
journeyReferrer: [
  { __typename: "PlausibleStatsResponse", property: "Direct / None", visitors: 1 }
]
```

**Conclusion**: The data layer is working correctly. `visit:referrer` returns data. The bug is entirely in the render layer (Phases 3 and 4). **Phase 2 is skipped.**

### ~~Phase 2: Fix the query property~~ — SKIPPED

Not needed. The API returns correct data with `visit:referrer`.

### Phase 3: Replace referrer state + effects with `useMemo` (REQUIRED)

**File:** `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/JourneyFlow.tsx`

**Remove** all of the following:

- `const [referrerNodes, setReferrerNodes] = useNodesState([])` (line 118)
- `const [referrerEdges, setReferrerEdges] = useEdgesState([])` (line 119)
- The `hideReferrers` function (lines 555-561)
- Both referrer `useEffect` hooks (lines 563-575)

**Replace with** `useMemo`-derived values:

```typescript
const referrerNodes = useMemo(() => {
  if (analytics?.referrers == null || showAnalytics !== true) return []
  return analytics.referrers.nodes
}, [analytics?.referrers, showAnalytics])

const referrerEdges = useMemo(() => {
  if (analytics?.referrers == null || showAnalytics !== true) return []
  return analytics.referrers.edges
}, [analytics?.referrers, showAnalytics])
```

This fixes **all render-layer issues** in one change:

1. **No stale callbacks or effects** — `useMemo` derives data synchronously from state
2. **No mutation** — `hideReferrers` is eliminated entirely (no need to set `hidden` property)
3. **No race condition** — data and visibility are resolved in a single computation
4. **No flashing during drag** — `useMemo` only recomputes when `analytics?.referrers` or `showAnalytics` changes, NOT on every render/drag event
5. **Removes 4 hooks and 1 function** — simpler, fewer moving parts

The `nodes` and `edges` props on ReactFlow remain:

```typescript
nodes={[...referrerNodes, ...nodes]}
edges={[...referrerEdges, ...edges]}
```

**Note**: Since referrer nodes are no longer in `useNodesState`, they won't receive `onNodesChange` events. This is correct — referrer nodes are `draggable: false` and should not be interactive.

### Phase 4: Harden `useJourneyAnalyticsQuery` with `useMemo` (recommended improvement)

**File:** `libs/journeys/ui/src/libs/useJourneyAnalyticsQuery/useJourneyAnalyticsQuery.ts`

Replace `onCompleted`-based transformation with `useMemo`-derived data:

```typescript
export function useJourneyAnalyticsQuery(options?: Omit<QueryHookOptions<NoInfer<GetJourneyAnalytics>, NoInfer<GetJourneyAnalyticsVariables>>, 'onCompleted'> & { onCompleted?: (data: JourneyAnalytics | undefined) => void }): Omit<QueryResult<GetJourneyAnalytics, GetJourneyAnalyticsVariables>, 'data'> & { data: JourneyAnalytics | undefined } {
  const { onCompleted: externalOnCompleted, ...queryOptions } = options ?? {}

  const query = useQuery<GetJourneyAnalytics, GetJourneyAnalyticsVariables>(GET_JOURNEY_ANALYTICS, queryOptions)

  const data = useMemo(() => {
    if (query.data == null) return undefined
    return transformJourneyAnalytics(queryOptions?.variables?.id, query.data)
  }, [query.data, queryOptions?.variables?.id])

  // Use ref to stabilize callback — avoids stale closure and exhaustive-deps issues
  const onCompletedRef = useRef(externalOnCompleted)
  onCompletedRef.current = externalOnCompleted

  useEffect(() => {
    if (data != null) {
      onCompletedRef.current?.(data)
    }
  }, [data])

  return { ...query, data }
}
```

#### Research Insights

**Framework docs researcher** confirmed: Apollo Client has **officially deprecated `onCompleted`** in v3.13 with removal planned for v4.0. The Apollo team's rationale: _"These lifecycle hooks have long been the cause of confusion, bugs and frustration. Many cases where `onCompleted` is used involve some kind of state syncing which is a highly discouraged pattern."_ The `useMemo` approach is the officially recommended replacement.

**TypeScript reviewer** flagged two issues in the original proposal:

1. **Missing type annotations on `options`** — the full generic type signature must be preserved (shown above)
2. **`onCompleted` in `useEffect` dependency array** — use a `useRef` to stabilize the callback and avoid both lint violations and infinite loops (shown above)
3. **Destructure `onCompleted` out** rather than passing `onCompleted: undefined` to Apollo — makes intent explicit

**Performance oracle** confirmed: `useMemo` re-computation cost is negligible. `transformJourneyAnalytics` processes small datasets (journey steps in single digits, referrers capped at 3 nodes). Apollo returns the same `query.data` reference for cache hits, so `useMemo` correctly skips re-computation.

## Technical Considerations

- **`JSON.stringify` in dependency array**: This restores the original working pattern from the feature's initial implementation. While not ideal for large objects, `analytics.referrers` contains at most 3 nodes and 3 edges — the serialization cost is negligible.
- **Plausible API compatibility**: `visit:source` and `visit:referrer` return structurally identical responses (both have `property` and `visitors` fields). The backend `service.ts` property key extraction handles both correctly.
- **Performance**: Spread operator creates 3 new node objects + 3 new edge objects per toggle. ReactFlow's internal diffing detects changed `hidden` property via new object references. Total allocation ~300 bytes per toggle. No measurable impact.
- **Test impact**: `transformReferrers` tests use mock data with source-style labels ("Direct / None", "Facebook"). The `JSON.stringify` dependency change is internal to JourneyFlow and doesn't affect transform tests.
- **Apollo cache behavior**: Consider adding `fetchPolicy: 'cache-and-network'` to the analytics query so toggling off→on with the same date range shows cached data immediately then updates. This is a product decision, not required for the bug fix.

## System-Wide Impact

- **API surface parity**: If Phase 2 is applied, the reports page and editor overlay will both show `visit:source` data, ensuring consistency.
- **Error propagation**: No changes to error handling. The `onError` snackbar in `AnalyticsOverlaySwitch` continues to work.
- **State lifecycle**: The `useMemo` refactor ensures data is derived synchronously from query state. The consolidated effect ensures visibility is always applied atomically with data.
- **Pattern consistency**: The `useMemo` approach introduces a new pattern to this codebase (which predominantly uses `onCompleted`), but aligns with Apollo's official migration path. The consolidated effect matches the existing pattern for step nodes in the same file.

## Security Notes

Security review found **no vulnerabilities** in the proposed changes. Two pre-existing medium-severity findings were noted for separate remediation:

1. The `filters` parameter on `PlausibleStatsBreakdownFilter` is a freeform string passed through to the Plausible API without validation (mitigated by auth + journey-scoped site IDs)
2. Plausible API error messages are forwarded verbatim to clients (information disclosure risk)

These are pre-existing and out of scope for this bug fix.

## Acceptance Criteria

- [ ] When analytics overlay is toggled on and traffic data exists, referrer nodes render on the canvas
- [ ] "Direct / None" source appears as a referrer node when direct traffic exists
- [ ] Multiple referrer sources render correctly (1, 2, 3, and 4+ sources)
- [ ] Referrer nodes connect via edges to the SocialPreview node
- [ ] Nodes properly hide when toggling analytics overlay off
- [ ] Nodes properly show when toggling analytics overlay back on (the toggle off→on case)
- [ ] Date range filtering updates referrer nodes with new data
- [ ] Rapid toggle on/off/on doesn't leave referrer nodes in a broken state
- [ ] Switching date range to previously-viewed range still shows referrer data (Apollo cache scenario)
- [ ] Templates do not show the analytics overlay
- [ ] Referrer nodes do NOT flash/flicker when dragging other nodes on the canvas
- [ ] Existing analytics overlay features (step stats, visitor counts) continue to work

### How to reproduce the failures (for testing)

1. **The main bug**: Toggle analytics ON for a journey with known traffic → referrer nodes should appear but don't
2. **The mutation race**: Toggle ON (nodes appear) → Toggle OFF → Toggle ON again → nodes stay hidden
3. **The Apollo cache race**: Toggle ON, wait for data → Toggle OFF → Toggle ON with same date range → verify nodes reappear
4. **The rapid toggle**: Toggle ON-OFF-ON within 500ms → verify no ghost nodes or broken state
5. **The flashing bug**: Toggle ON (nodes appear) → drag a step node around the canvas → referrer nodes should remain stable, no flickering

## Dependencies & Risks

- **Risk**: If `visit:source` also returns empty (Phase 2 scenario), the issue is in the Plausible instance configuration — would need to verify site setup
- **Risk**: The `JSON.stringify` dependency creates a new string on every render for comparison. For 3 nodes + 3 edges this is negligible, but if referrer counts ever grew significantly, consider a custom deep comparison hook
- **Dependency**: Feature flag `editorAnalytics` must be enabled for testing

## Implementation Order

1. ~~**Diagnose** (Phase 1)~~ — DONE. API returns populated data.
2. ~~**Fix query property** (Phase 2)~~ — SKIPPED. `visit:referrer` works correctly.
3. **Verify React Compiler is the trigger**: Temporarily disable `reactCompiler: true` in `journeys-admin/next.config.js`, confirm referrer nodes render, then re-enable.
4. **Replace `onCompleted` with `useMemo` in `useJourneyAnalyticsQuery`** (Phase 4): The primary fix. Remove the `onCompleted` + `useState` pattern, derive data via `useMemo` from `query.data`. Remove `onCompleted` from the hook's public API.
5. **Move dispatch to `AnalyticsOverlaySwitch`**: Add a `useEffect` that watches the returned `data` from the hook and dispatches `SetAnalyticsAction` to EditorProvider.
6. **Replace referrer `useEffect` hooks with `useMemo`** (Phase 3): Derive `referrerNodes`/`referrerEdges` from `analytics.referrers` + `showAnalytics` via `useMemo`. This eliminates both `useEffect` hooks, the `hideReferrers` function, and the `useNodesState`/`useEdgesState` for referrers. Fixes both missing nodes AND flashing during drag.

### Approach Summary

All answers confirmed:

- **Verify first, then fix** — disable React Compiler temporarily to confirm, then apply fixes
- **Dispatch in AnalyticsOverlaySwitch** — explicit `useEffect` watching hook data, dispatching to EditorProvider
- **useMemo for referrer nodes** — eliminates effects, hideReferrers, and state hooks entirely
- **Flashing is a must-fix** — both symptoms (missing nodes + flashing) solved by the same approach

## Key Files

| File                                                                                                             | Line(s) | Purpose                                        |
| ---------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------- |
| `libs/journeys/ui/src/libs/useJourneyAnalyticsQuery/useJourneyAnalyticsQuery.ts`                                 | 55-69   | GraphQL query with `visit:referrer` property   |
| `libs/journeys/ui/src/libs/useJourneyAnalyticsQuery/useJourneyAnalyticsQuery.ts`                                 | 145-173 | Hook with `onCompleted` + `useState` pattern   |
| `libs/journeys/ui/src/libs/useJourneyAnalyticsQuery/transformReferrers/transformReferrers.ts`                    | 34-98   | Referrer data → ReactFlow nodes/edges          |
| `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/JourneyFlow.tsx`                                   | 555-575 | `hideReferrers` + two racing `useEffect` hooks |
| `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/AnalyticsOverlaySwitch/AnalyticsOverlaySwitch.tsx` | 60-82   | Query trigger + dispatch                       |
| `apis/api-journeys-modern/src/schema/plausible/service.ts`                                                       | 32-80   | Backend Plausible API call                     |

## Sources

### Git History

- **Trigger commit**: `219159faf` (Aug 27, 2025) — "feat: add react compiler" #7526 — enabled `reactCompiler: true` for journeys-admin, breaking `onCompleted` callback pattern
- **Latent issue**: `36894d4af` (Aug 4, 2024) — "revert: eslint" #3184 — removed `JSON.stringify` from useEffect dependency
- **Apollo Client update**: `83a2b1954` (Apr 4, 2025) — updated to v3.13.6 which deprecated `onCompleted`
- **Original feature**: `474b42be5` (Jun 26, 2024) — "feat: referrer nodes" #2944 — original working implementation
- **Original query**: `f178afffc` (Jun 24, 2024) — "feat: plausible" #2814 — introduced `visit:referrer` property
- **Plausible migration**: `a3ccfb60d` (Dec 17, 2025) — "chore: plausible to modern" #8421
- **Previous fix attempt**: branch `jianweichong/nes-781-analytics-overlay-toggle-on-doesnt-show-the-source-links` (Sep 2025, never merged)

### Linear

- [NES-781](https://linear.app/jesus-film-project/issue/NES-781/analytics-overlay-toggle-on-doesnt-show-the-source-links-anymore) — this ticket
- [NES-310](https://linear.app/jesus-film-project/issue/NES-310/expand-other-sources-item-in-the-interface-in-analytics-overlay) — parent ticket

### External References

- [Apollo Client: Deprecation of onCompleted/onError — Issue #12352](https://github.com/apollographql/apollo-client/issues/12352)
- [Apollo Client: onCompleted not fired from cache — Issue #2177](https://github.com/apollographql/react-apollo/issues/2177)
- [ReactFlow: Update Node Example (immutability requirement)](https://reactflow.dev/examples/nodes/update-node)
- [ReactFlow: Hidden Nodes Example](https://reactflow.dev/examples/nodes/hidden)
- [Plausible: Stats API v1 reference (visit:source vs visit:referrer)](https://plausible.io/docs/stats-api-v1)
- [Plausible: "No Referrer" behavior — Issue #187](https://github.com/plausible/analytics/issues/187)

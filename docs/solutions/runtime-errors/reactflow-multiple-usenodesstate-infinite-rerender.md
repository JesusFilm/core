---
title: 'Infinite re-render loop when using multiple useNodesState hooks in ReactFlow v11'
category: runtime-errors
date: 2026-03-19
tags:
  - reactflow
  - infinite-re-render
  - onNodesChange
  - useNodesState
  - applyNodeChanges
  - react-compiler
  - analytics-overlay
  - controlled-mode
module: JourneyFlow
symptom: >
  Referrer nodes render as blank/tiny rectangles despite data being present.
  Render count climbs to 1000s+ per minute. Analytics overlay stats display
  correctly but referrer node components fail to paint.
root_cause: >
  ReactFlow's onNodesChange fires for ALL nodes in the nodes prop, but only
  one useNodesState handler was connected. applyNodeChanges always returns a
  new array reference even when no changes match, triggering an infinite
  re-render loop via unnecessary state updates.
---

# Infinite Re-render Loop: Multiple `useNodesState` Hooks in ReactFlow v11

## Problem

In the journey editor's analytics overlay, referrer nodes (traffic source indicators like "Direct / None") were caught in an infinite re-render loop — 1000s+ renders per minute — causing them to appear as blank rectangles in the DOM despite the data being present and correct.

**Linear ticket:** NES-781
**Module:** `JourneyFlow.tsx`

## Root Cause

The `JourneyFlow` component used two separate `useNodesState` hooks — one for step nodes and one for referrer nodes — but combined them into a single `nodes` prop for ReactFlow. Only the step nodes' `onNodesChange` handler was passed to ReactFlow.

```typescript
// THE BUG: Two useNodesState hooks, one onNodesChange handler
const [nodes, setNodes, onNodesChange] = useNodesState([])   // step nodes
const [referrerNodes, setReferrerNodes] = useNodesState([])   // referrer nodes

<ReactFlow
  nodes={[...referrerNodes, ...nodes]}    // combined
  onNodesChange={onNodesChange}           // only handles step nodes!
/>
```

**The infinite loop cycle:**

1. ReactFlow renders all nodes (step + referrer)
2. ReactFlow measures referrer node dimensions → calls `onNodesChange` with `NodeDimensionChange` for ID `"Direct / None"`
3. The step handler's `applyNodeChanges(changes, stepNodes)` runs — no step node matches the referrer ID
4. **`applyNodeChanges` always returns a new array reference** (it copies internally), even when nothing matched
5. `setNodes` receives the new array → React detects state change → re-render
6. Re-render creates new `[...referrerNodes, ...nodes]` → ReactFlow processes it → measures again → back to step 2

## Investigation Steps

1. **Confirmed data layer works** — GraphQL returns referrer data, analytics card shows visitor stats correctly
2. **Confirmed node is in DOM** — DevTools inspector showed `react-flow__node-Referrer` at 126x25.2 (which is 180x36 at the 0.7 zoom level — correct natural size)
3. **Added diagnostic logs** to ReferrerNode, JourneyFlow, AnalyticsOverlaySwitch, and useJourneyAnalyticsQuery
4. **Logs confirmed infinite loop** — ReferrerNode render count reached 1980+ rapidly, with useMemo recomputing every cycle
5. **Previous fix attempt (PR #7649)** filtered out referrer changes entirely — stopped the loop but caused **flashing** because ReactFlow couldn't track referrer node dimensions

## Solution

Create a combined `onNodesChange` handler that **routes** changes to the correct `useNodesState` handler based on node ID:

```typescript
const [nodes, setNodes, onStepNodesChange] = useNodesState([])
const [referrerNodes, setReferrerNodes, onReferrerNodesChange] = useNodesState([])

// Track referrer IDs in a ref to avoid recreating the callback
const referrerNodeIdsRef = useRef(new Set<string>())
useEffect(() => {
  referrerNodeIdsRef.current = new Set(referrerNodes.map((n) => n.id))
}, [referrerNodes])

const onNodesChange = useCallback<NonNullable<ReactFlowProps['onNodesChange']>>(
  (changes) => {
    const stepChanges = changes.filter((c) => !('id' in c && referrerNodeIdsRef.current.has(c.id)))
    const refChanges = changes.filter((c) => 'id' in c && referrerNodeIdsRef.current.has(c.id))
    if (stepChanges.length > 0) onStepNodesChange(stepChanges)
    if (refChanges.length > 0) onReferrerNodesChange(refChanges)
  },
  [onStepNodesChange, onReferrerNodesChange]
)
```

### Why Routing (Not Dropping) Is Essential

| Approach                              | Infinite loop? | Flashing? | Why                                                                      |
| ------------------------------------- | -------------- | --------- | ------------------------------------------------------------------------ |
| Pass only step handler (original bug) | Yes            | N/A       | `applyNodeChanges` returns new array for unmatched changes               |
| Drop referrer changes (PR #7649)      | No             | Yes       | ReactFlow can't track referrer dimensions, re-measures endlessly         |
| Route to correct handler (this fix)   | No             | No        | Each handler processes its own nodes — changes match, dimensions tracked |

## Prevention

### Best Practices

1. **When combining multiple `useNodesState` hooks into one `nodes` prop, ALWAYS create a combined `onNodesChange` handler** that routes changes by node ID
2. **Guard with `length > 0`** before calling a handler — even an empty `applyNodeChanges([])` call returns a new array
3. **Use a ref for the ID set** to avoid adding the node array to `useCallback` dependencies

### Anti-Patterns to Avoid

1. **Never pass one `useNodesState`'s handler when `nodes` contains nodes from multiple sources** — unmatched changes cause `applyNodeChanges` to return new arrays, triggering infinite re-renders
2. **Don't drop unmatched changes** — this stops the loop but causes flashing because ReactFlow can't track dimensions
3. **ReactFlow controlled mode rule:** `onNodesChange` must handle changes for EVERY node in `nodes`

### Testing

Add render-count assertions for custom ReactFlow nodes to catch infinite re-render regressions:

```typescript
it('should not infinite-loop when rendering mixed node types', () => {
  const renderCount = { current: 0 }
  function TrackedNode(props: NodeProps) {
    renderCount.current += 1
    return <ReferrerNode {...props} />
  }
  render(<FlowWrapper nodeTypes={{ Referrer: TrackedNode }} />)
  waitFor(() => {
    expect(renderCount.current).toBeLessThan(20)
  })
})
```

## Related

- **Linear:** [NES-781](https://linear.app/jesus-film-project/issue/NES-781), [NES-310](https://linear.app/jesus-film-project/issue/NES-310) (parent)
- **Plan:** `docs/plans/2026-03-18-001-fix-analytics-overlay-referrer-nodes-not-rendering-plan.md`
- **Previous attempt:** PR #7649 (filtered changes — caused flashing, never merged)
- **Key commits:** `219159faf` (React Compiler enabled), `36894d4af` (JSON.stringify removed from effect dep)

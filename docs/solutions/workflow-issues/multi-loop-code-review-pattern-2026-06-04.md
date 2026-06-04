---
title: Multi-loop code-review-and-fix pattern for large PRs
date: 2026-06-04
category: workflow-issues
module: code-review-workflow
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - Preparing a large or visually-heavy PR for push (multi-file restyle, refactor, or feature branch with 10+ changed files)
  - Single-pass code review keeps surfacing new issues after fixes land
  - Fixes from one review pass are themselves likely to introduce regressions (SSR, a11y, perf hints, hook extractions)
symptoms:
  - Single broad review pass misses regressions introduced by its own fixes
  - Reviewer fatigue on long diffs causes shallow coverage of later files
  - Hydration, a11y, and perf regressions slip through because no pass is dedicated to the delta
related_components:
  - testing_framework
  - tooling
tags:
  - code-review
  - iterative-review
  - pr-workflow
  - parallel-agents
  - regression-prevention
  - ce-code-review
  - fan-out-verify
---

# Multi-loop code-review-and-fix pattern for large PRs

## Context

This pattern emerged on **NES-1694** — a public-gallery restyle PR (JesusFilm/core #9250) that had grown to ~1,000 lines across ~20 files and gone through several QA rounds, two pending reviewers (one with inline a11y nits, one with structural tab-order concerns), plus an earlier round of admin-preview rework. By the time the final polish window opened, three things were true:

- The code had been touched enough that reviewer attention had glazed — fresh eyes were not available, and the existing reviewers were anchored on the threads they had already opened.
- The diff was past the point where any single read-through could reliably catch correctness, a11y, perf, reuse, and SSR concerns in one pass.
- Pending review comments had non-obvious interactions with the in-flight changes (e.g. a "aria-controls should be unconditional" nit conflicted with a Loop-1 change that had dropped `keepMounted` on the drawer).

The author needed a way to **keep raising the floor on the diff without burning days on manual re-reading**, and without regressing pending reviewer feedback. The multi-loop fan-out below was the response.

## Guidance

### The loop

Each loop is:

1. **Fan out N finder agents in parallel** via the Agent tool. Each gets one angle and an explicit recall-bias instruction.
2. **Each finder returns up to 6 candidates**: `{ file, line, summary, failure_scenario }`. Finders do **not** self-filter — that's the orchestrator's job.
3. **Orchestrator dedupes** near-duplicates across angles (same file+line, or two summaries pointing at the same root cause).
4. **(Optional) verify each candidate** with a 1-vote verifier prompt (`PLAUSIBLE` / `NOT PLAUSIBLE` / `NEEDS MORE CONTEXT`). Default to PLAUSIBLE if the verifier is uncertain — false negatives cost more than false positives at this stage.
5. **Apply confirmed fixes** to the working tree.
6. **Run tests, re-typecheck, re-lint.** Update assertions that the fix legitimately invalidated; do not silence assertions that still encode the desired behaviour.
7. **Repeat with a narrower scope.** Loop N+1 reads Loop N's diff first and tightens onto the _deltas_.

### Angle taxonomy

Loop 1 (broad) typically uses ~7 angles:

- **line-by-line** — read every changed line in order; flag anything that looks off.
- **removed-behavior** — for each `-` line, ask "what depended on this?".
- **cross-file** — for each public export changed, find every call site and check the contract still holds.
- **reuse** — duplicated literals, sx fragments, helpers that already exist elsewhere.
- **simplification** — overly clever conditionals, double-derived state, dead branches.
- **efficiency** — layout thrash, unnecessary re-renders, missing memoisation, GPU-promotion hints.
- **altitude** — step back: does the diff still match the PR's stated intent? Anything missing for the user-visible behaviour?

Subsequent loops shrink — Loop 2 might run only 3 angles (cross-file on Loop 1's deltas, removed-behavior on Loop 1's deletions, and a focused correctness pass). Loop 3 might be 1 angle.

### Finder-agent prompt shape

```text
You are the <ANGLE> finder for an iterative code review of <BRANCH>.

Diff scope: <git range or paths>
Angle: <one-paragraph definition — e.g. "Removed-behavior: for every
deleted line, identify the contract that line previously upheld and
whether any caller still relies on it.">

Return up to 6 candidates as JSON:
[
  { "file": "...", "line": 123, "summary": "...",
    "failure_scenario": "Concrete bad state a user/test would hit." }
]

Rules:
- Recall-biased: include anything that *might* be a problem. The
  orchestrator dedupes and verifies. Do not self-filter for confidence.
- One candidate per distinct root cause. If two findings are the same
  bug at two call sites, file one with both locations.
- Do NOT propose stylistic preferences (naming, comment wording) unless
  they actively mislead.
- Do NOT read tests as authority — tests can encode the bug.
```

### The recall-bias rule

Finders are **explicitly told not to self-filter**. The orchestrator (with the full diff in context and visibility across all angles) is the right level for the keep/drop call. A finder that decides "this is probably fine, I won't surface it" creates a silent miss; a finder that surfaces 6 candidates of which 2 survive dedupe and verification is doing its job.

### Narrower-scope-per-loop rule

Loop N+1 must **read Loop N's diff first** and bias its angles toward:

1. Cross-checking Loop N's fixes for regressions or incomplete fixes.
2. Things Loop N's broad angles might have skimmed over because they were drowned in the wider scope.

### Stop condition

Stop when a loop returns **mostly PLAUSIBLE-but-low-priority cleanups** — sx-fragment dedupe candidates that touch one site, comment rewordings, naming preferences. **Three loops on a ~1000-line diff is a reasonable cap**; beyond that, the marginal find is almost always stylistic, and the risk of a fix-introducing-a-regression starts to dominate.

## Why This Matters

The non-obvious value of this pattern is **catching regressions that the previous loop's own fix introduced**. Concrete cascade from this PR:

**Loop 1's ScrollReveal fix.** A finder flagged `useState<boolean>(() => disabled || reduceMotion)` as an SSR hydration risk — `reduceMotion` is `false` on the server but `true` on a reduce-motion client. Fix: drop `reduceMotion` from the initial state so it's just `useState(disabled)`. Effect ran the post-mount sync. Tests passed.

**Loop 2 caught that the fix was incomplete.** A focused correctness finder, reading Loop 1's diff, noticed that the `transition`, `transitionDelay`, and `willChange` sx props _still_ read `reduceMotion` directly:

```tsx
transition: reduceMotion || disabled ? 'none' : theme.transitions.create(...)
willChange: reduceMotion || disabled ? 'auto' : 'opacity, transform'
```

So the SSR-rendered HTML still had `transition: theme...` and `willChange: opacity, transform`, while a reduce-motion client immediately rendered `transition: none` and `willChange: auto`. The hydration mismatch was unchanged — just relocated from one prop to three.

The Loop 2 fix had to push the source-of-truth all the way back into the **hook**, not the component:

```ts
// usePrefersReducedMotion.ts — Loop 2 fix
export function usePrefersReducedMotion(): boolean {
  // Always `false` on first render — server and reduce-motion client agree.
  const [reduce, setReduce] = useState<boolean>(false)
  useEffect(() => {
    // ...subscribe to matchMedia, then sync the real value post-mount.
    setReduce(mq.matches)
    // ...
  }, [])
  return reduce
}
```

Without Loop 2, the PR would have shipped with a "fix" that moved the warning around without removing it — and a passing test suite, because jsdom has no reduce-motion media query.

**Loop 3 caught a similar incompleteness in Loop 1's CoverCta perf fix.** Loop 1 added a ref-gated `setVisible` to skip React dispatch when scroll position didn't change visibility. Loop 3 noticed that the ref-bail still ran **after** a layout-forcing `document.documentElement.scrollHeight` read — the perf intent (avoid work on every scroll frame) was defeated by the very first line of the handler. Real fix: drop the `scrollHeight` read entirely; `scrollY < 100` on a non-scrolling page is true (scrollY can't exceed 0), so the conditional was redundant.

These regressions-in-fixes are exactly what a single review pass misses: the reviewer's attention naturally narrows around "is the proposed change correct?" rather than "is the rest of the surface still correct given this change?".

## When to Apply

Use this pattern when **at least one** of the following holds:

- **Diff size ≥ ~500 lines**, or ≥ ~10 changed files. Below that, a single focused review pass is usually sufficient.
- **Domain-risky surface**: SSR/hydration, accessibility, focus management, performance hot paths, security boundaries, data-loss paths. These are surfaces where the cost of one missed regression is high and the angles needed to cover them don't all fit in one reviewer's head.
- **The PR already has a review surface with open threads**, especially if reviewer attention has been on the same areas for several rounds. Multi-loop fan-out brings genuinely fresh angles back in.
- **You're about to push to a long-running shared branch** (stage, release) and re-opening the PR for another QA pass is costly.

Do **not** use it for:

- Small, surgical PRs (<200 lines, single file).
- Pure refactors with green tests and no behaviour change — one altitude pass is enough.
- Cases where a real second reviewer is available _and_ has bandwidth — humans are still the gold standard; this pattern is for when that surface has already been exhausted.

## Examples

### Loop 1 → Loop 2: SSR hydration cascade

Loop 1 fix in `ScrollReveal.tsx`:

```tsx
// Before
const [shown, setShown] = useState<boolean>(() => disabled || reduceMotion)

// After (Loop 1)
const [shown, setShown] = useState<boolean>(disabled)
```

Loop 2 found the fix was incomplete — `transition`, `transitionDelay`, and `willChange` still diverged at hydration:

```tsx
// Before (still in the file after Loop 1)
transition: reduceMotion || disabled ? 'none' : theme.transitions.create(...)
transitionDelay: reduceMotion || disabled ? '0ms' : `${delay}ms`
willChange: reduceMotion || disabled ? 'auto' : 'opacity, transform'
```

Loop 2 pushed the fix into the hook itself:

```ts
// usePrefersReducedMotion.ts — Loop 2
/**
 * Initial state is **always `false`** so the server render and the first
 * client render produce identical markup — consulting `matchMedia`
 * synchronously here would otherwise diverge (server has no `matchMedia`
 * and returns false; a reduce-motion client returns true), which trips
 * React's hydration mismatch warning on every consumer's
 * transition/willChange styles. The effect below resolves to the real
 * value on the next tick.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(QUERY)
    const handler = (e: MediaQueryListEvent): void => setReduce(e.matches)
    mq.addEventListener('change', handler)
    // Sync the post-mount value (it was `false` during the SSR-matching
    // first render so the markup hydrated cleanly).
    setReduce(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduce
}
```

And, because the source-of-truth was now correct, the component collapsed to a single `animate` derivation rather than three duplicate conditionals:

```tsx
// ScrollReveal.tsx — after Loop 2
const animate = !disabled && !reduceMotion
// ...
transition: animate
  ? theme.transitions.create(['opacity', 'transform'], { duration: 700, easing: theme.transitions.easing.easeOut })
  : 'none',
transitionDelay: animate ? `${delay}ms` : '0ms',
willChange: animate ? 'opacity, transform' : 'auto'
```

### Loop 1 → Loop 3: CoverCta layout-thrash that wasn't actually fixed

Loop 1 added a ref-gated `setVisible` to a scroll handler intending to avoid React dispatch on every scroll frame. Loop 3 noticed the ref-bail ran **after** a layout-forcing read:

```tsx
// Before (Loop 1's version — perf fix defeated by the first read)
useScrollSubscription(() => {
  const root = document.documentElement
  const pageScrolls = root.scrollHeight > window.innerHeight + 1 // forces layout every frame
  const next = !pageScrolls || window.scrollY < 100
  if (next === visibleRef.current) return // bail comes too late
  visibleRef.current = next
  setVisible(next)
})

// After (Loop 3) — drop the layout-forcing read entirely
useScrollSubscription(() => {
  // `scrollY < 100` already implies the visible branch on a non-scrolling
  // page (scrollY can't exceed 0), so the `scrollHeight` check was both
  // redundant and the source of the layout thrash.
  const next = window.scrollY < 100
  if (next === visibleRef.current) return
  visibleRef.current = next
  setVisible(next)
})
```

Loop 3 also strengthened the ScrollReveal test to assert **both** `observe` _and_ `disconnect` ran — catching a future regression class where the observer is attached but never torn down under reduce-motion.

## Related

- `docs/solutions/workflow-issues/verify-infra-findings-before-escalating-ce-review-2026-05-18.md` — companion lesson on the single-pass version: when N reviewer agents cite the same source artifact, treat that as one signal, not N. This multi-loop pattern is the iterative version of the same idea — fan-out for recall, then a dedupe-and-verify step before acting.
- PR: [JesusFilm/core #9250](https://github.com/JesusFilm/core/pull/9250) (NES-1694).
- Commit landing the three-loop fixes: `d66505bae`.

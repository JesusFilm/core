# Search Learnings – InstantSearch clear behavior

## Summary

- Clearing the search via the input “x” did not clear the grid and triggered a loading/idle loop.
- Root causes were: (1) empty query `''` returns all results by default in Algolia, and (2) relying on the widget/native clear led to UI state racing with InstantSearch state.
- Fixes: make the search box a controlled input (`value={query}` with `refine`), explicitly clear with `refine('')` then `clear()`, short‑circuit empty queries in the search client to return a stable empty result, and avoid showing the loading skeleton on empty query.

## Symptoms

- Clicking clear showed logs oscillating between `status: 'loading'` and `'idle'`.
- Grid alternated between skeleton and results, never settling to an empty state.
- The input sometimes appeared not to clear despite state reporting `query: ''`.

## Root Causes

- Algolia default for `query: ''` is “match all” → triggers full re-fetch after clearing, repopulating the grid.
- Native browser “x” behavior on `<input type="search">` and the InstantSearch `SearchBox` widget can desync DOM value and InstantSearch state temporarily.
- Returning an "odd" empty response (e.g., `nbPages: 0`) can make widgets think they must re-search.

## Fixes Applied

- Controlled input bound to InstantSearch state.
  - Uses `useSearchBox()` → `value={query}` and `onChange={(e) => refine(e.currentTarget.value)}`.
  - Clear handler calls `refine('')` then `clear()` to reset connector state.
  - File: `apps/watch-modern/src/components/watch/home/VideoGrid.tsx:170` (input), `apps/watch-modern/src/components/watch/home/VideoGrid.tsx:156` (clear handler).

- Stable empty-query short‑circuit in the search client.
  - Wrap Algolia client and override `search()`; when every request has empty query, return a valid empty payload:
    - `hits: []`, `nbHits: 0`, `page: 0`, `nbPages: 1`, `hitsPerPage: 20`, `exhaustiveNbHits: true`.
  - Prevents further searches and avoids loading/idle ping‑pong.
  - File: `apps/watch-modern/src/components/providers/instantsearch.tsx:21`.

- UI guard for empty query.
  - Treat empty query as an explicit empty state (not loading), so the skeleton isn’t shown.
  - File: `apps/watch-modern/src/components/watch/home/VideoGrid.tsx:468`.

## Resulting Behavior

- Typing refines results as before.
- Clicking our clear button immediately empties the input and shows the empty state grid (no pagination, no skeleton, no loop).
- No extra searches are issued for `query: ''`.

## Testing Steps

1) Enter a query with hits; observe the grid updates.
2) Click the clear “X” button on the right of the input.
3) Confirm the field becomes empty, grid shows empty state, and logs remain at `status: 'idle', nbHits: 0`.

## Pitfalls and Notes

- Avoid relying on the native input clear on `<input type="search">`; we use `type="text"` and a custom clear button for deterministic state.
- Return a valid empty result for empty query; do not use `nbPages: 0` or omit keys, which can re-trigger widget behavior.
- If product wants “clear shows all videos,” remove the empty-query short‑circuit and the empty‑query UI guard:
  - Provider: allow `client.search(requests)` for empty queries (file: `apps/watch-modern/src/components/providers/instantsearch.tsx:21`).
  - Grid: compute `shouldShowEmptyState` from `results.nbHits === 0` only (file: `apps/watch-modern/src/components/watch/home/VideoGrid.tsx:468`).

## Future Ideas

- Add a small debounce (150–250ms) to `refine` for smoother typing on slow networks.
- Consider `algoliasearch/lite` to reduce client bundle size.
- If we later wire the header overlay search, connect it to the same `useSearchBox()` state for consistency.

---

## 2025-09 — Suggestions + Grid Stability (No re-mount loops)

Context: When suggestions and the grid were shown together, the grid kept flipping between `loading` and `idle` with repeated mount logs for the hit components.

Key Learnings
- Keep `<Hits />` mounted. Mount/unmount of `<Hits />` triggers an Algolia search, which, paired with conditional rendering, can cause a `loading → idle → loading` loop.
- Use overlays for state presentation:
  - Show a skeleton as an absolute overlay while `status === 'loading'` and the query isn’t empty.
  - Show an empty state overlay for `nbHits === 0` or empty query.
  - Keep the hits container in the DOM, but fade/disable it while overlays are visible.

Implementation
- File: `apps/watch-modern/src/components/watch/home/VideoGrid.tsx`
  - `NewHitsGridWithEmptyState` always renders the hits grid (`data-testid="hits-grid-container"`).
  - Skeleton overlay: `data-testid="grid-skeleton-overlay"`.
  - Empty overlay: `data-testid="grid-empty-overlay"`.

Race conditions and stale suggestions
- Clearing the input while a typed suggestions request is in-flight can cause the older response to override the newer “popular” results.
- Guard pattern we use in `SearchBar.tsx`:
  - Create a fresh `AbortController` for every fetch and keep a local reference.
  - Pass that `signal` into the suggestions client.
  - After awaiting the response, only update state if `abortControllerRef.current === localController` and `!localSignal.aborted`.
  - Also clear the suggestions list immediately on clear to avoid flashing old highlights.
  - File: `apps/watch-modern/src/components/watch/search/SearchBar.tsx` (fetchSuggestions + clear handler).

SearchBar behavior
- Input is fully controlled and decoupled from InstantSearch while typing.
- `Enter`/submit or selecting a suggestion triggers `refine` (via parent container).
- Clear (`X`) sets input to empty and shows “Popular searches” via a zero‑query suggestions fetch; the grid doesn’t change until submit.

Tests added (Playwright)
- `apps/watch-modern-e2e/src/e2e/search/suggestions-popup.spec.ts` validates:
  - Clears to “Popular searches” with no highlights from previous query.
  - Skeleton overlays while loading but hits remain mounted.

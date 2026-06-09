---
title: 'Renaming a GraphQL type silently breaks every hardcoded Apollo cache __typename (cache.identify / evict / modify / startsWith no-op)'
date: 2026-06-09
ticket: 'NES-1722'
pr: '#9282'
status: solved
severity: high
category: logic-errors
module: journeys-admin
problem_type: logic_error
tags:
  - apollo-client
  - graphql
  - cache-normalization
  - typename
  - cache-evict
  - cache-modify
  - cache-identify
  - contract-drift
  - codegen
  - test-fixtures
  - journeys-admin
  - template-gallery
---

# Renaming a GraphQL type silently breaks every hardcoded Apollo cache `__typename`

## Problem

A backend GraphQL type rename (`TemplateGalleryPage` → `TemplateGalleryPageAdmin`, and `TemplateGalleryPageMedia` → `TemplateGalleryPageMediaAdmin`) silently broke frontend Apollo Client cache code that hardcoded the **old** `__typename` as a string literal. Apollo normalizes entities by the cache key `${__typename}:${id}`, so every `cache.identify` / `cache.evict` / `cache.modify` / `cacheId.startsWith('TemplateGalleryPage:')` call kept addressing a key that no longer existed — a silent no-op that `tsc`, lint, and the existing test suite all passed.

## Symptoms

All three failures were silent — no thrown error, no `tsc` failure, no lint warning, just stale UI that only a refetch or hard refresh would heal:

1. **DnD source duplicate** — dragging a journey from collection A to B updated the target but left it in the source too, because the source-page `cache.modify` keyed off `cache.identify({ __typename: 'TemplateGalleryPage', ... })` → a non-existent entry.
2. **Deleted collection lingers** — deleting a collection left its card in the list because `cache.evict` targeted the old `TemplateGalleryPage:<id>` key Apollo never wrote.
3. **Trashed/archived journey's template card persists** — trashing or archiving a journey left its card in collections because the `startsWith('TemplateGalleryPage:')` prefix filter matched zero cache ids, so no `cache.modify` ran.

## What Didn't Work

Nothing flagged it — that is the whole hazard:

- **`tsc` stayed green.** The `__typename` is a plain string literal, not the generated type, so the rename couldn't propagate a type error to these call sites. `cache.identify({ __typename })` takes a `{ __typename: string }` — any literal is valid.
- **Lint stayed green.** The string is syntactically fine.
- **Unit tests stayed green.** The test fixtures/mocks seeded cache entities under the **old** `__typename`, so the hardcoded literal *matched the fixtures* and the cache ops appeared to work. Production code and fixtures were wrong in the same direction and masked each other. One evict fixture even used `cache.extract() as Record<string, unknown>`, defeating any type check on the seeded key.
- The bug only surfaced when the fixtures were renamed to match the new production `__typename` — the renamed fixtures made a DnD source-update test fail, which exposed that the cache literals were stale everywhere.

## Solution

Update the hardcoded `__typename` at each cache site, and rename the test fixtures/mocks to the new `__typename` so cache normalization is actually exercised.

**1. `useDragEndHandler.ts` — `cache.identify` (DnD source update)**

```ts
// before
const sourceCacheId = cache.identify({
  __typename: 'TemplateGalleryPage',
  id: sourceCollection.id
})
// after
const sourceCacheId = cache.identify({
  __typename: 'TemplateGalleryPageAdmin',
  id: sourceCollection.id
})
```

**2. `useTemplateGalleryPageDeleteMutation.ts` — `cache.evict`**

```ts
// before
cache.evict({ id: cache.identify({ __typename: 'TemplateGalleryPage', id: deletedId }) })
// after
cache.evict({ id: cache.identify({ __typename: 'TemplateGalleryPageAdmin', id: deletedId }) })
```

**3. `evictFromTemplateGalleryPages.ts` — `startsWith` prefix filter feeding `cache.modify`**

```ts
// before
for (const cacheId of Object.keys(snapshot)) {
  if (!cacheId.startsWith('TemplateGalleryPage:')) continue
  cache.modify({ id: cacheId, fields: { /* drop the moved/trashed ref */ } })
}
// after
for (const cacheId of Object.keys(snapshot)) {
  if (!cacheId.startsWith('TemplateGalleryPageAdmin:')) continue
  cache.modify({ id: cacheId, fields: { /* drop the moved/trashed ref */ } })
}
```

Plus: rename the cache `__typename` in every affected fixture/mock to `TemplateGalleryPageAdmin` / `TemplateGalleryPageMediaAdmin` (the publish/unpublish/delete/create/assign mocks and the Archive/Trash dialog specs that seed the cache), so the key the queries produce matches what the cache ops address.

## Why This Works

Apollo's default normalized cache key is `${__typename}:${id}`. `cache.identify` string-concatenates that key; `cache.evict` / `cache.modify` / a `startsWith('Type:')` scan all match against it. Renaming the GraphQL type changed the key Apollo writes (`TemplateGalleryPageAdmin:<id>`), so the old literal (`TemplateGalleryPage:<id>`) pointed at an entry that no longer exists — every op became a no-op against thin air. Aligning the literals to the new typename makes them address the real entries again.

## Prevention

- **Don't hardcode `__typename` for cache operations.** Reference a shared constant or the generated type's `__typename` so a rename forces a compile error instead of a silent string mismatch.
- **After ANY GraphQL type rename, grep non-generated code for the old typename** specifically in `cache.identify`, `cache.evict`, `cache.modify`, and `startsWith('OldType:')` prefix checks — these are the silent-no-op surfaces. One sweep:
  ```bash
  grep -rn "OldType:" apps libs --include='*.ts' --include='*.tsx' | grep -v __generated__
  grep -rn "'OldType'" apps libs --include='*.ts' --include='*.tsx' | grep -v __generated__
  ```
- **Keep test fixtures/mocks on the SAME `__typename` the queries return.** A loosely-typed cache fixture (`Record<string, unknown>`, `cache.restore({...})`) won't be caught by `tsc`, so a stale-typename fixture hides the production bug instead of exposing it.
- **Treat an all-green suite after a codegen-driven type rename as a smell.** A rename that touches cache keys should fail at least one test; if nothing breaks, the fixtures and production code are probably co-drifting in the same wrong direction.

## Related Issues

- `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md` — same component; its Pattern 11 documents the very `cache.identify({ __typename: 'TemplateGalleryPage' })` idiom this bug breaks (updated to the new typename when this landed).
- `docs/solutions/best-practices/local-template-dialog-consolidation-patterns-nes1543.md` — same `cache.identify` + `cache.modify` normalized-cache patching idiom.
- `docs/solutions/logic-errors/plausible-analytics-event-name-mismatch-qa359.md` — same failure *shape* in another domain: a hardcoded string literal silently mismatches a renamed identifier, `tsc` stays green, masked until runtime.
- `docs/solutions/logic-errors/response-cache-empty-list-invalidation-2026-05-10.md` and `docs/solutions/runtime-errors/yoga-response-cache-null-stickiness-and-zombie-process-debugging-nes1644.md` — adjacent server-side cache-staleness bugs on the same templateGalleryPages feature (see-also, different cache layer).
- NES-1722 (this bug, filed for separate verification), NES-1706 (backend type rename), NES-1707 / PR #9282 (frontend work where it surfaced).

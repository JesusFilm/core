---
title: 'Yoga response-cache null-stickiness and zombie-process debugging (NES-1644)'
category: runtime-errors
date: 2026-05-19
tags:
  - yoga
  - useResponseCache
  - entity-id-invalidation
  - cache-invalidation
  - null-response
  - shouldCacheResult
  - debugging
  - zombie-process
  - EADDRINUSE
  - hive-gateway
  - next-isr
  - template-gallery
module: api-journeys-modern
related_pr: 9173
related_ticket: NES-1644
symptom: >
  After publishing a previously-draft template-gallery page, the public
  URL serves a 404 for ~60s. Subsequent reads eventually succeed when the
  60s elapses. Edit mutations on already-published pages reflect
  immediately. Tested-and-failed: backend cache.invalidate calls, FE
  revalidate plumbing, Next ISR revalidate, proxy.ts rewrite tweaks,
  Cache-Control headers.
root_cause: >
  Two compounding causes that masked each other for most of the
  debugging session:

  (1) `@graphql-yoga/plugin-response-cache` cannot invalidate cached
  null responses via entity-ID. When the public query returns null
  (page is draft / unknown slug), the cache entry has no entity in its
  identifier set, so neither `cache.invalidate([{ typename, id }])` nor
  `cache.invalidate([{ typename }])` walks to it. The cached null
  persists for the full TTL (60s on main). A subsequent publish
  mutation auto-invalidates only entries that referenced the entity ID
  — but the cached null has no ID — so the next public read still
  serves the stale null until the TTL naturally expires.

  (2) An orphaned `api-journeys-modern` process held port 4004 across
  `nf start` restarts, serving stale compiled code with the original
  60s TTL and no code fixes applied. New `nf start` invocations logged
  `Error: listen EADDRINUSE: address already in use :::4004` and the
  new process exited, but the orphan kept serving every gateway
  request. Every code-level fix attempt during this period — including
  setting TTL to 0, removing the plugin entirely, and adding
  cache.invalidate calls — appeared to do nothing because the served
  binary never changed.

  Full devcontainer rebuild was required to clear the orphan.
---

## Context

The original NES-1644 work added a "View the page" preview button + revalidate plumbing for template-gallery pages in the journeys-admin UI. Manual testing reliably showed: publish → confirm public URL renders → unpublish → re-publish → click View → **404 for ~60 seconds**, then works.

The 60s was a precise match for `'Query.templateGalleryPageBySlug': 60_000` in `apis/api-journeys-modern/src/yoga.ts`'s `useResponseCache` config. The team correctly identified the response cache as the likely culprit, but spent many iterations chasing different fixes that never actually ran in the test env.

## What the working solution looks like

Add a `shouldCacheResult` predicate to `useResponseCache` that returns `false` whenever the response data has `templateGalleryPageBySlug === null`. Null is never written to the cache. Published responses still cache for 60s and auto-invalidate via entity-ID tracking when any TemplateGalleryPage mutation runs.

```ts
useResponseCache({
  session: () => null,
  cache,
  shouldCacheResult: ({ result }) => {
    if (Array.isArray(result.errors) && result.errors.length > 0) {
      return false
    }
    const data = result.data as Record<string, unknown> | null | undefined
    if (data != null && 'templateGalleryPageBySlug' in data && data.templateGalleryPageBySlug == null) {
      return false
    }
    return true
  },
  ttlPerSchemaCoordinate: {
    // ...
    'Query.templateGalleryPageBySlug': 60_000
    // ...
  }
})
```

That's the whole fix. No mutation-side cache.invalidate calls, no FE revalidate plumbing, no `res.revalidate(path)`, no ISR layer on the public page.

## Why `cache.invalidate([{ typename }])` does not work for cached nulls

The `@envelop/response-cache` in-memory cache stores two indexes per cached response:

- `responseId → result`: the cached response itself.
- `entityIds`: typenames and `typename:id` pairs collected from the response data during execution (via the plugin's injected `__typename` and `__responseCacheId` selections).

When a query returns `{ templateGalleryPageBySlug: null }`, the response carries no `__typename`, no `__responseCacheId`, no entity. The cache entry is stored, but its `entityIds` set is empty. Subsequent `cache.invalidate([{ typename: 'TemplateGalleryPage' }])` calls walk `entityToResponseIds.get('TemplateGalleryPage')` — which doesn't include this null entry — and the entry is never purged. It expires only when the configured TTL elapses.

This is by design in `@envelop/response-cache` and unlikely to change: the plugin's invalidation model is entity-driven, but the entities it knows about come from the response data, not the schema. A null response has no entities to track.

## Why the `shouldCacheResult` predicate is the right fix

The plugin invokes `shouldCacheResult({ cacheKey, result })` before writing to the cache. Returning `false` skips the cache write entirely. The resolver still runs every request for a null result (which is fine — the slug regex guard runs first, and the published-filter DB query is a single indexed lookup), but no stale null ever enters the cache.

The 60s TTL on the published-branch entry remains intact:

- Public hot path (popular published slug, many readers in 60s): one DB read, then 60s of cache hits.
- Mutation lands (publish/unpublish/edit/delete): the mutation returns the entity, the plugin auto-invalidates cache entries tracking that entity, the next read is a fresh DB query.
- Unpublish → republish: cache entry for the published page is evicted on unpublish (entity-ID auto-invalidation); the subsequent draft-window null is never cached; the republish does not need to invalidate anything because there is nothing to invalidate.

## The zombie-process trap

Most of the debugging time was lost not to the cache-null bug itself but to a stale `api-journeys-modern` process holding port 4004:

```
nf start
…
journeys-modern.1 |  Error: listen EADDRINUSE: address already in use :::4004
journeys-modern.1 |  NX  Process exited with code 1, waiting for changes to restart...
```

The new process exits immediately on the EADDRINUSE error. The orphan from a previous session keeps serving on 4004. The gateway-watcher and gateway routes all subgraph queries to the orphan, which is running stale compiled code from before any fix was applied. Every subsequent code change (TTL to 0, plugin removal, cache.invalidate calls, page swapped to SSR) looked like it had no effect, because the served binary never matched the source.

Diagnostic signals that should have flagged this earlier:

- The `[bySlug.resolve]` log lines I added to the resolver never fired in `nf start` output, even when a curl to the gateway returned data. (The logs were in the new code; the orphan was running the old code.)
- The 60s symptom matched main's `60_000` TTL exactly. After "removing the plugin entirely" in source, the symptom should have changed — and didn't.
- `lsof -i:4004` returned empty immediately after starting `nf start`, yet the next `nf start` errored EADDRINUSE on 4004 within seconds. Something was reclaiming the port between checks.

`pkill -9 -f api-journeys-modern` + `fuser -k 4004/tcp` failed to clear it in some scenarios. The fix that worked was a **full devcontainer rebuild**. Once that completed, every accumulated code change finally took effect on the next `nf start` — and the bug behavior changed visibly within the first test run.

## Debugging guidance for future cache-staleness investigations

When a cache-staleness bug pattern matches the symptoms above (specific time-window, edits work but transitions don't, restarts seem to have no effect):

1. **Confirm the served binary is the binary you think it is.** Add a unique log line to the resolver/mutation under investigation. If it doesn't appear in process logs when you trigger the request, you're not debugging the process you think you are.
2. **Check `nf start` output for `EADDRINUSE` on the service's port.** If it errored at startup, the new process never bound — an orphan is serving. Kill the orphan or rebuild the container.
3. **Differentiate cache TTL from cache invalidation.** "Bug disappears after N seconds" usually means a TTL — narrow N to a specific config knob. "Bug disappears after a specific event" usually means invalidation — instrument the event.
4. **For `@graphql-yoga/plugin-response-cache` specifically: read the source for `shouldCacheResult`, `ttlPerSchemaCoordinate`, and the in-memory cache's `set`/`invalidate` implementations** before trusting docs. The entity-tracking model is non-obvious for null responses.

## Related work explored and dropped

- `cache.invalidate([{ typename: 'TemplateGalleryPage' }])` in the publish/unpublish/delete mutations: does not reach cached null entries. Removed before merge.
- Typename-level invalidation paired with `Query.templateGalleryPageBySlug: 0`: technically works, but caching everything else at the same coordinate with `0` defeats the purpose of having a cache. Removed before merge.
- FE `useRevalidateTemplateGallery` hook + dual revalidate of `/template-gallery/<slug>` and `/home/template-gallery/<slug>` on the journeys app: ISR-specific solution that's irrelevant once the page is SSR. Removed before merge.
- `res.revalidate(path)` for ISR cache busting: SSR removed the ISR layer, so this is a no-op. Removed before merge.
- `Cache-Control: no-store` on the public page response: kept. Defensive against the browser holding a 404 across the unpublish window.
- `proxy.ts` short-circuit for `/template-gallery/*`: kept. Dev environments where the request hostname doesn't match `NEXT_PUBLIC_ROOT_DOMAIN` would otherwise fall through to the journey catch-all and 404; the gallery is root-domain-only by NES-1644 design.

## Files

- `apis/api-journeys-modern/src/yoga.ts` — the `shouldCacheResult` predicate.
- `apps/journeys/pages/home/template-gallery/[slug].tsx` — SSR with `Cache-Control: no-store`.
- `apps/journeys/proxy.ts` — `/template-gallery/*` short-circuit.
- `apps/journeys-admin/pages/api/preview-template-gallery.ts` — auth + 307 redirect (no revalidate).
- `docs/plans/2026-05-14-001-fix-template-gallery-revalidate-cache-invalidation-plan.md` — the original plan, preserved with an Outcome section explaining why it didn't ship as written.

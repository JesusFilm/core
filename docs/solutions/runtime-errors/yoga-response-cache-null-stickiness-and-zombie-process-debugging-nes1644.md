---
title: 'Yoga response-cache null-stickiness and zombie-process debugging (NES-1644)'
date: 2026-05-19
category: runtime-errors
module: api-journeys-modern
component: response_cache
problem_type: runtime_error
root_cause: cache_invalidation
resolution_type: configuration_change
severity: high
related_pr: 9174
related_ticket: NES-1644
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

Set `'Query.templateGalleryPageBySlug': 0` in `ttlPerSchemaCoordinate` — no Yoga response cache for this query at all. Every public read hits the resolver and runs one indexed slug lookup against Postgres.

```ts
useResponseCache({
  session: () => null,
  cache,
  ttlPerSchemaCoordinate: {
    // ...
    'Query.templateGalleryPageBySlug': 0
    // ...
  }
})
```

That's the whole server-side fix. No `shouldCacheResult` predicate, no mutation-side `cache.invalidate` calls, no FE revalidate plumbing, no `res.revalidate(path)`, no ISR layer on the public page.

### Why TTL 0 rather than 60s + entity invalidation

The original direction (TTL 60s with auto-invalidation via Yoga's entity-ID tracking) doesn't work for this query because of **two compounding cache-invalidation gaps**:

1. **Cached nulls have no entity to track.** When `templateGalleryPageBySlug` returns `null` (slug is draft / unknown), the cached response carries no `__typename`, so neither `cache.invalidate([{ typename }])` nor entity-ID auto-invalidation can reach the entry. It expires only on the natural TTL clock — making unpublish→republish cycles serve a stale 404 for the full TTL.

2. **Cross-service mutations don't invalidate.** The `templates` field on `TemplateGalleryPage` lists journey-side data. Journey mutations like `journeysTrash` live in **`apis/api-journeys`** (NestJS), not in api-journeys-modern, so they never trigger Yoga's auto-invalidation on the cache there. Additionally, the templates list stores entities as `TemplateGalleryItem:<id>` (a Pothos variant of Journey) while the journey mutations return `Journey:<id>` — even if the mutation routed through Yoga, the typename mismatch would prevent invalidation.

A `shouldCacheResult` predicate that drops nulls fixes (1) but not (2). Because both gaps exist on the same query, the simplest correct answer is no Yoga cache at this coordinate. The DB query is one indexed lookup; the perf cost is negligible compared to the staleness debugging cost.

### Apollo Client (admin) cache also needs a manual fix on journey trash/archive

The same `TemplateGalleryItem` / `Journey` typename mismatch breaks Apollo's normalized cache on the admin side too. `journeysTrash` and `journeysArchive` both return `Journey:<id>` and update that entity, but `TemplateGalleryPage.templates` references `TemplateGalleryItem:<id>` — a separate normalized entry — so the trashed/archived journey continues to render in collection cards until a manual refresh.

**First attempt: `cache.evict` + `cache.gc()`.** Worked locally, failed on stage:

```ts
// Original approach — replaced because dangling-ref filtering was unreliable.
update(cache, { data }) {
  data?.journeysTrash?.forEach((journey) => {
    cache.evict({ id: cache.identify({ __typename: 'Journey', id: journey.id }) })
    cache.evict({ id: cache.identify({ __typename: 'TemplateGalleryItem', id: journey.id }) })
  })
  cache.gc()
}
```

Apollo's documented behavior is that after `evict`, references to that entity in array fields are "automatically cleaned up on the next cache read." In practice this is timing-sensitive — on stage the trashed journey kept appearing in collection cards until the user refreshed. The cached `__ref` in the parent's `templates` array survives across the eviction window.

**Shipped approach: explicit `cache.modify` that filters the parent list.**

```ts
update(cache, { data }) {
  if (data?.journeysTrash == null) return
  const trashedJourneys = data.journeysTrash.filter((j) => j != null)
  if (trashedJourneys.length === 0) return

  const trashedTemplateRefs = new Set<string>()
  for (const journey of trashedJourneys) {
    const ref = cache.identify({ __typename: 'TemplateGalleryItem', id: journey.id })
    if (ref != null) trashedTemplateRefs.add(ref)
  }

  // `cache.modify` without `id` only targets ROOT_QUERY; we need every
  // cached TemplateGalleryPage. `cache.extract()` is the only API-level
  // way to enumerate entities by type without coupling to a specific
  // query variables tuple.
  const snapshot = cache.extract()
  for (const cacheId of Object.keys(snapshot)) {
    if (!cacheId.startsWith('TemplateGalleryPage:')) continue
    cache.modify({
      id: cacheId,
      fields: {
        templates(existing) {
          if (!Array.isArray(existing)) return existing
          return reject(existing, (ref) => trashedTemplateRefs.has(ref.__ref))
        }
      }
    })
  }

  for (const journey of trashedJourneys) {
    cache.evict({ id: cache.identify({ __typename: 'Journey', id: journey.id }) })
    cache.evict({ id: cache.identify({ __typename: 'TemplateGalleryItem', id: journey.id }) })
  }
}
```

Lives in `apps/journeys-admin/.../TrashJourneyDialog.tsx` and the parallel `ArchiveJourney.tsx` (archive preserves the `Journey` entity itself because archived journeys still render in the archived list — only the `TemplateGalleryItem` variant is evicted there). Mirrors the `libs/blockDeleteUpdate` pattern for parent-list filtering.

### Pair the mutation with `templateGalleryPageAssignJourney({ pageId: null })`

The cache update keeps the **client view** consistent. The **server-side join row** still exists after trash/archive — only `journey.status` flips. The resolver hides it (status: published only), but a later restore brings the journey back to its old collection slot, which surprised users.

Shipped fix: after `journeysTrash` / `journeysArchive` resolves, fire a best-effort `templateGalleryPageAssignJourney({ journeyId, pageId: null })`. The server resolver is idempotent — `pageId: null` removes the join row when present, returns `null` when the journey wasn't in any collection. Wrapped in its own try/catch so a failure doesn't contradict the primary mutation's success snackbar (trash/archive is the user's intent; the unassign is a cleanup step).

Net effect: a journey that's trashed or archived disappears from its collection cleanly, and a later restore returns it to the flat template list.

### Filter cached query results by status client-side

A subtler leak: Apollo's normalized cache stores the journey entity once and the active-view query result (`adminJourneys(status: [draft, published])`) holds a ref to it. When a mutation flips `status: published → archived`, the ref stays in the cached list. The UI reads the list, dereferences each ref, and the archived journey renders in the active view until refetch.

Fix is one line in the parent component — re-apply the same status predicate the server applies:

```ts
const allTemplates = useMemo<readonly Journey[]>(() => {
  const allowedStatuses = STATUS_FILTER_TO_JOURNEY_STATUSES[status]
  return (journeysQuery.data?.journeys ?? []).filter((j) => allowedStatuses.includes(j.status))
}, [journeysQuery.data, status])
```

The client mirrors the server contract — the cached entity status drives the list, not the cached list shape.

## Why `cache.invalidate([{ typename }])` does not work for cached nulls

The `@envelop/response-cache` in-memory cache stores two indexes per cached response:

- `responseId → result`: the cached response itself.
- `entityIds`: typenames and `typename:id` pairs collected from the response data during execution (via the plugin's injected `__typename` and `__responseCacheId` selections).

When a query returns `{ templateGalleryPageBySlug: null }`, the response carries no `__typename`, no `__responseCacheId`, no entity. The cache entry is stored, but its `entityIds` set is empty. Subsequent `cache.invalidate([{ typename: 'TemplateGalleryPage' }])` calls walk `entityToResponseIds.get('TemplateGalleryPage')` — which doesn't include this null entry — and the entry is never purged. It expires only when the configured TTL elapses.

This is by design in `@envelop/response-cache` and unlikely to change: the plugin's invalidation model is entity-driven, but the entities it knows about come from the response data, not the schema. A null response has no entities to track.

## Why the cross-service invalidation gap forces TTL 0

A `shouldCacheResult` predicate that drops nulls would correctly handle the unpublish→republish case in isolation. But the `TemplateGalleryPage` response embeds a `templates` list whose contents come from journey-side state. Journey mutations like `journeysTrash`, journey edits, and soft-deletes all live in **`apis/api-journeys`** (NestJS), so they never trigger any auto-invalidation in api-journeys-modern's Yoga cache. Each one would leave a stale published-page cached for the full TTL.

Three options were considered:

1. **HTTP-based cache invalidation** from api-journeys to api-journeys-modern on every relevant journey mutation. Proper fix but reintroduces the exact kind of inter-service plumbing the simplification removed.
2. **Lower TTL** (e.g. 5s) — bounded staleness, partial cache benefit. Still surprises users when the staleness window is hit.
3. **TTL 0** — no Yoga cache for this query. Every public read hits the resolver fresh. One indexed slug lookup per request; trivial for any realistic admin-managed traffic.

Option 3 is what shipped. The cache was originally added at NES-1547 to bound a cache-poisoning concern; the relevant security trade-off can be addressed at the page/edge layer (e.g. `Cache-Control` headers or CDN config) without the Yoga staleness liability.

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
- Typename-level invalidation paired with `Query.templateGalleryPageBySlug: 0`: equivalent to TTL 0 in net effect. Simplified to just TTL 0.
- `shouldCacheResult` predicate that drops nulls + keep 60s TTL for hits: would fix the null-stickiness gap but leaves journey-side mutations (trash, edit) with up to 60s staleness, because those mutations don't flow through this server. Replaced with TTL 0.
- FE `useRevalidateTemplateGallery` hook + dual revalidate of `/template-gallery/<slug>` and `/home/template-gallery/<slug>` on the journeys app: ISR-specific solution that's irrelevant once the page is SSR. Removed before merge.
- `res.revalidate(path)` for ISR cache busting: SSR removed the ISR layer, so this is a no-op. Removed before merge.
- `Cache-Control: no-store` on the public page response: kept. Defensive against the browser holding a 404 across the unpublish window.
- `proxy.ts` short-circuit for `/template-gallery/*`: kept. Dev environments where the request hostname doesn't match `NEXT_PUBLIC_ROOT_DOMAIN` would otherwise fall through to the journey catch-all and 404; the gallery is root-domain-only by NES-1644 design.

## Files

- `apis/api-journeys-modern/src/yoga.ts` — `'Query.templateGalleryPageBySlug': 0` in the response-cache `ttlPerSchemaCoordinate`.
- `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/TrashJourneyDialog/TrashJourneyDialog.tsx` — Apollo `update` callback with explicit `cache.modify` filtering of `TemplateGalleryPage.templates` lists; best-effort `templateGalleryPageAssignJourney({ pageId: null })` after trash; optimistic response uses `JourneyStatus.trashed`.
- `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DefaultMenu/ArchiveJourney/ArchiveJourney.tsx` — parallel implementation for the archive flow.
- `apps/journeys-admin/src/components/TemplateGalleryPageList/TemplateGalleryPageList.tsx` — client-side status filter on `allTemplates`, mirroring the server's status predicate to defend against post-mutation cache leaks.
- `apps/journeys/pages/home/template-gallery/[slug].tsx` — SSR with `Cache-Control: no-store, max-age=0` and a redacted diagnostic log on the null-with-errors branch.
- `apps/journeys/proxy.ts` — `/template-gallery/*` short-circuit (rewrites to `/home/template-gallery/*` regardless of hostname).
- `apps/journeys-admin/pages/api/preview-template-gallery.ts` — auth + slug-validated 307 redirect (no revalidate).
- `docs/plans/2026-05-14-001-fix-template-gallery-revalidate-cache-invalidation-plan.md` — the original plan, preserved with an Outcome section explaining why it didn't ship as written.

---
title: 'useResponseCache serves a stale empty array forever — entity-id invalidation cannot match an empty cached response'
date: 2026-05-10
category: logic-errors
module: apis/api-journeys-modern
problem_type: logic_error
component: database
severity: high
symptoms:
  - "templateGalleryPages query returns empty for some users despite rows existing in the DB"
  - "Newly created collections appear immediately, then vanish on hard refresh"
  - "Bug only reproduces on fresh accounts whose first cached read was empty"
  - "Response body is clean — just data.templateGalleryPages: [] with no errors array"
root_cause: config_error
resolution_type: config_change
related_components:
  - tooling
tags:
  - graphql-yoga
  - response-cache
  - cache-invalidation
  - ttl-per-schema-coordinate
  - template-gallery
  - nes-1648
---

# `useResponseCache` Empty-List Invalidation Bug

## Problem

`Query.templateGalleryPages(teamId)` and `Query.templateGalleryPage(id)` in `apis/api-journeys-modern/src/yoga.ts` were served from Yoga's `useResponseCache` plugin with the plugin's default `Infinity` TTL. The cache is globally shared (`session: () => null`) — keyed only on `(query, variables)`, no user dimension. When the first cached read for a given `teamId` returned an empty list, the cached `[]` could never be invalidated by subsequent `templateGalleryPageCreate` mutations: Yoga's entity-id-based invalidation matches entity ids inside the cached payload, and an empty list has none.

## Symptoms

- A user creates a template gallery collection successfully (mutation returns a fresh `TemplateGalleryPage` entity with a real id), then hard-refreshes the Templates tab and sees "No collections yet."
- The network response on refresh is a clean `{"data":{"templateGalleryPages":[]}}` — no `errors` array, no transport error, no auth failure.
- Reproduces deterministically on freshly provisioned accounts but **not** on accounts that already had collections before their first visit.
- The Prisma layer is never consulted on the refresh — the resolver does not run. The DB row exists; the cache hides it from this user indefinitely.

## What Didn't Work

These hypotheses were burned through during investigation. Each one feels load-bearing until you eliminate it:

- **GraphQL auth scope mismatch** — verified the same `isInTeam` check (`prisma.userTeam.findFirst({ where: { teamId, userId } })`) fires identically on create and read for the same user. Both pass; neither throws.
- **`teamId` drift between create and read** — both come from `activeTeam.id` on the FE. The exact string `"cc925616-…"` appeared in the create's `input.teamId`, the create response's `team.id`, and the post-refresh query's `variables.teamId`. Eliminated.
- **`TeamProvider` URL/session/DB race** — checked the resolution order (URL `?activeTeam=` → `sessionStorage` → DB `lastActiveTeamId`). All three converged on the same team across page loads.
- **Prisma soft-delete middleware or global filters** — `TemplateGalleryPage` has no `deletedAt` column, and there's no Prisma `$extends` middleware in `libs/prisma/journeys/src/client.ts`.
- **Apollo Client `errorPolicy` override** — none configured; default `'none'` would throw on response errors, but the response had no `errors` at all.
- **Federation routing** — Hive gateway returned the empty-array response cleanly with no error envelope.
- **Per-connection Prisma RLS** — a single `WHERE teamId = X` cannot return different rows for different callers on the same Postgres instance. Eliminated by reductio.

The dead-give-away that finally cracked it: the resolver was never running. No Prisma log line on the refresh. The response was being served from Yoga's cache before the resolver got a chance.

## Solution

Opt the two queries out of `useResponseCache` by setting their TTL to `0` in `apis/api-journeys-modern/src/yoga.ts`:

```ts
useResponseCache({
  session: () => null,
  cache,
  ttlPerSchemaCoordinate: {
    'Journey.blockTypenames': 0,
    'Query.adminJourney': 0,
    'Query.adminJourneys': 0,
    'Query.customDomain': 0,
    'Query.customDomains': 0,
    'Query.getJourneyProfile': 0,
    'Query.getUserRole': 0,
    'Query.googleSheetsSyncs': 0,
    // Team-scoped admin reads. The default TTL of Infinity caches the
    // first response indefinitely, keyed only on (query, teamId). When a
    // fresh user's first read returns an empty list, the cached entry
    // has no TemplateGalleryPage entity IDs in it — so mutation-based
    // invalidation cannot match it, and subsequent creates appear to
    // "disappear" until the cache is manually flushed (NES-1648).
    // templateGalleryPageBySlug (public renderer) is intentionally left
    // at the default TTL.
    'Query.templateGalleryPage': 0,
    'Query.templateGalleryPages': 0,
    // ...plausible stats etc.
  }
})
```

`Query.templateGalleryPageBySlug` was deliberately left at the default — its first response is rarely empty (a page must be published to be visible at the public slug), and publish/unpublish mutations return non-empty entity payloads that invalidate cleanly.

## Why This Works

The bug requires **three preconditions stacking up**:

1. **Globally shared cache** — `session: () => null` keys only on `(query, variables)`, so one user's cached `[]` is served to every caller with the same `teamId`. This is intentional for cross-user efficiency.
2. **Infinity TTL** — the plugin default. Cached entries never expire on their own.
3. **First response is empty** — `[]` contains zero entity ids, so Yoga's mutation-driven invalidation has nothing to match against when a later `templateGalleryPageCreate` returns a new entity.

Setting TTL to `0` removes precondition (2): the resolver runs on every request, Prisma is always consulted, and the cache is never the source of truth for these queries.

The deeper lesson — and the reason this took hours to find — is that **entity-id invalidation cannot rescue you when there are no entities in the cached response**. Yoga's invalidation works by walking the cached payload, collecting `__typename:id` pairs, and invalidating any cached query that previously returned a matching id. An empty list has no pairs. The cache is unreachable from the mutation side; the only way out is to never cache it in the first place.

The same comment block already exists in this file at lines 91-94 explaining why `Query.getJourneyProfile` had to opt out: "Private per-user data — must not be served from a global shared cache (session: () => null). TTL 0 disables caching entirely for this field, preventing cross-user profile contamination that caused the terms-and-conditions redirect to be skipped for new users." That bug was a different failure mode (cross-user data leakage) of the same root cause (missing TTL entry on a query that needed per-user freshness). See [pothos-query-parameter-ignored-nested-resolution-failure.md](./pothos-query-parameter-ignored-nested-resolution-failure.md) for that incident.

## Prevention

### Audit rule

Any query whose first response can legitimately be `[]` (or otherwise empty of entity ids) AND whose mutations are expected to populate it MUST have an explicit TTL in `ttlPerSchemaCoordinate` — either `0` or a deliberately short value. The plugin's default of `Infinity` is the wrong default for these.

The signature to grep for during review:

```bash
# Find queries that return a list of entities
rg 'queryField.*\b(prismaField|field).*\[.*Ref' apis/api-journeys-modern/src/schema/

# Cross-reference against ttlPerSchemaCoordinate
rg "'Query\.\w+':\s*0" apis/api-journeys-modern/src/yoga.ts
```

If a list-returning `Query.X` is missing from the second list, the reviewer should ask: *can its first response be empty? If yes, set TTL 0 explicitly.*

### Integration test pattern

Simulate the exact sequence that fails: empty read → mutation → populated read.

```ts
// docs/solutions reference pattern — adapt per fixture setup
const empty = await gql(GetTemplateGalleryPages, { teamId })
expect(empty.templateGalleryPages).toEqual([])

await gql(TemplateGalleryPageCreate, { input: { teamId, title: 't', creatorName: 'c', journeyIds: [] } })

const populated = await gql(GetTemplateGalleryPages, { teamId })
expect(populated.templateGalleryPages).toHaveLength(1)
```

No such test currently exists for `templateGalleryPage*`. Adding one — and a generic helper for other list queries — catches the next instance of this class at PR time rather than in production.

### What NOT to do

- **Don't switch to `session: () => userId`** as a knee-jerk fix. The plugin would then key per user, eliminating cross-user leakage but also eliminating the cache's reason for existing on hot queries like `adminJourneys`. Reach for TTL 0 first; reach for per-user keying only when a specific query genuinely needs per-user data AND benefits from caching.
- **Don't rely on mutation `update` hooks on the FE to paper over this**. Apollo's `cache.updateQuery` writes to the FE cache, but the next hard refresh re-hits the gateway and gets the stale `[]` back. Fix it at the server.

## Related Issues

- [NES-1648](https://linear.app/jesus-film-project/issue/NES-1648) — this bug. Reported by Sharon, reproduced on fresh accounts.
- [NES-1539](https://linear.app/jesus-film-project/issue/NES-1539) — parent: Template Gallery / Collections feature.
- [pothos-query-parameter-ignored-nested-resolution-failure.md](./pothos-query-parameter-ignored-nested-resolution-failure.md) (NES-1480) — different failure mode of the same `useResponseCache` config gap. Same file, same fix shape (`'Query.X': 0`), different surface (ACL data leakage vs invalidation staleness).
- `apis/api-journeys-modern/src/yoga.ts` — fix site.
- [`@graphql-yoga/plugin-response-cache` docs](https://the-guild.dev/graphql/yoga-server/docs/features/response-caching) — see "Custom invalidation" for the entity-id matching contract.

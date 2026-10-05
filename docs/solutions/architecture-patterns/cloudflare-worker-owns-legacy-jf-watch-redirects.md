---
title: Cloudflare Worker ownership pattern for legacy JF watch redirects
date: 2026-07-08
category: architecture-patterns
module: workers/jf-proxy
problem_type: architecture_pattern
component: tooling
severity: medium
applies_when:
  - 'Moving a legacy app-local redirect or resolver into `workers/jf-proxy`'
  - 'The old URL must keep working while app-local ownership remains deployed'
  - 'The edge route needs Core GraphQL data but should avoid repeated lookups'
tags:
  - cloudflare-workers
  - jf-proxy
  - edge-routing
  - redirects
  - cache-api
  - graphql
---

# Cloudflare Worker ownership pattern for legacy JF watch redirects

## Context

The JF watch redirect route historically lived in app-local Next.js rewrites and an API resolver:

- `/bin/jf/watch.html/:videoId/:languageId`
- `/api/jf/watch.html/:videoId/:languageId`

The migration goal was to move public ownership to `workers/jf-proxy` without deleting the app-local fallback before the Worker had shipped and proven itself in production.

## Guidance

When moving one of these legacy redirects into the Worker, make both ownership layers explicit:

1. Add a specific Hono route before the generic catch-all proxy.
2. Add specific Cloudflare route patterns before broader `bin/*` or `api/*` patterns in `wrangler.toml`.
3. Keep compatibility aliases that callers may reach directly, not only the documented public entrypoint.
4. Preserve temporary redirect status unless the legacy route was already permanent.

For lookup-backed redirects, cache only positive normalized ID-to-slug mappings:

```ts
export function normalizeId(id: string): string {
  return id.replace(/\.html?$/i, '')
}

export function getSlugCacheKey(kind: SlugKind, id: string): string {
  return `https://jf-proxy.local/cache/jf-watch/${kind}/${encodeURIComponent(normalizeId(id))}`
}
```

A missing video or language slug should return the route's not-found response and should not write a cache entry. This keeps transient Core misses, bad IDs, or partially migrated content from becoming sticky edge state.

## Why This Matters

Cloudflare may already have a broad route such as `/bin/*`, but relying on that alone makes ownership easy to lose in a future route cleanup. Specific patterns document that the Worker owns the legacy path, and tests document the redirect contract independently of the app-local resolver.

For cold cache requests, query only what is missing. If the video slug is cached, fetch only the language slug; if the language slug is cached, fetch only the video slug; if both are cached, skip Core entirely. This keeps the Worker fast while avoiding a stale negative cache for not-found cases.

## When to Apply

- A public legacy route currently reaches a Next.js rewrite or API resolver.
- The route can be resolved at the edge with a small Core lookup.
- App-local ownership needs to remain in place for rollout safety.
- The Worker needs to preserve old URL tolerance, such as optional `.html` suffixes or trailing slashes.

## Examples

For the JF watch route, the Worker owns both paths:

```ts
app.on('GET', ['/bin/jf/watch.html/:videoId/:languageId', '/bin/jf/watch.html/:videoId/:languageId/', '/api/jf/watch.html/:videoId/:languageId', '/api/jf/watch.html/:videoId/:languageId/'], async (c) => {
  const result = await resolveWatchRedirect({
    videoId: c.req.param('videoId'),
    languageId: c.req.param('languageId'),
    graphQlEndpoint: c.env.CORE_GRAPHQL_ENDPOINT
  })

  if (result.type === 'redirect') return c.redirect(result.location, 302)
  if (result.type === 'notFound') return new Response('Not Found', { status: 404 })
  return new Response('Service Unavailable', { status: 503 })
})
```

The matching `wrangler.toml` routes make ownership visible even though broader `bin/*` and `api/*` routes also exist:

```toml
{ pattern = "www.jesusfilm.org/bin/jf/watch.html/*", zone_name = "jesusfilm.org" },
{ pattern = "www.jesusfilm.org/api/jf/watch.html/*", zone_name = "jesusfilm.org" },
```

## Related

- `workers/jf-proxy/src/index.ts`
- `workers/jf-proxy/src/resolveWatchRedirect.ts`
- `workers/jf-proxy/src/slugCache.ts`

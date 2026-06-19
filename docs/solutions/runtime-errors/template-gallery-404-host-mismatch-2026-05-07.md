---
title: 'Local /template-gallery/[slug] returns 404 due to host mismatch with NEXT_PUBLIC_ROOT_DOMAIN'
date: 2026-05-07
last_updated: 2026-05-12
category: runtime-errors
module: apps/journeys
problem_type: runtime_error
component: development_workflow
symptoms:
  - 'Visiting http://0.0.0.0:4100/template-gallery/test renders the global 404 page'
  - 'nx serve journeys log shows `Compiling /[hostname]/[journeySlug]/[stepSlug]` instead of `/home/template-gallery/[slug]`'
  - 'Legacy api-journeys subgraph at :4001 throws `GraphQLError: journey not found` from `JourneyResolver.journey` with `code: NOT_FOUND`'
root_cause: config_error
resolution_type: environment_setup
severity: medium
tags:
  - next-middleware
  - local-dev
  - host-rewrite
  - template-gallery
  - journeys
related_components:
  - tooling
---

# Local /template-gallery/[slug] returns 404 due to host mismatch with NEXT_PUBLIC_ROOT_DOMAIN

## Problem

A new public page at `apps/journeys/pages/home/template-gallery/[slug].tsx` returned 404 in local dev. The root cause was unrelated to the page, the resolver, or the data — `apps/journeys/proxy.ts` was rewriting the request to the per-team `[hostname]/[journeySlug]/[stepSlug]` route because the request `Host` header did not match `NEXT_PUBLIC_ROOT_DOMAIN`.

## Symptoms

- Browser hit `http://0.0.0.0:4100/template-gallery/test` and rendered the global 404.
- `nx serve journeys` logs `Compiling /[hostname]/[journeySlug]/[stepSlug]` after the request — never `/home/template-gallery/[slug]`.
- Legacy api-journeys at `:4001` throws `GraphQLError: journey not found` from `JourneyResolver.journey`, extensions `{ code: "NOT_FOUND" }`.
- Gallery row (`slug=test`, `status=published`) and its three linked published templates exist and are clean in the DB.

## What Didn't Work

- Inspecting the gallery row + join table + Journey rows in the DB. Looked like a data-filter issue because the public page was 404ing, but every row was valid (`template=true, status=published, deletedAt=null`, matching `teamId`).
- Auditing `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageBySlug.query.ts` for an over-restrictive filter. Only filters `slug` and `status: published` — the row would have been returned.
- Suspecting Apollo `errorPolicy: 'all'` was swallowing a partial federation error. Plausible because federation field errors often surface as nulls under that policy, but our gallery query was never executed against the gateway in the first place.
- Investigating federation field-routing of the gallery's `templates: [Journey!]!` field between `api-journeys-modern` and legacy `api-journeys`. Would have explained the `:4001` "journey not found" errors, but those calls came from a _different_ page render — the `[hostname]/[journeySlug]` route the middleware misrouted to.
- Auditing ACL/auth on the legacy `journey()` resolver for unauthenticated public access. Wrong question — the resolver was called for the wrong reason; the auth path was a red herring.

About 30 minutes of investigation was spent on the wrong layer (gateway / resolver / auth) before the dev-server log was re-read carefully and the wrong route name (`[hostname]/[journeySlug]/[stepSlug]`) was noticed.

## Solution

Visit the page using a Host that exactly matches `NEXT_PUBLIC_ROOT_DOMAIN`. With `.env` set to `NEXT_PUBLIC_ROOT_DOMAIN=localhost:4100`:

```bash
# Works — host matches env exactly
open http://localhost:4100/template-gallery/test

# Does NOT work — host "0.0.0.0:4100" != env "localhost:4100"
open http://0.0.0.0:4100/template-gallery/test
```

Alternatively, align `.env` to the host you actually use:

```dotenv
# apps/journeys/.env
NEXT_PUBLIC_ROOT_DOMAIN=0.0.0.0:4100
```

Restart `nx serve journeys` after editing `.env` (Next does not hot-reload env vars).

## Why This Works

`apps/journeys/proxy.ts` reads `req.headers.get('host')` and compares it as a plain string against `process.env.NEXT_PUBLIC_ROOT_DOMAIN`:

- Match: `NextResponse.rewrite('/home${path}')` — sends `/template-gallery/test` to `/home/template-gallery/test`, which is where our page lives.
- No match: `NextResponse.rewrite('/${hostname}${path}')` — sends the request into the `[hostname]/[journeySlug]/[stepSlug]` per-team route, which then looks up a journey by `slug=<first path segment>` for hostname `<browser host>`. No such journey exists locally, the legacy `JourneyResolver.journey` throws `NOT_FOUND`, and the page renders the global 404.

The comparison is strict `===` on the full `host:port` string. `localhost:4100`, `0.0.0.0:4100`, and `127.0.0.1:4100` are all distinct values to JavaScript — only the one matching the env var triggers the `/home` branch. Stage and prod escape this entirely because the deployed `NEXT_PUBLIC_ROOT_DOMAIN` (e.g. `your.nextstep.is`) is exactly the host viewers visit.

## Prevention

- When a local page 404s, **first read the `nx serve journeys` log** and confirm which page is compiling. If it is `/[hostname]/...` instead of your target page, the middleware misrouted — check host vs `NEXT_PUBLIC_ROOT_DOMAIN` _before_ touching data, resolvers, or federation.
- Add a comment next to `NEXT_PUBLIC_ROOT_DOMAIN` in `apps/journeys/.env` documenting that the URL host (including port) must match this value exactly, or root-domain pages will fall into the per-team route.
- While debugging local routing, drop a temporary `console.log({ hostname, root: process.env.NEXT_PUBLIC_ROOT_DOMAIN, branch: '<which-branch>' })` into `apps/journeys/proxy.ts` to make the rewrite branch visible per request.
- Prefer `http://localhost:4100` over `http://0.0.0.0:4100` for local dev unless you have explicitly aligned the env var; bookmark the matching URL.
- "journey not found" from `:4001` on a request to a non-journey page is a strong signal the middleware sent the request to the wrong route, not that the backend is broken.

## Related Issues

- NES-1552 (public template gallery page renderer) — `https://linear.app/jesus-film-project/issue/NES-1552`
- `apps/journeys/proxy.ts`
- `apps/journeys/pages/home/template-gallery/[slug].tsx`
- `apis/api-journeys-modern/src/schema/templateGalleryPage/templateGalleryPageBySlug.query.ts`

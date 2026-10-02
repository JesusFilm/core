# Short Links Redirect Worker

The Cloudflare Worker that serves every short-link domain (nxstp.is, arc.gt,
stg.arc.gt and the YouTube domain) from the edge store api-media publishes to.
It is the redirect plane of the short-link service; the contract it implements
is [`prds/short-links/TECH-DESIGN.md`](../../prds/short-links/TECH-DESIGN.md)
and the product context is [`prds/short-links/README.md`](../../prds/short-links/README.md).
Domain vocabulary lives in [`CONTEXT.md`](./CONTEXT.md).

## How it works

The admin app (`apps/short-links-admin`) is a separate Vercel deployment on its
own URL and is not served by this Worker.

For `GET` / `HEAD` `https://<host>/<path>?<query>`:

1. **Domain.** `domain:<host>` (host lower-cased, port stripped) is read from
   the global KV namespace and cached in a module-level map for 60 s per
   isolate. When KV has no record (never published, or KV cannot be read) the
   settings come from api-media's `shortLinkDomainByHostname` and are written
   back to KV, logged as a `publish_gap`. A host neither knows gets the lost
   page (404), remembered for 10 s per isolate.
   When the domain has a **path prefix** (see [Path prefix](#path-prefix)) the
   path must be `/<prefix>/<rest>`; anything else gets the not-found behaviour
   and `<rest>` is what the following steps call the path.
2. **Path gate.** The leading slash is stripped. An empty path, a path with a
   `/`, a first segment in the domain's `reservedPaths`, or a path outside
   `^[A-Za-z0-9_.~-]{1,64}$` never touches the link stores and goes straight to
   the domain's not-found behaviour (below).
3. **Link.** The slug (lower-cased when the domain is case-insensitive) is
   looked up in this order (see [KV namespaces and global links](#kv-namespaces-and-global-links)):
   the domain's own KV namespace (`<slug>`), the global KV namespace
   (`link:<slug>`), then api-media's `shortLinkByPath` with a 2 s timeout. An api-media hit is a
   **publish gap**: the converted routing record is written back to the
   namespace that should have had it in `waitUntil` and
   `{"event":"publish_gap","key":...,"target":...}` is logged. Any record whose
   `v !== 1` is treated as a miss for that store.
4. **Paused.** A paused link redirects to its own `fallbackTo`, else the
   domain's `fallbackTo`, else the not-found behaviour.
5. **Destination.** `to` is parsed and every incoming query parameter except
   `qr` is appended (the destination's own parameters are kept; duplicates are
   appended, not overwritten). The response is the record's status (link
   override, else domain, else 307) with `Location` and `Cache-Control: no-store`;
   `HEAD` gets no body.
6. **Event.** After the response is built, a redirect event is sent to the
   `SHORT_LINKS_EVENTS` queue in `waitUntil`. A queue failure never changes the
   response.

Not-found behaviour is per domain:

| `notFound`    | Behaviour                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| `lostPage`    | 404 with the inline "We've Lost This Page" HTML                                                                 |
| `fallback`    | Redirect to `fallbackTo` with the domain's `redirectStatus` (lost page if `fallbackTo` is null)                 |
| `passthrough` | 302 to `passthroughOrigin` + the **original** path and query, slashes and all (lost page if the origin is null) |

arc.gt is configured as `passthrough` to `https://api.arclight.org` with
`reservedPaths = [s, hls, dl, dh, v2, api]`, so `arc.gt/s/1_jf-0-0/529?x=1`
reaches the Arclight API untouched while keyword slugs redirect from the edge.

Other routes: `/.well-known/*`, `/favicon.ico` and `/robots.txt` at the root of
the host (never under a path prefix) are plain-text 404s and never treated as
slugs. Anything other than `GET` / `HEAD` is a 405.

### Path prefix

A domain record carries `pathPrefix`: the path its short links live under,
without leading or trailing slashes. Empty (nxstp.is, arc.gt) keeps the domain
at the root. `jesus.film` uses `s`, so its short URLs are
`https://jesus.film/s/<slug>`.

| Request on a domain with `pathPrefix = "s"` | Result                                                       |
| ------------------------------------------- | ------------------------------------------------------------ |
| `/s/abc`                                    | Slug `abc`: grammar, reserved-path check and lookup run      |
| `/s/ABC` (case-insensitive domain)          | Slug `abc`                                                   |
| `/s/dashboard` (a reserved path)            | Not-found behaviour                                          |
| `/s/a/b`                                    | Not-found behaviour (the rest contains `/`)                  |
| `/abc`, `/s`, `/s/`, `/S/abc`               | Not-found behaviour (outside the prefix, or only the prefix) |

- The prefix is matched exactly and case-sensitively, whatever
  `slugCaseSensitive` says; only the slug is lower-cased.
- Multi-segment prefixes (`a/b`) work the same way.
- Edge store keys never contain the prefix: the key is
  `link:<hostname>/<slug>`, and the api-media fallback sends the bare slug as
  `pathname`.
- Passthrough forwards the original, unstripped path and query.
- A domain record without `pathPrefix` (published before the field existed) is
  read as the empty prefix; `v` stays 1. A present non-string `pathPrefix`
  makes the record invalid, which is a miss for that store.

### KV namespaces and global links

KV is two-tier:

| Namespace                    | Binding                                                         | Holds                           | Keys                                     |
| ---------------------------- | --------------------------------------------------------------- | ------------------------------- | ---------------------------------------- |
| Global (one per environment) | `SHORT_LINKS_KV`                                                | domain records and global links | `domain:<hostname>`, `link:<pathname>`   |
| One per domain               | named in the domain record's `kvBinding` (`KV_JESUS_FILM`, ...) | that domain's routing records   | `<pathname>` (bare slug, never prefixed) |

A **global link** (`global: true` on the record) still belongs to its own
domain, and additionally resolves on every other domain that has no link of
its own for the same slug. Global slugs are unique across all domains and
lower-case. A record's `status` and `fallbackTo` are the link's own overrides
only, so a global link served on another domain takes that domain's
`redirectStatus`; `record.hostname` says which domain owns it and is reported
on the event as `ownerHostname`.

Lookup order for a slug on a domain, with the `resolvedFrom` value each tier
reports on the redirect event:

| Tier | Store                                                                        | Key           | `resolvedFrom` |
| ---- | ---------------------------------------------------------------------------- | ------------- | -------------- |
| 1    | domain namespace `env[domain.kvBinding]`                                     | `<slug>`      | `kv`           |
| 2    | global namespace `SHORT_LINKS_KV`                                            | `link:<slug>` | `kv-global`    |
| 3    | api-media `shortLinkByPath` (which falls back to the global registry itself) |               | `api`          |

There is no second edge store. KV is the only one; when it misses or cannot be
read, api-media answers and the Worker writes the record back. A D1 replica was
dropped: it was written best-effort, so a failed delete left a row that brought
a deleted link back on every KV miss.

Tier 1 is skipped when the domain record's `kvBinding` is null (a domain
without a namespace is served through global links and api-media only) or
when the named binding is not in `wrangler.toml`; the latter is a deployment
gap, logged once per isolate as `{"event":"missing_binding","binding":...}`.
The binding is read as `env[domain.kvBinding]` and only used when the value
looks like a KV namespace.

**One binding per domain.** A Worker only reaches a namespace through a
binding, so every domain has one, named `KV_<HOSTNAME>` (`jesus.film` →
`KV_JESUS_FILM`). On stage and prod these are **not** in `wrangler.toml`: a
superAdmin sets a domain up from the admin app, and api-media creates the
namespace and adds the binding to the live Worker through the Cloudflare API
(see [Domains are set up from the admin](#domains-are-set-up-from-the-admin)).
The dev (top-level) section still declares `KV_JESUS_FILM`, `KV_NXSTP_IS`,
`KV_ARC_GT` and `KV_STG_ARC_GT` for tests and `wrangler dev`; those are typed
on `Env`, and any other name works through the index signature.

Write-back of an api-media hit goes to the domain namespace (as `<slug>`) when
the returned link belongs to this domain and the binding exists, else to the
global namespace (as `link:<slug>`) when the link is global, else nowhere.

### Queue consumer

The same Worker consumes `SHORT_LINKS_EVENTS`. Each batch is mapped to
`redirects.redirect_events` rows (snake_case columns per
[`clickhouse/0001_init.sql`](./clickhouse/0001_init.sql)); the user agent is
parsed into `device_class` / `os` / `browser` by the dependency-free classifier
in `src/userAgent.ts` and then dropped. Rows are POSTed as JSON lines to
`${CLICKHOUSE_URL}/?query=INSERT INTO <db>.redirect_events FORMAT JSONEachRow`
with basic auth. A 2xx acks the batch, anything else retries it (up to
`max_retries`, then the dead-letter queue). When `CLICKHOUSE_URL` is empty the
batch is acked and dropped, logged once per batch. No IP and no raw user agent
is ever stored.

## Source map

| File                  | Role                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/index.ts`        | Hono app, `export default { fetch, queue }`                                                                                |
| `src/local.ts`        | The `wrangler dev` entry: `src/index.ts` plus the local edge API. Never deployed                                           |
| `src/localEdgeApi.ts` | Local stand-in for the Cloudflare KV REST endpoints api-media publishes through                                            |
| `src/env.ts`          | `Env` binding types                                                                                                        |
| `src/records.ts`      | `DomainRecord` / `RoutingRecord` types and runtime validators (`isDomainRecord`, `isRoutingRecord`)                        |
| `src/resolve.ts`      | Pure resolution: path gate, lookup, paused handling, not-found behaviour → discriminated union                             |
| `src/destination.ts`  | `buildDestination(to, incomingSearchParams)`                                                                               |
| `src/store.ts`        | Domain KV → global KV → api-media reads, the domain cache, KV write-back                                                   |
| `src/graphql.ts`      | The api-media fallbacks (`shortLinkByPath`, `shortLinkDomainByHostname`) and their conversion to records (Brightcove rule) |
| `src/event.ts`        | `buildRedirectEvent(...)` (pure) and the queue message type                                                                |
| `src/userAgent.ts`    | `classifyUserAgent(ua)` → `{ deviceClass, os, browser }`                                                                   |
| `src/queue.ts`        | `handleQueueBatch(batch, env)`: row mapping and the ClickHouse insert                                                      |
| `src/lostPage.ts`     | The inline 404 HTML                                                                                                        |
| `scripts/deploy.ts`   | The `deploy` target: carries the live `KV_*` bindings over, then runs `wrangler deploy`                                    |
| `clickhouse/…`        | The ClickHouse database and table                                                                                          |
| `test/`               | `fetchMock` (outbound fetch stubbing), fixtures and request helpers                                                        |

## Bindings and configuration

Declared per environment in [`wrangler.toml`](./wrangler.toml) (top-level =
dev, `[env.stage]`, `[env.prod]`):

| Binding / var                                                | Kind                       | Notes                                                                                   |
| ------------------------------------------------------------ | -------------------------- | --------------------------------------------------------------------------------------- |
| `SHORT_LINKS_KV`                                             | KV namespace               | Global namespace: domain records and global links                                       |
| `KV_JESUS_FILM`, `KV_NXSTP_IS`, `KV_ARC_GT`, `KV_STG_ARC_GT` | KV namespace               | One per domain, named by the domain record's `kvBinding`; that domain's routing records |
| `SHORT_LINKS_EVENTS`                                         | Queue producer + consumer  | `short-links-events-<env>`; DLQ `short-links-events-dlq-<env>`                          |
| `CORE_GRAPHQL_ENDPOINT`                                      | var                        | Gateway URL for the api-media fallback (`http://localhost:4000` locally)                |
| `CLICKHOUSE_URL`                                             | var                        | Empty = consumer acks and drops                                                         |
| `CLICKHOUSE_DATABASE`                                        | var                        | `redirects`                                                                             |
| `CLICKHOUSE_USER`                                            | secret (`wrangler secret`) |                                                                                         |
| `CLICKHOUSE_PASSWORD`                                        | secret (`wrangler secret`) |                                                                                         |

**Placeholder id.** The stage and prod id of the global namespace
(`SHORT_LINKS_KV`) in `wrangler.toml` is `REPLACE_ME_BEFORE_DEPLOY`. It is
deliberately invalid so a deploy with an unfilled id fails at the Cloudflare
API rather than binding to nothing. Fill it per environment before the first
deploy (commands are in the comment block at the top of `wrangler.toml`). Queues are referenced by name and need no id.
The dev (top-level) KV ids are local-only names (`short-links-dev-jesus-film`,
...) rather than the placeholder: miniflare keys local namespaces by id, so each
binding needs a distinct one or the tests would see every domain namespace as
the same store.

### Domains are set up from the admin

Per-domain KV bindings and the route (or custom domain) that sends a hostname
to this Worker are managed by api-media through the Cloudflare API, on behalf
of a superAdmin in `apps/short-links-admin`. Neither is in `wrangler.toml` for
stage or prod.

| What                      | Owned by        | Notes                                                                               |
| ------------------------- | --------------- | ----------------------------------------------------------------------------------- |
| `KV_*` bindings           | api-media       | One per domain; added and removed on the live Worker, carried over by every deploy  |
| Every other binding       | `wrangler.toml` | `SHORT_LINKS_KV`, the queue, vars and secrets                                       |
| Routes and custom domains | api-media       | `jesus.film/s/*` style route for a prefixed domain, custom domain for a root domain |

Two rules follow, and breaking either takes domains down:

- **Never add `routes` to `wrangler.toml`.** With none, a deploy leaves existing
  routes and custom domains alone. With any, wrangler replaces the whole set
  and deletes the rest.
- **Never deploy stage or prod with a bare `wrangler deploy`.** It uploads only
  the bindings in `wrangler.toml` and unbinds every domain. Use the `deploy`
  target (below).

The first rollout is `jesus.film/s` and `jesus.movie/s`, proven first on
`stage.jesus.film/s` and `stage.jesus.movie/s` against the stage Worker.
api-media's `CLOUDFLARE_SHORT_LINKS_ALLOWED_HOSTNAMES` limits each environment
to its own hostnames.

## Local development

```bash
nx serve short-links-redirect        # wrangler dev src/local.ts on http://localhost:8788
```

`wrangler dev` runs against local miniflare KV / Queues, so there are no
records until something puts them there. Either publish from a local api-media
(next section) or seed by hand. To seed by hand, put a domain and a link:

```bash
cd workers/short-links-redirect
# the domain record goes to the global namespace and names its own binding
wrangler kv key put --binding SHORT_LINKS_KV --local 'domain:localhost' \
  '{"v":1,"id":"d1","hostname":"localhost","redirectStatus":307,"fallbackTo":null,"notFound":"lostPage","passthroughOrigin":null,"reservedPaths":[],"slugCaseSensitive":true,"pathPrefix":"","kvBinding":"KV_JESUS_FILM"}'
# the domain's links go to that binding, keyed by bare slug
wrangler kv key put --binding KV_JESUS_FILM --local 'jesus' \
  '{"v":1,"id":"l1","to":"https://www.jesusfilm.org/watch/jesus.html","status":null,"fallbackTo":null,"paused":false,"assetClass":"standard","placement":null,"campaignIds":[],"videoId":null,"youtubeVideoId":null,"language":null,"global":false,"hostname":"localhost"}'
# a global link goes to the global namespace as link:<slug>
wrangler kv key put --binding SHORT_LINKS_KV --local 'link:everywhere' \
  '{"v":1,"id":"l2","to":"https://www.jesusfilm.org/","status":null,"fallbackTo":null,"paused":false,"assetClass":"standard","placement":null,"campaignIds":[],"videoId":null,"youtubeVideoId":null,"language":null,"global":true,"hostname":"localhost"}'
curl -i http://localhost:8788/jesus?utm_source=test
curl -i http://localhost:8788/everywhere
```

With the local gateway (`CORE_GRAPHQL_ENDPOINT = http://localhost:4000`) running,
an unseeded host or slug falls through to api-media and is written back to KV,
so a domain and its links that exist in the local database resolve without any
seeding.

### Publishing from a local api-media

api-media publishes through the Cloudflare REST API, which cannot reach the
local KV that `wrangler dev` uses. So `nx serve` runs `src/local.ts`
instead of `src/index.ts`: the same Worker plus a **local edge API** under
`/client/v4/` that answers the three calls api-media makes (KV bulk write, KV
delete) from this Worker's own bindings. `wrangler.toml` keeps
`main = "src/index.ts"`, so stage and prod bundles never contain it; a bare
`wrangler dev` does not serve it either.

A Worker cannot see the ids its bindings were declared with, so locally **an
id is the binding name**.

1. Add to `apis/api-media/.env` and restart api-media:

   ```bash
   CLOUDFLARE_SHORT_LINKS_API_BASE_URL=http://localhost:8788/client/v4
   CLOUDFLARE_SHORT_LINKS_API_TOKEN=local
   CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID=SHORT_LINKS_KV
   ```

   `nx fetch-secrets api-media` rewrites `.env` from Doppler, so re-add them
   afterwards. The token is not checked. `CLOUDFLARE_ACCOUNT_ID` is already
   there and is ignored.

2. In the admin, open the domain you serve locally (a `localhost` domain for
   `http://localhost:8788/<slug>`) and set both **KV namespace id** and
   **Worker binding** to one of the dev bindings in `wrangler.toml`, e.g.
   `KV_JESUS_FILM`. Two local domains that share a binding share their slugs.

3. Use **Republish domain** once to write the domain record and every link,
   then create, edit or **Republish to edge** as usual:

   ```bash
   curl -i http://localhost:8788/<slug>
   ```

With `CLOUDFLARE_SHORT_LINKS_API_BASE_URL` set, api-media also builds the short
URL of the domain whose hostname matches it from the Worker's origin, so a
`localhost` link shows, copies and opens as `http://localhost:8788/<slug>`
(and its QR encodes that) instead of `https://localhost/<slug>`. Every other
domain keeps `https://<hostname>`.

A republished domain record takes effect immediately (the local edge API clears
the 60 s domain cache). An id that is not a binding name gets a 404 naming the
binding, and Cloudflare endpoints the local API does not implement get a 404
too, so api-media fails loudly instead of publishing nowhere.

## Tests

Vitest with `@cloudflare/vitest-pool-workers`: specs run inside workerd with
real (local) KV and Queue bindings from `cloudflare:test`. Outbound `fetch`
(api-media, ClickHouse) is stubbed with `test/fetchMock.ts`.

```bash
# from the repo root; --config must be absolute because it is resolved relative to --root
npx vitest run --config "$PWD/workers/short-links-redirect/vitest.config.mts" \
  --root workers/short-links-redirect --coverage=false
```

Other checks:

```bash
pnpm exec tsc -p workers/short-links-redirect/tsconfig.app.json --noEmit   # nx type-check
pnpm exec eslint workers/short-links-redirect                              # nx lint
pnpm exec wrangler deploy --dry-run --outdir /tmp/slr-dry \
  --config workers/short-links-redirect/wrangler.toml                      # bundles without deploying
```

## Deployment

`.github/workflows/worker-deploy.yml` discovers every affected project with a
`deploy` target (`tools/scripts/deploy-apps.ts`) on pushes to `stage` and
`main` and runs `nx run-many --target=deploy --projects=short-links-redirect`
(`--prod` on `main`) with `CLOUDFLARE_API_TOKEN` from repository secrets.

The target runs `tsx scripts/deploy.ts --env=stage|prod`, not `wrangler deploy`
directly:

1. It reads the bindings of the live Worker from the Cloudflare API.
2. It writes `wrangler.deploy.toml` (gitignored): `wrangler.toml` without the
   dev-only top-level namespaces, plus every live `KV_*` binding the config does
   not declare.
3. It runs `wrangler deploy --env=<env> --config wrangler.deploy.toml`.

It **fails closed**: if the live bindings cannot be read for any reason other
than "this Worker has never been deployed", nothing is deployed. The account is
resolved the way wrangler does (`account_id` in the config, then
`CLOUDFLARE_ACCOUNT_ID`, then the token's single account).

A binding api-media adds between step 1 and the upload is lost. The domain page
in the admin then shows the binding as missing and "Set up KV" restores it;
redirects keep working through the global namespace and api-media meanwhile.

Environment names: `short-links-redirect-dev` / `-stage` / `-prod`. Stage and
prod have `logpush = true` and observability logs enabled.

## Cutover per domain

Summarised from TECH-DESIGN.md ("superAdmin-managed Cloudflare infrastructure").

Once per environment:

1. Create the global KV namespace, the queue and its dead-letter queue, and the
   ClickHouse database/table (`clickhouse/0001_init.sql`).
2. Fill the namespace id into `wrangler.toml`, set `CLICKHOUSE_USER` /
   `CLICKHOUSE_PASSWORD` with `wrangler secret put`, deploy.
3. Set api-media's `CLOUDFLARE_SHORT_LINKS_*` variables, including the Worker
   name, the infrastructure token and the allowed hostnames.

Per domain, by a superAdmin in the admin app (stage hostname first):

4. Add the domain (or open the existing one), with path prefix `s`.
5. **Set up KV**: creates the namespace, publishes every live link into it and
   binds it to this Worker.
6. **Attach to Worker**: creates the route `<hostname>/s/*`. The hostname's zone
   must already be in the Cloudflare account and the hostname must already have
   a proxied DNS record; DNS is never edited from the admin.
7. Watch the `publish_gap` logs; zero is the goal.

To take a domain down: Detach from Worker, then Remove KV, then Remove domain.

nxstp.is and arc.gt are not part of the first rollout. As root domains they
would attach as Workers Custom Domains, which Cloudflare refuses while the
hostname still has DNS records pointing elsewhere.

## Failure order

| Down                  | Effect                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ClickHouse or Queues  | Redirects continue; events delay (retries, then DLQ) or drop.                                                                        |
| api-media or Postgres | Known links redirect from the last published records; unknown paths get the not-found behaviour.                                     |
| KV                    | Every redirect goes through api-media (2 s timeout) and is written back; with api-media also down, uncached hosts get the lost page. |
| Worker                | Nothing on the cut-over domains resolves. This is the one component with the 99.99% availability target.                             |

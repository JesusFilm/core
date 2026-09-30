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
   the global KV namespace, then D1, and cached in a module-level map for 60 s
   per isolate. An unknown host gets the lost page (404).
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
   (`link:<slug>`), D1 (`link:<host>/<slug>`, then `global:<slug>`), then
   api-media's `shortLinkByPath` with a 2 s timeout. An api-media hit is a
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

| Tier | Store                                                                        | Key                      | `resolvedFrom` |
| ---- | ---------------------------------------------------------------------------- | ------------------------ | -------------- |
| 1    | domain namespace `env[domain.kvBinding]`                                     | `<slug>`                 | `kv`           |
| 2    | global namespace `SHORT_LINKS_KV`                                            | `link:<slug>`            | `kv-global`    |
| 3    | D1                                                                           | `link:<hostname>/<slug>` | `d1`           |
| 4    | D1                                                                           | `global:<slug>`          | `d1-global`    |
| 5    | api-media `shortLinkByPath` (which falls back to the global registry itself) |                          | `api`          |

Tier 1 is skipped when the domain record's `kvBinding` is null (a domain
without a namespace is served through global links, D1 and api-media only) or
when the named binding is not in `wrangler.toml`; the latter is a deployment
gap, logged once per isolate as `{"event":"missing_binding","binding":...}`.
The binding is read as `env[domain.kvBinding]` and only used when the value
looks like a KV namespace.

**One binding per domain.** Bindings are static in `wrangler.toml`, so adding
a domain means: create its namespace (`wrangler kv namespace create`), add a
`[[kv_namespaces]]` entry with the binding name in every environment (the dev
one with a distinct local id), deploy, then set `kvNamespaceId` and `kvBinding`
on the domain in api-media. The known bindings (`KV_JESUS_FILM`, `KV_NXSTP_IS`,
`KV_ARC_GT`, `KV_STG_ARC_GT`) are also typed on `Env`; any other name still
works through the index signature.

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

| File                 | Role                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| `src/index.ts`       | Hono app, `export default { fetch, queue }`                                                         |
| `src/env.ts`         | `Env` binding types                                                                                 |
| `src/records.ts`     | `DomainRecord` / `RoutingRecord` types and runtime validators (`isDomainRecord`, `isRoutingRecord`) |
| `src/resolve.ts`     | Pure resolution: path gate, lookup, paused handling, not-found behaviour → discriminated union      |
| `src/destination.ts` | `buildDestination(to, incomingSearchParams)`                                                        |
| `src/store.ts`       | Domain KV → global KV → D1 (domain, global) → api-media reads, the 60 s domain cache, KV write-back |
| `src/graphql.ts`     | The api-media `shortLinkByPath` fallback and its conversion to a routing record (Brightcove rule)   |
| `src/event.ts`       | `buildRedirectEvent(...)` (pure) and the queue message type                                         |
| `src/userAgent.ts`   | `classifyUserAgent(ua)` → `{ deviceClass, os, browser }`                                            |
| `src/queue.ts`       | `handleQueueBatch(batch, env)`: row mapping and the ClickHouse insert                               |
| `src/lostPage.ts`    | The inline 404 HTML                                                                                 |
| `d1/0001_init.sql`   | The D1 `short_link_records` table (also applied to the local D1 by the tests)                       |
| `clickhouse/…`       | The ClickHouse database and table                                                                   |
| `test/`              | `fetchMock` (outbound fetch stubbing), fixtures, and the D1 migration setup file                    |

## Bindings and configuration

Declared per environment in [`wrangler.toml`](./wrangler.toml) (top-level =
dev, `[env.stage]`, `[env.prod]`):

| Binding / var                                                | Kind                       | Notes                                                                                   |
| ------------------------------------------------------------ | -------------------------- | --------------------------------------------------------------------------------------- |
| `SHORT_LINKS_KV`                                             | KV namespace               | Global namespace: domain records and global links                                       |
| `KV_JESUS_FILM`, `KV_NXSTP_IS`, `KV_ARC_GT`, `KV_STG_ARC_GT` | KV namespace               | One per domain, named by the domain record's `kvBinding`; that domain's routing records |
| `SHORT_LINKS_DB`                                             | D1 database                | `short-links-stage` / `short-links-prod`; replica read on a KV miss                     |
| `SHORT_LINKS_EVENTS`                                         | Queue producer + consumer  | `short-links-events-<env>`; DLQ `short-links-events-dlq-<env>`                          |
| `CORE_GRAPHQL_ENDPOINT`                                      | var                        | Gateway URL for the api-media fallback (`http://localhost:4000` locally)                |
| `CLICKHOUSE_URL`                                             | var                        | Empty = consumer acks and drops                                                         |
| `CLICKHOUSE_DATABASE`                                        | var                        | `redirects`                                                                             |
| `CLICKHOUSE_USER`                                            | secret (`wrangler secret`) |                                                                                         |
| `CLICKHOUSE_PASSWORD`                                        | secret (`wrangler secret`) |                                                                                         |

**Placeholder ids.** Every stage and prod KV namespace id and D1 database id
in `wrangler.toml` is `REPLACE_ME_BEFORE_DEPLOY`. They are deliberately invalid
so a deploy with unfilled ids fails at the Cloudflare API rather than binding
to nothing. Fill them per environment before the first deploy (commands are in
the comment block at the top of `wrangler.toml`). Queues are referenced by name
and need no id. The dev (top-level) KV ids are local-only names
(`short-links-dev-jesus-film`, ...) rather than the placeholder: miniflare keys
local namespaces by id, so each binding needs a distinct one or the tests would
see every domain namespace as the same store.

**Routes.** The first route is a zone route, not a custom domain, so the Worker
only claims `/s/*` and the rest of `jesus.film` stays free:

```toml
routes = [{ pattern = "jesus.film/s/*", zone_name = "jesus.film" }]
```

nxstp.is and arc.gt follow later as custom domains
(`{ pattern = "nxstp.is", custom_domain = true }`). All of them are commented
examples in `wrangler.toml` until the cutover.

## Local development

```bash
nx serve short-links-redirect        # wrangler dev on http://localhost:8788
```

`wrangler dev` runs against local miniflare KV / D1 / Queues, so there are no
records until you seed some. Apply the D1 schema and put a domain and a link:

```bash
cd workers/short-links-redirect
wrangler d1 migrations apply short-links-dev --local
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
an unseeded slug falls through to api-media and is written back to KV.

## Tests

Vitest with `@cloudflare/vitest-pool-workers`: specs run inside workerd with
real (local) KV, D1 and Queue bindings from `cloudflare:test`. The D1 schema in
`d1/` is applied before each spec file by `test/applyD1Migrations.ts`
(configured in `vitest.config.mts`). Outbound `fetch` (api-media, ClickHouse) is
stubbed with `test/fetchMock.ts`.

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
(`--prod` on `main`), i.e. `wrangler deploy --env=stage` / `--env=prod` from this
directory with `CLOUDFLARE_API_TOKEN` from repository secrets.

Environment names: `short-links-redirect-dev` / `-stage` / `-prod`. Stage and
prod have `logpush = true` and observability logs enabled.

## Cutover per domain

Summarised from TECH-DESIGN.md; one domain at a time.

1. Create the domain's KV namespace (plus the global one the first time) and
   add its `[[kv_namespaces]]` binding to every environment, the D1 database (apply `d1/0001_init.sql` with
   `wrangler d1 migrations apply <db> --env=<env> --remote`), the queue and its
   dead-letter queue, and the ClickHouse database/table (`clickhouse/0001_init.sql`).
2. Fill the ids into `wrangler.toml`, set `CLICKHOUSE_USER` / `CLICKHOUSE_PASSWORD`
   with `wrangler secret put`, deploy to stage.
3. Set api-media's `CLOUDFLARE_SHORT_LINKS_*` env vars and run
   `shortLinkDomainPublish` for the domain (backfills every live link).
4. Add the route. For jesus.film that is the zone route
   `{ pattern = "jesus.film/s/*", zone_name = "jesus.film" }`, with the domain
   published with `pathPrefix = s`. For the others, add the hostname as a
   custom domain of the Worker (uncomment / extend the
   `routes` example under the environment in `wrangler.toml`). For nxstp.is this
   replaces the Vercel `apps/short-links` deployment; for arc.gt the domain is
   configured with `notFound = passthrough`, `passthroughOrigin = https://api.arclight.org`,
   `redirectStatus = 302`, `reservedPaths = [s, hls, dl, dh, v2, api]`.
5. Watch the `publish_gap` logs; zero is the goal.

## Failure order

| Down                  | Effect                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| ClickHouse or Queues  | Redirects continue; events delay (retries, then DLQ) or drop.                                            |
| api-media or Postgres | Known links redirect from the last published records; unknown paths get the not-found behaviour.         |
| KV                    | D1 serves.                                                                                               |
| Worker                | Nothing on the cut-over domains resolves. This is the one component with the 99.99% availability target. |

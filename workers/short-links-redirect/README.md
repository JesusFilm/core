# Short Links Redirect Worker

The Cloudflare Worker that serves every short-link domain (nxstp.is, arc.gt,
stg.arc.gt and the YouTube domain) from the edge store api-media publishes to.
It is the redirect plane of the short-link service; the contract it implements
is [`prds/short-links/TECH-DESIGN.md`](../../prds/short-links/TECH-DESIGN.md)
and the product context is [`prds/short-links/README.md`](../../prds/short-links/README.md).
Domain vocabulary lives in [`CONTEXT.md`](./CONTEXT.md).

## How it works

For `GET` / `HEAD` `https://<host>/<path>?<query>`:

1. **Domain.** `domain:<host>` (host lower-cased, port stripped) is read from KV,
   then D1, and cached in a module-level map for 60 s per isolate. An unknown
   host gets the lost page (404).
2. **Path gate.** The leading slash is stripped. An empty path, a path with a
   `/`, a first segment in the domain's `reservedPaths`, or a path outside
   `^[A-Za-z0-9_.~-]{1,64}$` never touches the link stores and goes straight to
   the domain's not-found behaviour (below).
3. **Link.** `link:<host>/<path>` (path lower-cased when the domain is
   case-insensitive) is read from KV, then D1, then api-media's
   `shortLinkByPath` with a 2 s timeout. An api-media hit is a **publish gap**:
   the converted routing record is written back to KV in `waitUntil` and
   `{"event":"publish_gap","key":...}` is logged. Any record whose `v !== 1` is
   treated as a miss for that store.
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

Other routes: `/.well-known/*`, `/favicon.ico` and `/robots.txt` are plain-text
404s and never treated as slugs. Anything other than `GET` / `HEAD` is a 405.

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
| `src/store.ts`       | KV → D1 → api-media reads, the 60 s domain cache, KV write-back                                     |
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

| Binding / var           | Kind                       | Notes                                                                    |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `SHORT_LINKS_KV`        | KV namespace               | Routing and domain records                                               |
| `SHORT_LINKS_DB`        | D1 database                | `short-links-stage` / `short-links-prod`; replica read on a KV miss      |
| `SHORT_LINKS_EVENTS`    | Queue producer + consumer  | `short-links-events-<env>`; DLQ `short-links-events-dlq-<env>`           |
| `CORE_GRAPHQL_ENDPOINT` | var                        | Gateway URL for the api-media fallback (`http://localhost:4000` locally) |
| `CLICKHOUSE_URL`        | var                        | Empty = consumer acks and drops                                          |
| `CLICKHOUSE_DATABASE`   | var                        | `redirects`                                                              |
| `CLICKHOUSE_USER`       | secret (`wrangler secret`) |                                                                          |
| `CLICKHOUSE_PASSWORD`   | secret (`wrangler secret`) |                                                                          |

**Placeholder ids.** Every KV namespace id and D1 database id in
`wrangler.toml` is `REPLACE_ME_BEFORE_DEPLOY`. They are deliberately invalid so
a deploy with unfilled ids fails at the Cloudflare API rather than binding to
nothing. Fill them per environment before the first deploy (commands are in the
comment block at the top of `wrangler.toml`). Queues are referenced by name and
need no id. The local dev environment and the test pool work regardless of the
ids because miniflare provisions local KV / D1 / Queues.

## Local development

```bash
nx serve short-links-redirect        # wrangler dev on http://localhost:8788
```

`wrangler dev` runs against local miniflare KV / D1 / Queues, so there are no
records until you seed some. Apply the D1 schema and put a domain and a link:

```bash
cd workers/short-links-redirect
wrangler d1 migrations apply short-links-dev --local
wrangler kv key put --binding SHORT_LINKS_KV --local 'domain:localhost' \
  '{"v":1,"id":"d1","hostname":"localhost","redirectStatus":307,"fallbackTo":null,"notFound":"lostPage","passthroughOrigin":null,"reservedPaths":[],"slugCaseSensitive":true}'
wrangler kv key put --binding SHORT_LINKS_KV --local 'link:localhost/jesus' \
  '{"v":1,"id":"l1","to":"https://www.jesusfilm.org/watch/jesus.html","status":307,"fallbackTo":null,"paused":false,"assetClass":"standard","placement":null,"campaignIds":[],"videoId":null,"youtubeVideoId":null,"language":null}'
curl -i http://localhost:8788/jesus?utm_source=test
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

1. Create the KV namespace, the D1 database (apply `d1/0001_init.sql` with
   `wrangler d1 migrations apply <db> --env=<env> --remote`), the queue and its
   dead-letter queue, and the ClickHouse database/table (`clickhouse/0001_init.sql`).
2. Fill the ids into `wrangler.toml`, set `CLICKHOUSE_USER` / `CLICKHOUSE_PASSWORD`
   with `wrangler secret put`, deploy to stage.
3. Set api-media's `CLOUDFLARE_SHORT_LINKS_*` env vars and run
   `shortLinkDomainPublish` for the domain (backfills every live link).
4. Add the hostname as a custom domain of the Worker (uncomment / extend the
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

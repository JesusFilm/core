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
`KV_JESUS_FILM`, `stage.jesus.film` → `KV_STAGE_JESUS_FILM`), declared under
the environment that serves it in `wrangler.toml`. Adding one is a manual
step: see [Setting up a domain](#setting-up-a-domain). The dev (top-level)
section declares `KV_JESUS_FILM`, `KV_NXSTP_IS`, `KV_ARC_GT` and
`KV_STG_ARC_GT` for tests and `wrangler dev`; those are typed on `Env`, and any
other name works through the index signature.

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

### Setting up a domain

Cloudflare resources are created and wired by hand, with wrangler and
`wrangler.toml`; api-media never calls Cloudflare's control plane. Who does
what:

| Step                                              | Where                          | Who                           |
| ------------------------------------------------- | ------------------------------ | ----------------------------- |
| Create the domain's KV namespace                  | `wrangler kv namespace create` | whoever has Cloudflare access |
| Declare its binding and its route                 | `wrangler.toml`, then deploy   | a PR                          |
| Add the domain and enter the namespace id/binding | the admin app                  | a superAdmin                  |

Per environment, once (the ids go into `wrangler.toml`, commands at the top
of that file): the global namespace, the two queues, the ClickHouse database
and the `CLICKHOUSE_*` secrets.

Per domain, with `stage.jesus.film` on stage as the example:

```bash
cd workers/short-links-redirect
export CLOUDFLARE_ACCOUNT_ID=<Jesus Film Project account id>   # the login can see more than one account

# 1. the namespace; note the id it prints
pnpm exec wrangler kv namespace create short-links-stage-stage-jesus-film
```

```toml
# 2. wrangler.toml: bind it under the environment that serves the hostname
[[env.stage.kv_namespaces]]
binding = "KV_STAGE_JESUS_FILM"
id = "<id from step 1>"

# 3. wrangler.toml: route the hostname to the Worker. A path-prefixed domain is
# a zone route; a root domain (nxstp.is) is a custom domain. The hostname needs
# a proxied DNS record in a zone of this account; wrangler creates neither.
[env.stage]
routes = [{ pattern = "stage.jesus.film/s/*", zone_name = "jesus.film" }]
```

```bash
# 4. deploy (CI does this on a push to stage / main)
pnpm exec wrangler deploy --env=stage
```

5. In the admin app, as a superAdmin: Domains → **Add domain** (hostname,
   path prefix `s`), then on the domain page set **KV namespace id** to the id
   from step 1 and **Worker binding** to `KV_STAGE_JESUS_FILM`, and save.
   Saving publishes the domain record and every link into the namespace.

Until step 5 the Worker serves the domain through the api-media fallback and
logs `publish_gap` on every slug; after it, from KV.

Taking a domain down is the reverse: remove the route from `wrangler.toml` and
deploy (traffic stops reaching the Worker), clear the two fields in the admin
(the links stop being published), remove the binding and deploy, delete the
namespace, then remove the domain in the admin:

```bash
pnpm exec wrangler kv namespace delete --namespace-id <id>
```

Two rules:

- **Every route lives in `wrangler.toml`.** A deploy replaces the Worker's
  route set with what the config says, so a route added in the dashboard is
  deleted by the next deploy.
- **A binding missing from the config is removed by the next deploy.** The
  domain then logs `missing_binding` once per isolate and is served through the
  global namespace and api-media until the binding is declared again.

The first rollout is `jesus.film/s` and `jesus.movie/s`, proven first on
`stage.jesus.film/s` and `stage.jesus.movie/s` against the stage Worker. Their
stage namespaces exist and are bound; their routes are commented out in
`wrangler.toml` until the hostnames have DNS records.

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
(`--prod` on `main`), i.e. `wrangler deploy --env=stage` / `--env=prod` from this
directory with `CLOUDFLARE_API_TOKEN` from repository secrets.

Environment names: `short-links-redirect-dev` / `-stage` / `-prod`. Stage and
prod have `logpush = true` and observability logs enabled. wrangler warns on
every stage and prod deploy that the dev-only bindings (`KV_NXSTP_IS`, ...)
are not declared for that environment; that is expected until those domains
are cut over.

## Setting up ClickHouse

Scan events go to one ClickHouse Cloud service per environment
(`jfp-short-links-<env>`), managed by Terraform
(`infrastructure/modules/clickhouse/service`, called from each environment's
`main.tf`; stage first, prod once stage is proven). Terraform manages the service only; the apply publishes two values
into the `core` Doppler project (`stg` / `prd`):

| Doppler key                             | Value                                   |
| --------------------------------------- | --------------------------------------- |
| `SHORT_LINKS_CLICKHOUSE_URL`            | `https://<host>:8443`                   |
| `SHORT_LINKS_CLICKHOUSE_ADMIN_PASSWORD` | the `default` user's generated password |

Everything inside the service is created by hand, once per environment, as
the `default` user. Use the SQL console in the ClickHouse Cloud UI, or
`clickhouse client` (the HTTP interface runs one statement per request, so
`curl` would need the file split up):

```bash
clickhouse client --host <host> --port 9440 --secure --user default \
  --password "$SHORT_LINKS_CLICKHOUSE_ADMIN_PASSWORD" \
  --queries-file clickhouse/0001_init.sql
```

Then create the two users. Generate two passwords (12+ characters with upper,
lower, digit and symbol; `openssl rand -base64 24` does) and run:

```sql
-- the Worker: insert only, batched server-side
CREATE USER short_links_writer IDENTIFIED WITH sha256_password BY '<writer password>'
  SETTINGS async_insert = 1, wait_for_async_insert = 1;
GRANT INSERT ON redirects.redirect_events TO short_links_writer;

-- api-media: read only
CREATE USER short_links_reader IDENTIFIED WITH sha256_password BY '<reader password>';
GRANT SELECT ON redirects.* TO short_links_reader;
```

Wire them in:

1. **Worker.** Set `CLICKHOUSE_URL = "https://<host>:8443"` under the
   environment's `[vars]` in `wrangler.toml` (a PR; it is `""` until the service
   exists) and the writer as secrets:

   ```bash
   cd workers/short-links-redirect
   pnpm exec wrangler secret put CLICKHOUSE_USER --env=stage      # short_links_writer
   pnpm exec wrangler secret put CLICKHOUSE_PASSWORD --env=stage
   ```

   While `CLICKHOUSE_URL` is empty the queue consumer acknowledges and drops
   every event (logged as `clickhouse_unconfigured`).

2. **api-media.** In its Doppler config set `SHORT_LINKS_CLICKHOUSE_URL`
   (same value), `SHORT_LINKS_CLICKHOUSE_USER` (`short_links_reader`),
   `SHORT_LINKS_CLICKHOUSE_PASSWORD` and `SHORT_LINKS_CLICKHOUSE_DATABASE`
   (`redirects`), then add the four keys back to
   `apis/api-media/infrastructure/locals.tf` so they reach the container. Until
   then the admin's stats show zeros.

The service accepts connections from anywhere: Cloudflare Workers have no
fixed egress addresses, so there is nothing to allow-list. Protection is TLS,
the generated passwords and the two users' narrow grants. Stage idles after 15
quiet minutes (storage only is billed while paused); prod is always on.

## Cutover per domain

[Setting up a domain](#setting-up-a-domain) is the per-domain procedure; this
is the order across environments.

1. Once per environment: the global KV namespace, the queue and its
   dead-letter queue; fill the namespace id into `wrangler.toml`; deploy. Then
   [Setting up ClickHouse](#setting-up-clickhouse) once the Terraform apply has
   created the service.
2. Set api-media's `CLOUDFLARE_SHORT_LINKS_*` variables (Doppler).
3. Stage first: set `stage.jesus.film` and `stage.jesus.movie` up and prove the
   redirects, link edits and the `publish_gap` log there.
4. Prod: the same for `jesus.film` and `jesus.movie`.
5. Watch the `publish_gap` logs; zero is the goal.

nxstp.is and arc.gt are not part of the first rollout. As root domains they
become Workers custom domains (`{ pattern = "nxstp.is", custom_domain = true }`),
which Cloudflare refuses while the hostname still has DNS records pointing at
the legacy app; for arc.gt the domain is configured with
`notFound = passthrough`, `passthroughOrigin = https://api.arclight.org`,
`redirectStatus = 302`, `reservedPaths = [s, hls, dl, dh, v2, api]`.

## Failure order

| Down                  | Effect                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ClickHouse or Queues  | Redirects continue; events delay (retries, then DLQ) or drop.                                                                        |
| api-media or Postgres | Known links redirect from the last published records; unknown paths get the not-found behaviour.                                     |
| KV                    | Every redirect goes through api-media (2 s timeout) and is written back; with api-media also down, uncached hosts get the lost page. |
| Worker                | Nothing on the cut-over domains resolves. This is the one component with the 99.99% availability target.                             |

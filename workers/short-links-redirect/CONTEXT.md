# Short Links Redirect (edge redirect worker)

The Cloudflare Worker that serves every short-link domain (`workers/short-links-redirect`): reads a Routing Record from the Edge Store, applies the domain's Not-Found Behaviour, redirects with UTM pass-through and QR Attribution, and enqueues a Redirect Event that its own queue consumer batches into ClickHouse. Owns no product entities — the Media context's `ShortLink` / `ShortLinkDomain` are the source of truth and api-media publishes projections of them here. Contract: `prds/short-links/TECH-DESIGN.md`.

## Language

**Routing Record**:
The compact, versioned (`v: 1`) JSON projection of one short link that api-media publishes — as `<pathname>` in its domain's Domain Namespace, and as `link:<pathname>` in the Global Namespace when it is a Global Link: the destination `to`, the link's own `status` and `fallbackTo` overrides (null means "use the serving domain's"), `paused`, `global`, the owning `hostname`, and the analytics dimensions (asset class, placement, campaign ids, video ids, language). The Worker never derives these from the database; it only reads what was published.
_Avoid_: short link (that's the Media entity), link config

**Domain Record**:
The versioned JSON projection of one `ShortLinkDomain` under `domain:<hostname>` in the Global Namespace: `redirectStatus`, `notFound`, `fallbackTo`, `passthroughOrigin`, `reservedPaths`, `slugCaseSensitive`, `pathPrefix`, `kvBinding` (the name of its Domain Namespace binding, or null). Cached per isolate for 60 s. When KV has no record the Worker asks api-media (`shortLinkDomainByHostname`) and writes the answer back; a host neither knows is a lost page.
_Avoid_: tenant, zone (that's Cloudflare's DNS zone)

**Path Prefix**:
The path a domain's short links live under, carried on the Domain Record as `pathPrefix` without leading or trailing slashes (`s` for `jesus.film`, so short URLs are `https://jesus.film/s/<slug>`; empty for root domains such as nxstp.is and arc.gt). A request outside the prefix, or for the prefix alone, gets the Not-Found Behaviour. The prefix belongs to the hostname, never to the link: Edge Store keys and the Redirect Event's `pathname` hold the bare slug. A record with no `pathPrefix` is a root domain.
_Avoid_: base path, route (that's the Cloudflare route pattern `jesus.film/s/*`), namespace

**Edge Store**:
The read path for records, in order — the Domain Namespace (`<slug>`), the Global Namespace (`link:<slug>`), api-media's `shortLinkByPath` last. Each tier stamps the Redirect Event's `resolvedFrom` (`kv`, `kv-global`, `api`). Workers KV is the only edge store: api-media writes it on every publish, and the Worker reads it and writes to it only to heal a Publish Gap. There is no replica; api-media is the fallback when KV misses or cannot be read. A record with an unrecognised `v` is a miss for that tier, never an error.
_Avoid_: cache (KV is the primary serving store, not a cache of api-media), replica, database

**Domain Namespace**:
A domain's own Workers KV namespace, holding only its Routing Records keyed by bare slug. The Worker reaches it through the binding named in the Domain Record (`env[domain.kvBinding]`, e.g. `KV_JESUS_FILM`); every domain has one binding ("one binding per domain"), named `KV_<HOSTNAME>`. On stage and prod api-media adds and removes these on the live Worker through the Cloudflare API for a superAdmin, and the deploy script carries them over; only the dev section of `wrangler.toml` declares any. A domain with a null `kvBinding` has no namespace and is served by the remaining tiers; a binding named on the record but absent from the deploy is a Missing Binding, logged once per isolate and skipped.
_Avoid_: tenant store, per-domain cache, KV (ambiguous with the Global Namespace)

**Global Namespace**:
The one Workers KV namespace per environment (`SHORT_LINKS_KV`) holding every Domain Record and every Global Link (`link:<slug>`). It is the second tier for links and the only KV tier for domains.
_Avoid_: default namespace, shared KV

**Global Link**:
A short link flagged `global` in api-media: it keeps its own domain (its canonical short URL) and additionally resolves on every other domain that has no link of its own for the same slug. Global slugs are unique across all domains, lower-case, and never reissued. Served on another domain it takes that domain's `redirectStatus` (its record carries only its own overrides) and the Redirect Event reports both the serving `hostname` and the `ownerHostname`.
_Avoid_: shared link, wildcard, alias (nothing is aliased; the same record is read from a different namespace)

**Not-Found Behaviour**:
What a domain does with traffic that resolves to no link — an empty, nested, reserved, malformed or unknown path, or a paused link with no fallback: `lostPage` (the inline 404), `fallback` (redirect to the domain's `fallbackTo`), or `passthrough` (hand the original path and query to `passthroughOrigin`). Chosen per Domain Record, never per request.
_Avoid_: 404 handling (fallback and passthrough are not 404s), catch-all

**Passthrough / arc.gt Handoff**:
The `passthrough` Not-Found Behaviour as arc.gt uses it: reserved first segments (`s`, `hls`, `dl`, `dh`, `v2`, `api`) and unknown slugs are 302'd to `https://api.arclight.org` with the raw path and query intact, so the Arclight API keeps answering everything that is not a keyword slug. Brightcove-backed keyword links are published with `to = <passthroughOrigin>/<pathname>` for the same reason (one hop, same as today).
_Avoid_: proxy (the Worker redirects, it does not fetch on the visitor's behalf), fallback (that's the `fallback` behaviour, a different destination)

**Publish Gap**:
A link (or a domain's settings) that exists in api-media but not in KV — the miss that reaches the api-media tier. The Worker heals it (writes the converted Routing Record back, in `waitUntil`, to the Domain Namespace when the link belongs to the serving domain and the binding exists, else to the Global Namespace when it is a Global Link, else nowhere) and logs `{"event":"publish_gap","key":...,"target":...}`; the count of these is the health signal for api-media's publishing. Zero is the goal.
_Avoid_: cache miss, cold start

**Redirect Event**:
The versioned queue message the Worker sends after every record-backed redirect (`link` or `linkFallback`; domain fallbacks and passthroughs send nothing): hostname, pathname, link and campaign ids, destination, status, Attribution, country (from `request.cf`), the raw user agent, referrer host, language, UTMs, `resolvedFrom` (`kv` / `kv-global` / `api`), `global` and `ownerHostname`. The consumer parses the user agent into device class / OS / browser and drops it; no IP is ever on the queue.
_Avoid_: click (QR scans are not clicks), page view, analytics row (that's the ClickHouse projection of it)

**Attribution**:
How the visitor reached the short URL, as far as the edge can tell: `qr` when the `qr` query parameter is present (QR images encode `?qr=1`; the parameter is stripped before redirecting), `unknown` when there is no user agent at all, otherwise `direct` — whether or not a Referer exists (the referrer host is recorded separately).
_Avoid_: source (that's `utm_source`), channel

## Terminology traps

- **hostname vs baseUrl**: records and keys use the bare lower-case `hostname` (`arc.gt`, port stripped). The URL a visitor sees (`https://arc.gt/abc`) is a short URL; there is no "baseUrl" concept in this worker.
- **request path vs pathname**: on a prefixed domain the request path is `/s/abc` but the `pathname` everywhere else (keys, records, events, the api-media fallback) is `abc`. Only passthrough ever forwards the full request path.
- **pathname vs keyword vs slug**: `pathname` is the record term (what api-media minted, no leading slash). Arclight calls the same thing a keyword; the PRD and the grammar check call it a slug. All three name the single path segment after the host. On a case-insensitive domain the lookup pathname is lower-cased; the request path is not otherwise normalised.
- **status**: on a Routing Record it is the link's own HTTP redirect status override (301/302/307/308) or null; the Worker resolves `record.status ?? domain.redirectStatus ?? 307` at request time so a Global Link takes the serving domain's default. `paused` is a separate boolean; the Media context's `ShortLinkStatus` enum (`active` / `paused` / `retired`) never appears at the edge.
- **hostname on a record vs the request host**: `record.hostname` is the owning domain (reported as `ownerHostname`); the Redirect Event's `hostname` is the domain that served the request. They differ only for a Global Link served elsewhere.
- **kvBinding vs kvNamespaceId**: the Domain Record carries only `kvBinding`, the Worker-side binding name. The namespace id (`kvNamespaceId`) is api-media's concern for publishing and never reaches the Worker except through `wrangler.toml`.
- **fallback**: three different things — a paused link's own `fallbackTo` (source `linkFallback`), the domain's `fallbackTo` (source `domainFallback`), and the `fallback` Not-Found Behaviour (which also targets the domain's `fallbackTo`). Passthrough is none of them.

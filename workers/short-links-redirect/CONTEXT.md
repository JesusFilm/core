# Short Links Redirect (edge redirect worker)

The Cloudflare Worker that serves every short-link domain (`workers/short-links-redirect`): reads a Routing Record from the Edge Store, applies the domain's Not-Found Behaviour, redirects with UTM pass-through and QR Attribution, and enqueues a Redirect Event that its own queue consumer batches into ClickHouse. Owns no product entities — the Media context's `ShortLink` / `ShortLinkDomain` are the source of truth and api-media publishes projections of them here. Contract: `prds/short-links/TECH-DESIGN.md`.

## Language

**Routing Record**:
The compact, versioned (`v: 1`) JSON projection of one short link that api-media publishes under `link:<hostname>/<pathname>`: the effective destination `to`, the effective `status`, `paused`, `fallbackTo`, and the analytics dimensions (asset class, placement, campaign ids, video ids, language). The Worker never derives these from the database; it only reads what was published.
_Avoid_: short link (that's the Media entity), link config

**Domain Record**:
The versioned JSON projection of one `ShortLinkDomain` under `domain:<hostname>`: `redirectStatus`, `notFound`, `fallbackTo`, `passthroughOrigin`, `reservedPaths`, `slugCaseSensitive`, `pathPrefix`. Cached per isolate for 60 s; an unknown host is a lost page.
_Avoid_: tenant, zone (that's Cloudflare's DNS zone)

**Path Prefix**:
The path a domain's short links live under, carried on the Domain Record as `pathPrefix` without leading or trailing slashes (`s` for `jesus.film`, so short URLs are `https://jesus.film/s/<slug>`; empty for root domains such as nxstp.is and arc.gt). A request outside the prefix, or for the prefix alone, gets the Not-Found Behaviour. The prefix belongs to the hostname, never to the link: Edge Store keys and the Redirect Event's `pathname` hold the bare slug. A record with no `pathPrefix` is a root domain.
_Avoid_: base path, route (that's the Cloudflare route pattern `jesus.film/s/*`), namespace

**Edge Store**:
The three-tier read path for records — Workers KV first, the D1 replica on a KV miss, api-media's `shortLinkByPath` on a double miss. api-media writes KV and D1 in the same publish call; the Worker only ever reads them. A record with an unrecognised `v` is a miss for that tier, never an error.
_Avoid_: cache (KV is the primary serving store, not a cache of api-media), database (D1 is a replica)

**Not-Found Behaviour**:
What a domain does with traffic that resolves to no link — an empty, nested, reserved, malformed or unknown path, or a paused link with no fallback: `lostPage` (the inline 404), `fallback` (redirect to the domain's `fallbackTo`), or `passthrough` (hand the original path and query to `passthroughOrigin`). Chosen per Domain Record, never per request.
_Avoid_: 404 handling (fallback and passthrough are not 404s), catch-all

**Passthrough / arc.gt Handoff**:
The `passthrough` Not-Found Behaviour as arc.gt uses it: reserved first segments (`s`, `hls`, `dl`, `dh`, `v2`, `api`) and unknown slugs are 302'd to `https://api.arclight.org` with the raw path and query intact, so the Arclight API keeps answering everything that is not a keyword slug. Brightcove-backed keyword links are published with `to = <passthroughOrigin>/<pathname>` for the same reason (one hop, same as today).
_Avoid_: proxy (the Worker redirects, it does not fetch on the visitor's behalf), fallback (that's the `fallback` behaviour, a different destination)

**Publish Gap**:
A link that exists in api-media but not in KV or D1 — the double miss that reaches the api-media tier. The Worker heals it (writes the converted Routing Record back to KV in `waitUntil`) and logs `{"event":"publish_gap"}`; the count of these is the health signal for api-media's publishing. Zero is the goal.
_Avoid_: cache miss, cold start

**Redirect Event**:
The versioned queue message the Worker sends after every record-backed redirect (`link` or `linkFallback`; domain fallbacks and passthroughs send nothing): hostname, pathname, link and campaign ids, destination, status, Attribution, country (from `request.cf`), the raw user agent, referrer host, language, UTMs and `resolvedFrom` (`kv` / `d1` / `api`). The consumer parses the user agent into device class / OS / browser and drops it; no IP is ever on the queue.
_Avoid_: click (QR scans are not clicks), page view, analytics row (that's the ClickHouse projection of it)

**Attribution**:
How the visitor reached the short URL, as far as the edge can tell: `qr` when the `qr` query parameter is present (QR images encode `?qr=1`; the parameter is stripped before redirecting), `unknown` when there is no user agent at all, otherwise `direct` — whether or not a Referer exists (the referrer host is recorded separately).
_Avoid_: source (that's `utm_source`), channel

## Terminology traps

- **hostname vs baseUrl**: records and keys use the bare lower-case `hostname` (`arc.gt`, port stripped). The URL a visitor sees (`https://arc.gt/abc`) is a short URL; there is no "baseUrl" concept in this worker.
- **request path vs pathname**: on a prefixed domain the request path is `/s/abc` but the `pathname` everywhere else (keys, records, events, the api-media fallback) is `abc`. Only passthrough ever forwards the full request path.
- **pathname vs keyword vs slug**: `pathname` is the record term (what api-media minted, no leading slash). Arclight calls the same thing a keyword; the PRD and the grammar check call it a slug. All three name the single path segment after the host. On a case-insensitive domain the lookup pathname is lower-cased; the request path is not otherwise normalised.
- **status**: on a Routing Record it is the HTTP redirect status (301/302/307/308), already resolved by api-media from the link override or the domain default. `paused` is a separate boolean; the Media context's `ShortLinkStatus` enum (`active` / `paused` / `retired`) never appears at the edge.
- **fallback**: three different things — a paused link's own `fallbackTo` (source `linkFallback`), the domain's `fallbackTo` (source `domainFallback`), and the `fallback` Not-Found Behaviour (which also targets the domain's `fallbackTo`). Passthrough is none of them.

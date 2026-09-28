# PRD: Short Links, QR Codes, and Edge Redirects

Source: "PRD: YouTube Short Links & QR Codes" (Mike Allison, 2026-09-23), widened
to cover arc.gt and the core URL shortener so one service serves every
JFP short-link domain. Technical contracts live in `TECH-DESIGN.md`.

## Problem

The YouTube team needs measurable campaign links and on-screen QR codes for
videos, descriptions, end screens, and community posts. Today it gets them from
third-party tools (Switchy, QR Code Kit, QR Code Generator) and a handful of
nxstp.is links minted through core. None of these gives the team one place to
create a link, download its QR, change its destination later, and see scans.

A QR code burned into a published video cannot change. The URL it encodes must
keep resolving for years while the destination moves. Third-party tools tie that
permanence to a subscription and a domain JFP does not own.

Core already owns two redirect surfaces over the same `ShortLink` entities:
`apps/short-links` (nxstp.is and Journeys' QR flow, a Next.js app on Vercel that
answers every redirect from Postgres through the gateway) and the Arclight API's
keyword route (arc.gt, reached by a wholesale redirect from that same app).
Neither is edge-served, neither survives a control-plane outage, and neither
records scans.

## Scope

One service, three tenants: the new YouTube domain, nxstp.is, and arc.gt /
stg.arc.gt.

In scope

- New fields on the existing media-context `ShortLink` and `ShortLinkDomain`
  models (asset class, status, per-link overrides, placement, campaigns,
  destination history, soft delete, slug grammar, reserved paths, not-found
  behaviour, passthrough for arc.gt).
- A Cloudflare Worker (`workers/short-links-redirect`) that serves every
  redirect from KV with a D1 replica and an api-media lookup on a double miss.
- api-media publishes routing records to the edge on every write; the mutation
  fails if KV rejects it.
- Server-side QR rendering (PNG and SVG) that encodes the short URL, never the
  destination.
- Non-blocking scan analytics (Queue → ClickHouse) with per-link, per-campaign,
  per-video, per-placement reporting.
- Permanent-asset protection for links embedded in published videos.
- A new admin app (`apps/short-links-admin`) using core's existing auth.
- Campaigns, bulk pause / retag, destination health checks with opt-in
  failover, and a per-link destination history that doubles as the audit log.
- Roles: `shortLinkEditor` (links, campaigns) and `shortLinkAdmin` (domain
  settings, protected assets, republishing). `publisher` keeps its existing
  powers.

Out of scope for this version

- getmynextstep.com and its 200,000+ printed parameter URLs. Nothing here
  imports, replaces, or depends on it.
- Retiring `apps/short-links` or the Arclight keyword route. Both keep running;
  the Worker takes a domain over one at a time by DNS / route configuration.
- Migrating existing Switchy, QR Code Kit, or QR Code Generator links.
- A/B testing, weighted routing, scheduled destination changes, webhooks, bulk
  import, partner API keys, `ShortLinkRule` smart routing (Phase 4 of the
  original PRD).

## Architecture

See `TECH-DESIGN.md`. In one line: the admin app and every existing minting
client write through api-media; api-media publishes a compact routing record to
KV and D1; the Worker resolves from the edge store, redirects, and enqueues a
click event after the response; a consumer batches events into ClickHouse;
api-media reads ClickHouse for the dashboard.

## Requirements by phase

### Phase 1: Redirect core, links, QR codes — delivered in this change

- Data model, migration, Pothos schema, protection rules enforced server-side.
- api-media publishes to KV and D1 synchronously on every write.
- Worker: KV lookup, D1 fallback, api-media lookup on a double miss with KV
  write-back, per-domain not-found behaviour (lost page / fallback /
  passthrough), per-domain and per-link status code, reserved paths, UTM
  pass-through, QR attribution via `?qr=1`, click event to the queue in
  `waitUntil`.
- QR rendering: PNG and SVG, configurable size, error correction (H for
  `videoEmbedded`, M otherwise), quiet zone, contrast warning below 3:1.
- Admin app: sign-in with core's auth; link list with search and filters;
  create and edit; QR download; destination history; Test Redirect.

Done when: a `videoEmbedded` link is created, its QR downloaded as SVG, its
destination changed by an admin with a note, history shows both values, and an
editor attempting the same change is refused server-side. Killing api-media in
stage changes nothing about redirects for published links. Load and latency
targets (P50 < 50 ms, P95 < 100 ms, P99 < 250 ms at 500 req/s sustained) are
verified after the first stage deploy; incident.io alerts for Worker latency,
error rate and 5xx are configured then.

### Phase 2: Analytics — delivered in this change

- Queue consumer batching inserts into ClickHouse; country from `cf.country`;
  device class, OS, and browser parsed in the consumer; no raw IP or UA stored.
- GraphQL aggregates: scans over time, by link, campaign, country, device,
  placement, referrer, attribution, for a date range.
- Dashboard in the app: per-link and per-campaign views, CSV export.

Done when: a scan of a Phase 1 QR appears in the dashboard within 60 seconds,
attributed as QR, with country and device class populated.

### Phase 3: Campaigns, governance, health — delivered in this change

- Campaigns with date range and owner; links in many campaigns; bulk pause and
  bulk retag.
- Hourly destination health check (HEAD, then GET on failure) recording
  notFound / serverError / timeout / dns / tls / redirectLoop; alert to a Slack
  channel when configured; automatic failover to `fallbackTo` only when the
  domain opts in and never for `videoEmbedded`.
- Destination history on every change to `to`.

### Deferred

`ShortLinkRule` smart routing, outcome joins, service API keys for partners,
QR branding, scheduled destination changes.

## Success metrics

| Metric                | Target                                                    | Where measured                                 |
| --------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| Redirect latency      | P50 < 50 ms, P95 < 100 ms, P99 < 250 ms                   | Cloudflare Worker analytics                    |
| Redirect availability | 99.99% monthly                                            | Synthetic probe every 30 s; incident.io SLO    |
| Redirect independence | 100% of redirects succeed during a control-plane outage   | Quarterly chaos drill in stage                 |
| Event completeness    | Events in ClickHouse within 60 s, 99.9% of redirects      | Worker request count vs ClickHouse row count   |
| Adoption              | No new links in Switchy / QR Code Kit / QR Code Generator | Subscription review                            |
| Permanence            | Zero reissued pathnames, ever                             | `@@unique([pathname, domainId])` + soft delete |

## Open questions

- [x] Domain name: `jesus.film`. Short links live at `https://jesus.film/s/<pathname>`. The admin app is reached on its own `vercel.app` URL. See "Path prefix" in `TECH-DESIGN.md`.
- [ ] Which YouTube channels and staff are the first users.
- [ ] Slug grammar for the YouTube domain. Proposal: `[a-z0-9-]{3,32}`, case-insensitive, 8-character generated default. The domain settings support this without code changes.
- [ ] Confirm Cloudflare KV and Queues write limits against the expected publish rate.
- [ ] Health-check interval (hourly by default) and whether HEAD is acceptable to the destinations the team uses.
- [ ] When to cut nxstp.is and arc.gt over from `apps/short-links` to the Worker.

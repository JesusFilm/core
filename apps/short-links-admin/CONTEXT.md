# Short Links Admin

The staff surface for the short-link service: one place to mint links, download QR codes, change destinations, run campaigns, and see scans. Owns no entities — ShortLink, ShortLinkDomain, ShortLinkCampaign, destination history and scan statistics all live in the media context (api-media) and are read and written through the gateway. The app enforces nothing on its own: every role gate it draws in the UI is also enforced by api-media's resolvers.

## Language

**Short Link**:
A `pathname` on a Short Link Domain that redirects to a Destination. Identified by its short URL (`https://<hostname>/<pathname>`). The pathname is immutable once minted; a deleted link keeps its pathname reserved (soft delete) so a printed QR never resolves to something else.
_Avoid_: Shortened URL, redirect record, slug (that is the pathname's grammar, not the link)

**Destination**:
The fully-qualified URL a Short Link redirects to (the entity's `to` field). Every change to it writes a Destination History row. Changing it is the one action that the Asset Class protects.
_Avoid_: Target, forward URL

**Asset Class**:
How much protection a Short Link's Destination gets: `standard` (any editor may change it), `permanent` (admin only, confirmation required), `videoEmbedded` (admin only, confirmation and a change note required, never auto-failed-over, QR error correction defaults to H). Chosen at creation from where the link will be printed or embedded.
_Avoid_: Type, tier, "protected link" (say which class)

**Placement**:
Where on YouTube a Short Link is used: `description`, `endScreen`, `card`, `communityPost`, `inVideoQr`, `other`. A reporting dimension, not a routing one.
_Avoid_: Location, position, channel

**Campaign**:
A named grouping of Short Links with an optional date range, tags and owner, used to read scans across many links at once. A link may belong to many Campaigns; a Campaign owns no link.
_Avoid_: Project, folder, UTM campaign (the UTM value is a query parameter that passes through the redirect untouched)

**Destination History**:
The per-link audit log of Destination changes: from, to, who, when, and the change note. Written by api-media on every change to `to`; this app only reads it.
_Avoid_: Audit log (ambiguous — nothing else is logged here), version history

**Test Redirect**:
The `/test` page: resolves a hostname + pathname through `shortLinkResolve`, which mirrors the Worker's lookup, and shows found / status / location / source and the matched link. It never issues a real redirect and never records a scan.
_Avoid_: Preview, debugger

**QR Code**:
An image (PNG or SVG) rendered by this app's own `/api/qr` route. It always encodes the link's `qrUrl` — the short URL with `?qr=1` — never the Destination, so scans are attributed as QR and the printed code keeps working when the Destination changes. Size, error correction, quiet zone and colours are print choices, not link properties.
_Avoid_: QR link (the link is the Short Link; the QR is one rendering of it)

**Editor / Admin**:
The two role levels. Editor (`shortLinkEditor`, or `shortLinkAdmin`, or `publisher`) manages links and campaigns. Admin (`shortLinkAdmin` or `publisher`) additionally edits Domain settings, changes protected Destinations, and republishes to the edge. `publisher` keeps its existing powers; it is not a third level.
_Avoid_: Owner, superuser, "publisher role" when you mean admin

**Base Path**:
Where this app is mounted: `/s/dashboard`, so production is `https://jesus.film/s/dashboard` and local dev is `http://localhost:4800/s/dashboard`. The edge Worker proxies that path to this app's Vercel deployment. Next.js adds it to links, navigation and its own assets; the app adds it by hand (`withBasePath`) to `fetch` calls to its own `/api/*` routes and to the `/api/qr` image URLs.
_Avoid_: Prefix (that is the domain's Path Prefix), mount point, sub-path

**Path Prefix**:
The path a Short Link Domain's links live under, without slashes (`s` for `jesus.film`, so links are `https://jesus.film/s/<pathname>`). Empty means the domain serves links from its root, as nxstp.is and arc.gt do. It is part of the short URL but never part of the Pathname. Shown as `hostname/prefix` wherever a domain is chosen.
_Avoid_: Base path, folder, namespace

**Republish**:
Rewriting a link's (or a whole domain's) routing record to the edge store. A repair action for publish gaps or cutovers, not part of the normal save flow — every ordinary mutation already publishes.
_Avoid_: Deploy, sync, refresh

### Terminology traps

**Path prefix vs base path**:
Path Prefix is a property of a Short Link Domain, stored in the media context and editable on the Domains page: it decides where that domain's links live. Base Path is where this app is mounted and is fixed in `next.config.js`. They share the `/s` segment on `jesus.film` only because the dashboard sits under the link prefix (`dashboard` is a reserved path there); changing one never changes the other.

**Status vs redirect status**:
`status` is the link's lifecycle (`active`, `paused`, `retired`); `redirectStatus` is the HTTP code (301/302/307/308) the edge answers with, set per domain with an optional per-link override. "Change the status" is ambiguous — say lifecycle or HTTP code.

**Hostname vs domain**:
The Domain is the entity (with slug grammar, reserved paths, not-found behaviour); the hostname is its string key. The links list filters by hostname; the Domains page edits Domains.

**Health**:
`healthStatus` is the last hourly destination check, not the link's lifecycle. A `paused` link can be healthy and an `active` one can be `notFound`. Failover (health check pausing a link) only happens when the Domain opts in and never for `videoEmbedded`.

**Fallback**:
`fallbackTo` on a link is where its traffic goes while it is paused; `fallbackTo` on a domain is where unresolved traffic goes when `notFound = fallback` and where paused links without their own fallback go. Name the level.

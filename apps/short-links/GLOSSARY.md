# Short Links

The public redirect surface: serves every Short Link Domain from one deployment, resolves an inbound hostname + path to a media-context **ShortLink**, and redirects the visitor to its destination. Owns no entities — ShortLink, ShortLinkDomain, and the blocklist live in the media context; this app is a read-only client of one gateway query.

## Language

**Short Link**:
The media-context entity this surface resolves: a `pathname` on a Short Link Domain that redirects to a destination URL. This app reads only the destination; the video-delivery fields on the same entity (Brightcove id, redirect type, bitrate) belong to Arclight's flow and are ignored here.
_Avoid_: Shortened URL, redirect record

**Short Link Domain**:
A hostname this deployment answers for. Many domains are served by one app; the domain is part of the link's identity (path uniqueness is per-domain). Subdomains share an Apex, and blocklisting and service permissions operate at domain granularity.
_Avoid_: Site, host (ambiguous — see the hostname trap)

**Destination**:
The fully-qualified URL a Short Link redirects to (the entity's `to` field). Distinct from the Pathname, which is the short side.
_Avoid_: Target, forward URL

**Pathname**:
The path portion of a short URL, stored and queried without a leading slash. Unique per Short Link Domain, not globally.
_Avoid_: Slug, keyword (Arclight's word for its own short links)

**Service**:
The subgraph that minted a Short Link (e.g. apiJourneys, apiMedia). A Short Link Domain whitelists which Services may create links on it; a link with no owning user was created by a Service.
_Avoid_: App, source

**Arc.gt Handoff**:
The special-casing of the `arc.gt` domains: this surface does not resolve them, it redirects the whole request to the Arclight API, which runs its own Keyword Short Link resolution over the same media-owned entities. The two redirect surfaces are complementary, not duplicates.

**Lost Page**:
The branded not-found page ("We've Lost This Page") shown when no Short Link matches the hostname + Pathname.
_Avoid_: 404 page (imprecise — reserved paths never reach resolution at all)

### Terminology traps

**Hostname (synthetic segment)**:
Inside the app, the hostname appears as the first URL path segment — injected by the proxy rewrite so the lookup can key on it. It is not the literal HTTP Host of the app route; when discussing routing, say whether you mean the real request host or the rewritten segment.

**Redirect status**:
This surface uses Next.js's default temporary redirect (307), while Arclight's keyword surface issues explicit 302s. "The short link redirects" hides that difference — name the surface when the status code matters.

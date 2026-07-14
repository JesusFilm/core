# JF Proxy (edge routing worker)

The Cloudflare Worker on the `jesusfilm.org` zone (`workers/jf-proxy`): claims specific path sections of the public domain via Route Patterns and proxies them to the Vercel-hosted surfaces, gates the new `/watch` experience behind the Experimental Cookie, and serves the mobile apps' App Association Files. Owns no product entities; pure edge plumbing.

## Language

**Route Pattern**:
A claimed section of the `jesusfilm.org` domain (`/watch*`, `/journeys*`, `/resources`, `/bin/*`, `/api/*`…) that Cloudflare hands to this worker. Paths outside the patterns never reach the worker — the rest of the site is served by whatever else owns the zone.
_Avoid_: route (ambiguous with in-app routing), path rule

**Proxy Destination**:
The upstream hostname a request is rewritten to — one for the Resources surface (the default for everything) and one for the Watch surface. Requests pass through with method, headers, and cookies intact.
_Avoid_: origin, backend

**Experimental Cookie**:
The opt-in gate for the next-generation `/watch`: a request under `/watch` carrying an `EXPERIMENTAL` cookie goes to the Watch Proxy Destination; without it, `/watch` goes to the default Resources destination like everything else. The cookie affects routing only under `/watch`.
_Avoid_: feature flag (that word belongs to Shared UI's LaunchDarkly flags), beta cookie

**Error Fallback**:
The recovery behaviour when the upstream answers 404 or 500: the worker retries the same host for the custom not-found page, degrading to a plain error response if that also fails.
_Avoid_: failover (nothing switches hosts), error page redirect

**App Association Files**:
The well-known JSON documents (`apple-app-site-association`, `assetlinks.json`) the worker synthesizes from configuration so the iOS and Android apps can claim `jesusfilm.org` links as deep links.
_Avoid_: deep-link config, universal links file (that's the iOS-only half)

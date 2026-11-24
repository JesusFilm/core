-- Data change (additive, idempotent): encode the arc.gt handoff in the domain
-- rows so the edge Worker reproduces today's behaviour the moment those
-- hostnames are pointed at it.
--
-- Until now `apps/short-links` redirected every arc.gt / stg.arc.gt request
-- wholesale to the Arclight API (302), which resolved keyword short links and
-- its legacy `/s`, `/hls`, `/dl`, `/dh` endpoints itself. At the edge, keyword
-- short links are answered from the routing records and everything else
-- (legacy endpoints, unknown keywords, `/v2/...`) is passed through to the same
-- origin with its path and query intact.
--
-- Rows that do not exist yet in an environment are simply not touched; the
-- settings are also editable in the short-links-admin app.
UPDATE "ShortLinkDomain"
SET "redirectStatus"    = 302,
    "notFound"          = 'passthrough'::"ShortLinkNotFound",
    "passthroughOrigin" = 'https://api.arclight.org',
    "reservedPaths"     = ARRAY['s', 'hls', 'dl', 'dh', 'v2', 'api', 'docs', 'health']::TEXT[],
    "slugAllowedChars"  = 'A-Za-z0-9_-',
    "slugMinLength"     = 3,
    "slugMaxLength"     = 32,
    "updatedAt"         = CURRENT_TIMESTAMP
WHERE "hostname" IN ('arc.gt', 'core.arc.gt');

UPDATE "ShortLinkDomain"
SET "redirectStatus"    = 302,
    "notFound"          = 'passthrough'::"ShortLinkNotFound",
    "passthroughOrigin" = 'https://core-stage.arclight.org',
    "reservedPaths"     = ARRAY['s', 'hls', 'dl', 'dh', 'v2', 'api', 'docs', 'health']::TEXT[],
    "slugAllowedChars"  = 'A-Za-z0-9_-',
    "slugMinLength"     = 3,
    "slugMaxLength"     = 32,
    "updatedAt"         = CURRENT_TIMESTAMP
WHERE "hostname" = 'stg.arc.gt';

-- nxstp.is keeps Next.js' temporary redirect (307) and its permissive grammar
-- (Journeys mints nanoid pathnames); only the paths the admin app and the
-- Worker claim are reserved.
UPDATE "ShortLinkDomain"
SET "reservedPaths" = ARRAY['api', 'admin', '.well-known', 'favicon.ico', 'robots.txt']::TEXT[],
    "updatedAt"     = CURRENT_TIMESTAMP
WHERE "hostname" = 'nxstp.is'
  AND cardinality("reservedPaths") = 0;

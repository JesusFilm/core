-- AlterTable
-- Path the short links live under on a hostname, without leading or trailing
-- slashes. Empty (the default) keeps every existing domain at the root.
ALTER TABLE "ShortLinkDomain" ADD COLUMN     "pathPrefix" TEXT NOT NULL DEFAULT '';

-- Data change (additive, idempotent): the first domain of the edge short-link
-- service. Short links live at https://jesus.film/s/<pathname>. The admin app
-- is a separate Vercel deployment on its own vercel.app URL; `dashboard` and
-- `admin` stay reserved so those paths remain free if that ever changes.
--
-- Inserted here rather than through `shortLinkDomainCreate` because that
-- mutation registers the hostname on the Vercel short-links project, and this
-- domain is served by the Cloudflare Worker instead.
--
-- An empty `services` array means every service may mint on this domain.
INSERT INTO "ShortLinkDomain" (
  "id",
  "hostname",
  "apexName",
  "services",
  "pathPrefix",
  "redirectStatus",
  "slugAllowedChars",
  "slugMinLength",
  "slugMaxLength",
  "slugCaseSensitive",
  "reservedPaths",
  "fallbackTo",
  "notFound",
  "updatedAt"
)
VALUES (
  'b1f0c3a2-6d4e-4f7a-9c1b-5e2a8d7f3c10',
  'jesus.film',
  'jesus.film',
  ARRAY[]::"Service"[],
  's',
  307,
  'a-z0-9-',
  3,
  32,
  false,
  ARRAY['dashboard', 'api', 'admin', '_next', '.well-known', 'favicon.ico', 'robots.txt']::TEXT[],
  'https://www.jesusfilm.org',
  'fallback'::"ShortLinkNotFound",
  CURRENT_TIMESTAMP
)
ON CONFLICT ("hostname") DO NOTHING;

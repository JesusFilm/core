-- The shared-link slug of each Campaign's own Plausible site, filled by the
-- plausible worker when it creates the site.
ALTER TABLE "Campaign" ADD COLUMN "plausibleToken" TEXT;

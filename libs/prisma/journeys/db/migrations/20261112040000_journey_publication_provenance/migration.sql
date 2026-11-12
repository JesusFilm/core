BEGIN;

ALTER TABLE "Journey" ADD COLUMN "firstPublishedAt" TIMESTAMP(3);

-- A restore also wrote publishedAt in older applications. Non-published rows
-- with that timestamp are ambiguous, not proof of deliberate publication.
-- Current published rows remain publicly delivered during the rollout.
UPDATE "Journey"
SET "firstPublishedAt" = COALESCE("publishedAt", CURRENT_TIMESTAMP)
WHERE "status" = 'published';

-- Preserve the fence across a rollback to an older writer: it cannot promote
-- a never-published row just by changing status/publishedAt during restore.
CREATE FUNCTION journey_publication_provenance_guard() RETURNS trigger AS $$
BEGIN
  -- Existing Admin creation and fixture seeds intentionally create published
  -- rows. Preserve that policy without letting an UPDATE restore publish one.
  IF TG_OP = 'INSERT' AND NEW."status" = 'published'
     AND NEW."firstPublishedAt" IS NULL THEN
    NEW."firstPublishedAt" := COALESCE(NEW."publishedAt", CURRENT_TIMESTAMP);
  END IF;
  IF TG_OP = 'UPDATE' AND OLD."firstPublishedAt" IS NOT NULL
     AND NEW."firstPublishedAt" IS DISTINCT FROM OLD."firstPublishedAt" THEN
    RAISE EXCEPTION 'Journey publication provenance is immutable';
  END IF;
  IF NEW."status" = 'published' AND NEW."firstPublishedAt" IS NULL THEN
    RAISE EXCEPTION 'Journey publication requires explicit provenance';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journey_publication_provenance_guard
BEFORE INSERT OR UPDATE ON "Journey"
FOR EACH ROW EXECUTE FUNCTION journey_publication_provenance_guard();

COMMIT;

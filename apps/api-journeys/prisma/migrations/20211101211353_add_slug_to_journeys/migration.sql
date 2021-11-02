CREATE EXTENSION IF NOT EXISTS "unaccent";

CREATE OR REPLACE FUNCTION slugify("value" TEXT)
RETURNS TEXT AS $$
  -- removes accents (diacritic signs) from a given string --
  WITH "unaccented" AS (
    SELECT unaccent("value") AS "value"
  ),
  -- lowercases the string
  "lowercase" AS (
    SELECT lower("value") AS "value"
    FROM "unaccented"
  ),
  -- remove single and double quotes
  "removed_quotes" AS (
    SELECT regexp_replace("value", '[''"]+', '', 'gi') AS "value"
    FROM "lowercase"
  ),
  -- replaces anything that's not a letter, number, hyphen('-'), or underscore('_') with a hyphen('-')
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') AS "value"
    FROM "removed_quotes"
  ),
  -- trims hyphens('-') if they exist on the head or tail of the string
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$$ LANGUAGE SQL STRICT IMMUTABLE;

DROP FUNCTION IF EXISTS set_slug_from_title;
CREATE FUNCTION public.set_slug_from_title() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.slug := slugify(NEW.title); --add something here to make slugs unique
  RETURN NEW;
END
$$;

BEGIN;
ALTER TABLE "Journey" ADD COLUMN "slug" TEXT NULL;

CREATE TRIGGER "journeys_slug_insert" BEFORE INSERT ON "Journey" FOR EACH ROW WHEN (NEW."title" IS NOT NULL AND NEW."slug" IS NULL)
EXECUTE PROCEDURE set_slug_from_title();

UPDATE "Journey" SET "slug" = slugify("title");

CREATE UNIQUE INDEX "Journey.slug_unique" ON "Journey"("slug");
COMMIT;

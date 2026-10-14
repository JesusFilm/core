-- Backfill any existing NULL values before the NOT NULL constraint is added,
-- so the constraint below cannot fail against current data.
UPDATE "Video" SET "availableLanguages" = ARRAY[]::TEXT[] WHERE "availableLanguages" IS NULL;

-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "availableLanguages" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Video" ALTER COLUMN "availableLanguages" SET NOT NULL;

-- CreateIndex
-- GIN index backs the `hasSome` filter Arclight's paginated public catalog listing
-- (apps/arclight/.../_media-components/index.ts, /v2/media_components?languageIds=)
-- applies directly against this column via its own Prisma client, with no index at
-- all today. `hasSome` compiles to the `&&` (overlap) operator, which the default
-- `array_ops` GIN opclass does serve.
--
-- It does NOT back `isEmpty: false` (used at 6 call sites in
-- apis/api-media/src/schema/video/video.ts): Prisma compiles that to `<> '{}'`, an
-- operator `array_ops` has no strategy for, so the planner cannot use this index for
-- it — see docs/solutions/logic-errors/gin-array-ops-index-does-not-serve-isempty-predicate-2026-09-16.md.
CREATE INDEX "Video_availableLanguages_idx" ON "Video" USING GIN ("availableLanguages");

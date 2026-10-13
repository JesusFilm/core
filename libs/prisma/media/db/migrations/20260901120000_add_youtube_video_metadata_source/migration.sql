-- CreateEnum
-- One value on purpose: nothing but the youtube-studio (Wheat) app writes
-- WHEAT, so NULL means "not composed by Wheat" by construction. See
-- JesusFilm/youtube-studio#577.
CREATE TYPE "YoutubeMetadataSource" AS ENUM ('WHEAT');

-- AlterTable
-- Caller-supplied authorship of the published title/description, alongside the
-- existing provenance cluster. Distinct from matchMethod, which records how a
-- row was matched to a catalog video and does not change when the text is
-- rewritten. Both columns are nullable and unbackfilled: every pre-existing row
-- reads as "not composed by Wheat", which is correct.
ALTER TABLE "YoutubeVideo" ADD COLUMN "metadataSource" "YoutubeMetadataSource";
ALTER TABLE "YoutubeVideo" ADD COLUMN "metadataRulebookVersion" TEXT;

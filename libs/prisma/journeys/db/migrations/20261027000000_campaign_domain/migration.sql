-- A Custom Domain with a campaign becomes that campaign's own Campaign
-- Domain: one per campaign, never a route-all or collection domain, deleted
-- with its campaign.

-- Data fix: a domain that routes team journeys and also named a Campaign Root
-- through the team dialog stays a plain team domain.
UPDATE "CustomDomain"
SET "campaignId" = NULL
WHERE "campaignId" IS NOT NULL
  AND ("routeAllTeamJourneys" = true OR "journeyCollectionId" IS NOT NULL);

-- De-duplicate: one domain per campaign. The table has no creation time, so
-- the survivor is the first by name.
UPDATE "CustomDomain"
SET "campaignId" = NULL
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (PARTITION BY "campaignId" ORDER BY "name", "id") AS "rank"
    FROM "CustomDomain"
    WHERE "campaignId" IS NOT NULL
  ) AS "ranked"
  WHERE "ranked"."rank" > 1
);

-- DropForeignKey
ALTER TABLE "CustomDomain" DROP CONSTRAINT "CustomDomain_campaignId_fkey";

-- DropIndex
DROP INDEX "CustomDomain_campaignId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_campaignId_key" ON "CustomDomain"("campaignId");

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint: a Campaign Domain serves only its campaign.
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_campaignDomain_check" CHECK ("campaignId" IS NULL OR ("routeAllTeamJourneys" = false AND "journeyCollectionId" IS NULL));

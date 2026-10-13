-- AlterTable
-- Each domain publishes to its own Cloudflare KV namespace; the Worker
-- resolves the binding by name from the domain record.
ALTER TABLE "ShortLinkDomain" ADD COLUMN     "kvNamespaceId" TEXT,
ADD COLUMN     "kvBinding" TEXT;

-- AlterTable
ALTER TABLE "ShortLink" ADD COLUMN     "global" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ShortLinkGlobalSlug" (
    "pathname" TEXT NOT NULL,
    "shortLinkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShortLinkGlobalSlug_pkey" PRIMARY KEY ("pathname")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortLinkGlobalSlug_shortLinkId_key" ON "ShortLinkGlobalSlug"("shortLinkId");

-- AddForeignKey
ALTER TABLE "ShortLinkGlobalSlug" ADD CONSTRAINT "ShortLinkGlobalSlug_shortLinkId_fkey" FOREIGN KEY ("shortLinkId") REFERENCES "ShortLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Data change (additive, idempotent): the Worker binding name for each known
-- domain. The namespace ids are filled in per environment once the namespaces
-- exist (shortLinkDomainUpdate or the admin app); until then the domain is
-- not published.
UPDATE "ShortLinkDomain" SET "kvBinding" = 'KV_JESUS_FILM', "updatedAt" = CURRENT_TIMESTAMP WHERE "hostname" = 'jesus.film'  AND "kvBinding" IS NULL;
UPDATE "ShortLinkDomain" SET "kvBinding" = 'KV_NXSTP_IS',   "updatedAt" = CURRENT_TIMESTAMP WHERE "hostname" = 'nxstp.is'    AND "kvBinding" IS NULL;
UPDATE "ShortLinkDomain" SET "kvBinding" = 'KV_ARC_GT',     "updatedAt" = CURRENT_TIMESTAMP WHERE "hostname" IN ('arc.gt', 'core.arc.gt') AND "kvBinding" IS NULL;
UPDATE "ShortLinkDomain" SET "kvBinding" = 'KV_STG_ARC_GT', "updatedAt" = CURRENT_TIMESTAMP WHERE "hostname" = 'stg.arc.gt'  AND "kvBinding" IS NULL;

-- AlterTable
ALTER TABLE "TemplateGalleryPageTemplate" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isHome" BOOLEAN NOT NULL DEFAULT false;

-- Every existing membership is a home: single membership was enforced until
-- now, so each journey has at most one row.
UPDATE "TemplateGalleryPageTemplate" SET "isHome" = true;

-- CreateIndex
CREATE INDEX "TemplateGalleryPageTemplate_journeyId_idx" ON "TemplateGalleryPageTemplate"("journeyId");

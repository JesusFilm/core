-- CreateEnum
CREATE TYPE "TemplateGalleryPageStatus" AS ENUM ('draft', 'published');

-- CreateTable
CREATE TABLE "TemplateGalleryPage" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL,
    "status" "TemplateGalleryPageStatus" NOT NULL DEFAULT 'draft',
    "creatorName" TEXT NOT NULL,
    "creatorImageBlockId" TEXT,
    "mediaUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateGalleryPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateGalleryPageTemplate" (
    "id" TEXT NOT NULL,
    "templateGalleryPageId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TemplateGalleryPageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateGalleryPage_slug_key" ON "TemplateGalleryPage"("slug");

-- CreateIndex
CREATE INDEX "TemplateGalleryPage_teamId_createdAt_idx" ON "TemplateGalleryPage"("teamId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateGalleryPageTemplate_templateGalleryPageId_journeyId_key" ON "TemplateGalleryPageTemplate"("templateGalleryPageId", "journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateGalleryPageTemplate_templateGalleryPageId_order_key" ON "TemplateGalleryPageTemplate"("templateGalleryPageId", "order");

-- AddForeignKey
ALTER TABLE "TemplateGalleryPage" ADD CONSTRAINT "TemplateGalleryPage_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateGalleryPage" ADD CONSTRAINT "TemplateGalleryPage_creatorImageBlockId_fkey" FOREIGN KEY ("creatorImageBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateGalleryPageTemplate" ADD CONSTRAINT "TemplateGalleryPageTemplate_templateGalleryPageId_fkey" FOREIGN KEY ("templateGalleryPageId") REFERENCES "TemplateGalleryPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateGalleryPageTemplate" ADD CONSTRAINT "TemplateGalleryPageTemplate_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

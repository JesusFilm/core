-- CreateEnum
CREATE TYPE "TemplateGalleryPageMediaType" AS ENUM ('link', 'mux');

-- CreateTable
CREATE TABLE "TemplateGalleryPageMedia" (
    "id" TEXT NOT NULL,
    "templateGalleryPageId" TEXT NOT NULL,
    "type" "TemplateGalleryPageMediaType" NOT NULL,
    "embedUrl" TEXT,
    "muxVideoId" TEXT,
    "muxPlaybackId" TEXT,
    "muxName" TEXT,
    "muxDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateGalleryPageMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateGalleryPageMedia_templateGalleryPageId_key" ON "TemplateGalleryPageMedia"("templateGalleryPageId");

-- AddForeignKey
ALTER TABLE "TemplateGalleryPageMedia" ADD CONSTRAINT "TemplateGalleryPageMedia_templateGalleryPageId_fkey" FOREIGN KEY ("templateGalleryPageId") REFERENCES "TemplateGalleryPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;


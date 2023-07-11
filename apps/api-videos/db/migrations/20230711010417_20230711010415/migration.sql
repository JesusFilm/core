-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('databaseId', 'slug');

-- CreateEnum
CREATE TYPE "VideoLabel" AS ENUM ('collection', 'episode', 'featureFilm', 'segment', 'series', 'shortFilm');

-- CreateEnum
CREATE TYPE "VideoVariantDownloadQuality" AS ENUM ('low', 'high');

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "label" "VideoLabel" NOT NULL,
    "primaryLanguageId" TEXT NOT NULL,
    "seoTitle" JSONB[],
    "snippet" JSONB[],
    "description" JSONB[],
    "studyQuestions" JSONB[],
    "image" TEXT,
    "imageAlt" JSONB[],
    "slug" TEXT,
    "noIndex" BOOLEAN,
    "parentId" TEXT,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTitle" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "videoId" TEXT,

    CONSTRAINT "VideoTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoVariantDownload" (
    "id" TEXT NOT NULL,
    "quality" "VideoVariantDownloadQuality" NOT NULL,
    "size" DOUBLE PRECISION,
    "url" TEXT NOT NULL,
    "videoVariantId" TEXT,

    CONSTRAINT "VideoVariantDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoVariant" (
    "id" TEXT NOT NULL,
    "hls" TEXT,
    "duration" INTEGER,
    "languageId" TEXT NOT NULL,
    "subtitle" JSONB[],
    "slug" TEXT NOT NULL,
    "videoId" TEXT,

    CONSTRAINT "VideoVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_slug_key" ON "Video"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariantDownload_quality_videoVariantId_key" ON "VideoVariantDownload"("quality", "videoVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariant_languageId_videoId_key" ON "VideoVariant"("languageId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariant_slug_key" ON "VideoVariant"("slug");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTitle" ADD CONSTRAINT "VideoTitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariantDownload" ADD CONSTRAINT "VideoVariantDownload_videoVariantId_fkey" FOREIGN KEY ("videoVariantId") REFERENCES "VideoVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

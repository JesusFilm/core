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
    "childIds" TEXT[],

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
    "slug" TEXT NOT NULL,
    "videoId" TEXT,

    CONSTRAINT "VideoVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoVariantSubtitle" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "languageId" TEXT NOT NULL,
    "videoVariantId" TEXT NOT NULL,

    CONSTRAINT "VideoVariantSubtitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ParentChild" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_slug_key" ON "Video"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VideoTitle_videoId_languageId_key" ON "VideoTitle"("videoId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariantDownload_quality_videoVariantId_key" ON "VideoVariantDownload"("quality", "videoVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariant_languageId_videoId_key" ON "VideoVariant"("languageId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariant_slug_key" ON "VideoVariant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariantSubtitle_videoVariantId_languageId_key" ON "VideoVariantSubtitle"("videoVariantId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "_ParentChild_AB_unique" ON "_ParentChild"("A", "B");

-- CreateIndex
CREATE INDEX "_ParentChild_B_index" ON "_ParentChild"("B");

-- AddForeignKey
ALTER TABLE "VideoTitle" ADD CONSTRAINT "VideoTitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariantDownload" ADD CONSTRAINT "VideoVariantDownload_videoVariantId_fkey" FOREIGN KEY ("videoVariantId") REFERENCES "VideoVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariantSubtitle" ADD CONSTRAINT "VideoVariantSubtitle_videoVariantId_fkey" FOREIGN KEY ("videoVariantId") REFERENCES "VideoVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentChild" ADD CONSTRAINT "_ParentChild_A_fkey" FOREIGN KEY ("A") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentChild" ADD CONSTRAINT "_ParentChild_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('databaseId', 'slug');

-- CreateEnum
CREATE TYPE "VideoLabel" AS ENUM ('collection', 'episode', 'featureFilm', 'segment', 'series', 'shortFilm', 'trailer', 'behindTheScenes');

-- CreateEnum
CREATE TYPE "VideoVariantDownloadQuality" AS ENUM ('low', 'high');

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "label" "VideoLabel" NOT NULL,
    "primaryLanguageId" TEXT NOT NULL,
    "image" TEXT,
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
    "edition" TEXT NOT NULL DEFAULT 'base',
    "slug" TEXT NOT NULL,
    "videoId" TEXT,

    CONSTRAINT "VideoVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoSubtitle" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "edition" TEXT NOT NULL DEFAULT 'base',
    "vttSrc" TEXT,
    "srtSrc" TEXT,
    "primary" BOOLEAN NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "VideoSubtitle_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "VideoSnippet" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "videoId" TEXT,

    CONSTRAINT "VideoSnippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoDescription" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "videoId" TEXT,

    CONSTRAINT "VideoDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoImageAlt" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "videoId" TEXT,

    CONSTRAINT "VideoImageAlt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoStudyQuestion" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "crowdInId" TEXT,
    "videoId" TEXT,

    CONSTRAINT "VideoStudyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportTimes" (
    "modelName" TEXT NOT NULL,
    "lastImport" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportTimes_pkey" PRIMARY KEY ("modelName")
);

-- CreateTable
CREATE TABLE "BibleCitation" (
    "id" TEXT NOT NULL,
    "bibleBookId" TEXT NOT NULL,
    "osisId" TEXT NOT NULL,
    "chapterStart" INTEGER NOT NULL,
    "chapterEnd" INTEGER,
    "verseStart" INTEGER NOT NULL,
    "verseEnd" INTEGER,
    "videoId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "BibleCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BibleBook" (
    "id" TEXT NOT NULL,
    "osisId" TEXT NOT NULL,
    "alternateName" TEXT,
    "paratextAbbreviation" TEXT NOT NULL,
    "isNewTestament" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "BibleBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BibleBookName" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "bibleBookId" TEXT NOT NULL,

    CONSTRAINT "BibleBookName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ParentChild" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_VideoToKeyword" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_slug_key" ON "Video"("slug");

-- CreateIndex
CREATE INDEX "Video_label_idx" ON "Video"("label");

-- CreateIndex
CREATE INDEX "Video_childIds_idx" ON "Video"("childIds");

-- CreateIndex
CREATE INDEX "VideoTitle_value_idx" ON "VideoTitle"("value");

-- CreateIndex
CREATE INDEX "VideoTitle_primary_idx" ON "VideoTitle"("primary");

-- CreateIndex
CREATE INDEX "VideoTitle_languageId_idx" ON "VideoTitle"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoTitle_videoId_languageId_key" ON "VideoTitle"("videoId", "languageId");

-- CreateIndex
CREATE INDEX "VideoVariantDownload_videoVariantId_idx" ON "VideoVariantDownload"("videoVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariantDownload_quality_videoVariantId_key" ON "VideoVariantDownload"("quality", "videoVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariant_slug_key" ON "VideoVariant"("slug");

-- CreateIndex
CREATE INDEX "VideoVariant_languageId_idx" ON "VideoVariant"("languageId");

-- CreateIndex
CREATE INDEX "VideoVariant_videoId_idx" ON "VideoVariant"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariant_languageId_videoId_key" ON "VideoVariant"("languageId", "videoId");

-- CreateIndex
CREATE INDEX "VideoSubtitle_languageId_idx" ON "VideoSubtitle"("languageId");

-- CreateIndex
CREATE INDEX "VideoSubtitle_edition_idx" ON "VideoSubtitle"("edition");

-- CreateIndex
CREATE INDEX "VideoSubtitle_primary_idx" ON "VideoSubtitle"("primary");

-- CreateIndex
CREATE INDEX "VideoSubtitle_videoId_idx" ON "VideoSubtitle"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSubtitle_videoId_edition_languageId_key" ON "VideoSubtitle"("videoId", "edition", "languageId");

-- CreateIndex
CREATE INDEX "VideoVariantSubtitle_languageId_idx" ON "VideoVariantSubtitle"("languageId");

-- CreateIndex
CREATE INDEX "VideoVariantSubtitle_videoVariantId_idx" ON "VideoVariantSubtitle"("videoVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariantSubtitle_videoVariantId_languageId_key" ON "VideoVariantSubtitle"("videoVariantId", "languageId");

-- CreateIndex
CREATE INDEX "VideoSnippet_value_idx" ON "VideoSnippet"("value");

-- CreateIndex
CREATE INDEX "VideoSnippet_primary_idx" ON "VideoSnippet"("primary");

-- CreateIndex
CREATE INDEX "VideoSnippet_languageId_idx" ON "VideoSnippet"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSnippet_videoId_languageId_key" ON "VideoSnippet"("videoId", "languageId");

-- CreateIndex
CREATE INDEX "VideoDescription_value_idx" ON "VideoDescription"("value");

-- CreateIndex
CREATE INDEX "VideoDescription_primary_idx" ON "VideoDescription"("primary");

-- CreateIndex
CREATE INDEX "VideoDescription_languageId_idx" ON "VideoDescription"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoDescription_videoId_languageId_key" ON "VideoDescription"("videoId", "languageId");

-- CreateIndex
CREATE INDEX "VideoImageAlt_value_idx" ON "VideoImageAlt"("value");

-- CreateIndex
CREATE INDEX "VideoImageAlt_primary_idx" ON "VideoImageAlt"("primary");

-- CreateIndex
CREATE INDEX "VideoImageAlt_languageId_idx" ON "VideoImageAlt"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoImageAlt_videoId_languageId_key" ON "VideoImageAlt"("videoId", "languageId");

-- CreateIndex
CREATE INDEX "VideoStudyQuestion_value_idx" ON "VideoStudyQuestion"("value");

-- CreateIndex
CREATE INDEX "VideoStudyQuestion_primary_idx" ON "VideoStudyQuestion"("primary");

-- CreateIndex
CREATE INDEX "VideoStudyQuestion_languageId_idx" ON "VideoStudyQuestion"("languageId");

-- CreateIndex
CREATE INDEX "VideoStudyQuestion_order_idx" ON "VideoStudyQuestion"("order");

-- CreateIndex
CREATE UNIQUE INDEX "VideoStudyQuestion_videoId_languageId_order_key" ON "VideoStudyQuestion"("videoId", "languageId", "order");

-- CreateIndex
CREATE INDEX "BibleBookName_value_idx" ON "BibleBookName"("value");

-- CreateIndex
CREATE INDEX "BibleBookName_primary_idx" ON "BibleBookName"("primary");

-- CreateIndex
CREATE INDEX "BibleBookName_languageId_idx" ON "BibleBookName"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "BibleBookName_bibleBookId_languageId_key" ON "BibleBookName"("bibleBookId", "languageId");

-- CreateIndex
CREATE INDEX "Keyword_value_idx" ON "Keyword"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_value_languageId_key" ON "Keyword"("value", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "_ParentChild_AB_unique" ON "_ParentChild"("A", "B");

-- CreateIndex
CREATE INDEX "_ParentChild_B_index" ON "_ParentChild"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_VideoToKeyword_AB_unique" ON "_VideoToKeyword"("A", "B");

-- CreateIndex
CREATE INDEX "_VideoToKeyword_B_index" ON "_VideoToKeyword"("B");

-- AddForeignKey
ALTER TABLE "VideoTitle" ADD CONSTRAINT "VideoTitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariantDownload" ADD CONSTRAINT "VideoVariantDownload_videoVariantId_fkey" FOREIGN KEY ("videoVariantId") REFERENCES "VideoVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariantSubtitle" ADD CONSTRAINT "VideoVariantSubtitle_videoVariantId_fkey" FOREIGN KEY ("videoVariantId") REFERENCES "VideoVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSnippet" ADD CONSTRAINT "VideoSnippet_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoDescription" ADD CONSTRAINT "VideoDescription_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoImageAlt" ADD CONSTRAINT "VideoImageAlt_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoStudyQuestion" ADD CONSTRAINT "VideoStudyQuestion_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleCitation" ADD CONSTRAINT "BibleCitation_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleCitation" ADD CONSTRAINT "BibleCitation_bibleBookId_fkey" FOREIGN KEY ("bibleBookId") REFERENCES "BibleBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BibleBookName" ADD CONSTRAINT "BibleBookName_bibleBookId_fkey" FOREIGN KEY ("bibleBookId") REFERENCES "BibleBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentChild" ADD CONSTRAINT "_ParentChild_A_fkey" FOREIGN KEY ("A") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentChild" ADD CONSTRAINT "_ParentChild_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoToKeyword" ADD CONSTRAINT "_VideoToKeyword_A_fkey" FOREIGN KEY ("A") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoToKeyword" ADD CONSTRAINT "_VideoToKeyword_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

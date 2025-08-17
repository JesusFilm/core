-- CreateEnum
CREATE TYPE "ImageAspectRatio" AS ENUM ('hd', 'banner');

-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('databaseId', 'slug');

-- CreateEnum
CREATE TYPE "VideoLabel" AS ENUM ('collection', 'episode', 'featureFilm', 'segment', 'series', 'shortFilm', 'trailer', 'behindTheScenes');

-- CreateEnum
CREATE TYPE "VideoVariantDownloadQuality" AS ENUM ('low', 'high');

-- CreateEnum
CREATE TYPE "Service" AS ENUM ('apiJourneys', 'apiLanguages', 'apiMedia', 'apiTags', 'apiUsers', 'apiVideos');

-- CreateEnum
CREATE TYPE "MediaRole" AS ENUM ('publisher');

-- CreateTable
CREATE TABLE "CloudflareImage" (
    "id" TEXT NOT NULL,
    "uploadUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aspectRatio" "ImageAspectRatio",
    "videoId" TEXT,

    CONSTRAINT "CloudflareImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuxVideo" (
    "id" TEXT NOT NULL,
    "playbackId" TEXT,
    "uploadUrl" TEXT,
    "uploadId" TEXT,
    "assetId" TEXT,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "downloadable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readyToStream" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MuxVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloudflareR2" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalFilename" TEXT,
    "uploadUrl" TEXT,
    "userId" TEXT NOT NULL,
    "publicUrl" TEXT,
    "videoId" TEXT,
    "contentType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "contentLength" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CloudflareR2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "label" "VideoLabel" NOT NULL,
    "primaryLanguageId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT,
    "noIndex" BOOLEAN,
    "childIds" TEXT[],
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "availableLanguages" TEXT[],

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
    "height" INTEGER,
    "width" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "url" TEXT NOT NULL,
    "assetId" TEXT,
    "videoVariantId" TEXT,

    CONSTRAINT "VideoVariantDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoVariant" (
    "id" TEXT NOT NULL,
    "hls" TEXT,
    "dash" TEXT,
    "share" TEXT,
    "downloadable" BOOLEAN NOT NULL DEFAULT true,
    "duration" INTEGER,
    "lengthInMilliseconds" INTEGER,
    "languageId" TEXT NOT NULL,
    "masterUrl" TEXT,
    "masterWidth" INTEGER,
    "masterHeight" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "edition" TEXT NOT NULL DEFAULT 'base',
    "slug" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "assetId" TEXT,
    "muxVideoId" TEXT,

    CONSTRAINT "VideoVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoEdition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "VideoEdition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoSubtitle" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "edition" TEXT NOT NULL DEFAULT 'base',
    "vttAssetId" TEXT,
    "vttSrc" TEXT,
    "vttVersion" INTEGER NOT NULL DEFAULT 1,
    "srtAssetId" TEXT,
    "srtSrc" TEXT,
    "srtVersion" INTEGER NOT NULL DEFAULT 1,
    "primary" BOOLEAN NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "VideoSubtitle_pkey" PRIMARY KEY ("id")
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
    "chapterStart" INTEGER NOT NULL DEFAULT -1,
    "chapterEnd" INTEGER NOT NULL DEFAULT -1,
    "verseStart" INTEGER NOT NULL DEFAULT -1,
    "verseEnd" INTEGER NOT NULL DEFAULT -1,
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
CREATE TABLE "TagName" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TagName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "service" "Service",

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tagging" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tagId" TEXT NOT NULL,
    "taggableType" TEXT NOT NULL,
    "taggableId" TEXT NOT NULL,
    "context" TEXT NOT NULL,

    CONSTRAINT "Tagging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taxonomy" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "term" TEXT NOT NULL,

    CONSTRAINT "Taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxonomyName" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,

    CONSTRAINT "TaxonomyName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMediaRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roles" "MediaRole"[],

    CONSTRAINT "UserMediaRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortLinkDomain" (
    "id" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "apexName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "services" "Service"[],

    CONSTRAINT "ShortLinkDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortLink" (
    "id" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "userId" TEXT,
    "service" "Service" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortLinkBlocklistDomain" (
    "hostname" TEXT NOT NULL,

    CONSTRAINT "ShortLinkBlocklistDomain_pkey" PRIMARY KEY ("hostname")
);

-- CreateTable
CREATE TABLE "_ParentChild" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ParentChild_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_VideoToKeyword" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_VideoToKeyword_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "CloudflareImage_userId_idx" ON "CloudflareImage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MuxVideo_playbackId_key" ON "MuxVideo"("playbackId");

-- CreateIndex
CREATE UNIQUE INDEX "MuxVideo_uploadId_key" ON "MuxVideo"("uploadId");

-- CreateIndex
CREATE UNIQUE INDEX "MuxVideo_assetId_key" ON "MuxVideo"("assetId");

-- CreateIndex
CREATE INDEX "MuxVideo_userId_idx" ON "MuxVideo"("userId");

-- CreateIndex
CREATE INDEX "MuxVideo_assetId_idx" ON "MuxVideo"("assetId");

-- CreateIndex
CREATE INDEX "CloudflareR2_videoId_idx" ON "CloudflareR2"("videoId");

-- CreateIndex
CREATE INDEX "CloudflareR2_userId_idx" ON "CloudflareR2"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Video_slug_key" ON "Video"("slug");

-- CreateIndex
CREATE INDEX "Video_label_idx" ON "Video"("label");

-- CreateIndex
CREATE INDEX "Video_childIds_idx" ON "Video"("childIds");

-- CreateIndex
CREATE INDEX "Video_published_idx" ON "Video"("published");

-- CreateIndex
CREATE INDEX "VideoTitle_value_idx" ON "VideoTitle"("value");

-- CreateIndex
CREATE INDEX "VideoTitle_primary_idx" ON "VideoTitle"("primary");

-- CreateIndex
CREATE INDEX "VideoTitle_languageId_idx" ON "VideoTitle"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoTitle_videoId_languageId_key" ON "VideoTitle"("videoId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariantDownload_assetId_key" ON "VideoVariantDownload"("assetId");

-- CreateIndex
CREATE INDEX "VideoVariantDownload_videoVariantId_idx" ON "VideoVariantDownload"("videoVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariantDownload_quality_videoVariantId_key" ON "VideoVariantDownload"("quality", "videoVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariant_slug_key" ON "VideoVariant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariant_assetId_key" ON "VideoVariant"("assetId");

-- CreateIndex
CREATE INDEX "VideoVariant_languageId_idx" ON "VideoVariant"("languageId");

-- CreateIndex
CREATE INDEX "VideoVariant_videoId_idx" ON "VideoVariant"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoVariant_languageId_videoId_key" ON "VideoVariant"("languageId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoEdition_name_videoId_key" ON "VideoEdition"("name", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSubtitle_vttAssetId_key" ON "VideoSubtitle"("vttAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSubtitle_srtAssetId_key" ON "VideoSubtitle"("srtAssetId");

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
CREATE INDEX "BibleCitation_order_idx" ON "BibleCitation"("order");

-- CreateIndex
CREATE UNIQUE INDEX "BibleCitation_videoId_bibleBookId_chapterStart_chapterEnd_v_key" ON "BibleCitation"("videoId", "bibleBookId", "chapterStart", "chapterEnd", "verseStart", "verseEnd");

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
CREATE INDEX "TagName_value_idx" ON "TagName"("value");

-- CreateIndex
CREATE INDEX "TagName_primary_idx" ON "TagName"("primary");

-- CreateIndex
CREATE INDEX "TagName_languageId_idx" ON "TagName"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "TagName_tagId_languageId_key" ON "TagName"("tagId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tagging_tagId_idx" ON "Tagging"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Tagging_taggableId_taggableType_tagId_context_key" ON "Tagging"("taggableId", "taggableType", "tagId", "context");

-- CreateIndex
CREATE UNIQUE INDEX "Taxonomy_term_key" ON "Taxonomy"("term");

-- CreateIndex
CREATE INDEX "TaxonomyName_term_idx" ON "TaxonomyName"("term");

-- CreateIndex
CREATE INDEX "TaxonomyName_languageId_idx" ON "TaxonomyName"("languageId");

-- CreateIndex
CREATE INDEX "TaxonomyName_languageCode_idx" ON "TaxonomyName"("languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "TaxonomyName_term_languageId_key" ON "TaxonomyName"("term", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMediaRole_userId_key" ON "UserMediaRole"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShortLinkDomain_hostname_key" ON "ShortLinkDomain"("hostname");

-- CreateIndex
CREATE UNIQUE INDEX "ShortLink_pathname_domainId_key" ON "ShortLink"("pathname", "domainId");

-- CreateIndex
CREATE INDEX "_ParentChild_B_index" ON "_ParentChild"("B");

-- CreateIndex
CREATE INDEX "_VideoToKeyword_B_index" ON "_VideoToKeyword"("B");

-- AddForeignKey
ALTER TABLE "CloudflareImage" ADD CONSTRAINT "CloudflareImage_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CloudflareR2" ADD CONSTRAINT "CloudflareR2_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTitle" ADD CONSTRAINT "VideoTitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariantDownload" ADD CONSTRAINT "VideoVariantDownload_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariantDownload" ADD CONSTRAINT "VideoVariantDownload_videoVariantId_fkey" FOREIGN KEY ("videoVariantId") REFERENCES "VideoVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_edition_videoId_fkey" FOREIGN KEY ("edition", "videoId") REFERENCES "VideoEdition"("name", "videoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_muxVideoId_fkey" FOREIGN KEY ("muxVideoId") REFERENCES "MuxVideo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoEdition" ADD CONSTRAINT "VideoEdition_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_srtAssetId_fkey" FOREIGN KEY ("srtAssetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_vttAssetId_fkey" FOREIGN KEY ("vttAssetId") REFERENCES "CloudflareR2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubtitle" ADD CONSTRAINT "VideoSubtitle_edition_videoId_fkey" FOREIGN KEY ("edition", "videoId") REFERENCES "VideoEdition"("name", "videoId") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "TagName" ADD CONSTRAINT "TagName_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tagging" ADD CONSTRAINT "Tagging_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxonomyName" ADD CONSTRAINT "TaxonomyName_term_fkey" FOREIGN KEY ("term") REFERENCES "Taxonomy"("term") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortLink" ADD CONSTRAINT "ShortLink_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "ShortLinkDomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentChild" ADD CONSTRAINT "_ParentChild_A_fkey" FOREIGN KEY ("A") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentChild" ADD CONSTRAINT "_ParentChild_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoToKeyword" ADD CONSTRAINT "_VideoToKeyword_A_fkey" FOREIGN KEY ("A") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoToKeyword" ADD CONSTRAINT "_VideoToKeyword_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;


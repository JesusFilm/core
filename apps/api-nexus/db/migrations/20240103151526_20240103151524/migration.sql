/*
  Warnings:

  - The `status` column on the `Resource` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `description` on the `TemplateResource` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `TemplateResource` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `TemplateResource` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `TemplateResource` table. All the data in the column will be lost.
  - Added the required column `sourceType` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `TemplateResource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `privacyStatus` to the `TemplateResource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spokenLanguage` to the `TemplateResource` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('deleted', 'published', 'processing', 'error', 'uploaded');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('googleDrive', 'template', 'archlight');

-- CreateEnum
CREATE TYPE "PrivacyStatus" AS ENUM ('public', 'unlisted', 'private');

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "sourceType" "SourceType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ResourceStatus" NOT NULL DEFAULT 'published';

-- AlterTable
ALTER TABLE "TemplateResource" DROP COLUMN "description",
DROP COLUMN "fileName",
DROP COLUMN "keywords",
DROP COLUMN "title",
ADD COLUMN     "captionFile" TEXT,
ADD COLUMN     "captionLanguage" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "channel" TEXT,
ADD COLUMN     "customThumbnail" TEXT,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "isMadeForKids" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifySubscribers" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "playlistId" TEXT,
ADD COLUMN     "privacyStatus" "PrivacyStatus" NOT NULL,
ADD COLUMN     "spokenLanguage" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Title" (
    "id" TEXT NOT NULL,
    "templateResourceId" TEXT NOT NULL,

    CONSTRAINT "Title_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Description" (
    "id" TEXT NOT NULL,
    "templateResourceId" TEXT NOT NULL,

    CONSTRAINT "Description_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "templateResourceId" TEXT NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageEntry" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "titleId" TEXT,
    "descriptionId" TEXT,
    "keywordId" TEXT,

    CONSTRAINT "LanguageEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Title" ADD CONSTRAINT "Title_templateResourceId_fkey" FOREIGN KEY ("templateResourceId") REFERENCES "TemplateResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description" ADD CONSTRAINT "Description_templateResourceId_fkey" FOREIGN KEY ("templateResourceId") REFERENCES "TemplateResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_templateResourceId_fkey" FOREIGN KEY ("templateResourceId") REFERENCES "TemplateResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageEntry" ADD CONSTRAINT "LanguageEntry_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageEntry" ADD CONSTRAINT "LanguageEntry_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "Description"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageEntry" ADD CONSTRAINT "LanguageEntry_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE SET NULL ON UPDATE CASCADE;

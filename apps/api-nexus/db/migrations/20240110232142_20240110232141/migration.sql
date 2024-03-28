/*
  Warnings:

  - You are about to drop the `Description` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoogleDriveResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Keyword` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LanguageEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Title` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Description" DROP CONSTRAINT "Description_templateResourceId_fkey";

-- DropForeignKey
ALTER TABLE "GoogleDriveResource" DROP CONSTRAINT "GoogleDriveResource_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "Keyword" DROP CONSTRAINT "Keyword_templateResourceId_fkey";

-- DropForeignKey
ALTER TABLE "LanguageEntry" DROP CONSTRAINT "LanguageEntry_descriptionId_fkey";

-- DropForeignKey
ALTER TABLE "LanguageEntry" DROP CONSTRAINT "LanguageEntry_keywordId_fkey";

-- DropForeignKey
ALTER TABLE "LanguageEntry" DROP CONSTRAINT "LanguageEntry_titleId_fkey";

-- DropForeignKey
ALTER TABLE "TemplateResource" DROP CONSTRAINT "TemplateResource_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "Title" DROP CONSTRAINT "Title_templateResourceId_fkey";

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "category" TEXT,
ADD COLUMN     "googleDriveLink" TEXT,
ADD COLUMN     "privacy" "PrivacyStatus";

-- DropTable
DROP TABLE "Description";

-- DropTable
DROP TABLE "GoogleDriveResource";

-- DropTable
DROP TABLE "Keyword";

-- DropTable
DROP TABLE "LanguageEntry";

-- DropTable
DROP TABLE "TemplateResource";

-- DropTable
DROP TABLE "Title";

-- CreateTable
CREATE TABLE "ResourceLocalization" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "ResourceLocalization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleAccessToken" (
    "id" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "GoogleAccessToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ResourceLocalization" ADD CONSTRAINT "ResourceLocalization_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

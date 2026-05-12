-- DropForeignKey
ALTER TABLE "TemplateGalleryPage" DROP CONSTRAINT "TemplateGalleryPage_creatorImageBlockId_fkey";

-- AlterTable
ALTER TABLE "TemplateGalleryPage" DROP COLUMN "creatorImageBlockId",
ADD COLUMN     "creatorImageAlt" TEXT,
ADD COLUMN     "creatorImageSrc" TEXT;

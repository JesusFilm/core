-- DropForeignKey
ALTER TABLE "TemplateGalleryPage" DROP CONSTRAINT IF EXISTS "TemplateGalleryPage_creatorImageBlockId_fkey";

-- AlterTable
ALTER TABLE "TemplateGalleryPage" DROP COLUMN IF EXISTS "creatorImageBlockId";
ALTER TABLE "TemplateGalleryPage" ADD COLUMN IF NOT EXISTS "creatorImageAlt" TEXT;
ALTER TABLE "TemplateGalleryPage" ADD COLUMN IF NOT EXISTS "creatorImageSrc" TEXT;

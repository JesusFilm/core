-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "displayTitle" TEXT,
ADD COLUMN     "showDislikeButton" BOOLEAN DEFAULT true,
ADD COLUMN     "showLikeButton" BOOLEAN DEFAULT true,
ADD COLUMN     "showShareButton" BOOLEAN DEFAULT true,
ADD COLUMN     "website" BOOLEAN DEFAULT false;

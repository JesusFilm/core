-- CreateEnum
CREATE TYPE "Variant" AS ENUM ('journey', 'website');

-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "dislikeButton" BOOLEAN DEFAULT true,
ADD COLUMN     "header" TEXT,
ADD COLUMN     "likeButton" BOOLEAN DEFAULT true,
ADD COLUMN     "shareButton" BOOLEAN DEFAULT true,
ADD COLUMN     "variant" "Variant" DEFAULT 'journey';

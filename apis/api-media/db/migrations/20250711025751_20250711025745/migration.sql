-- CreateEnum
CREATE TYPE "VideoRedirectType" AS ENUM ('hls', 'dl', 'dh', 's');

-- AlterTable
ALTER TABLE "ShortLink" ADD COLUMN     "brightcoveId" TEXT,
ADD COLUMN     "type" "VideoRedirectType";

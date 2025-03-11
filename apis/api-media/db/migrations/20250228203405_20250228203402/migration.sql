-- AlterTable
ALTER TABLE "CloudflareR2" ADD COLUMN     "contentLength" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "contentType" TEXT NOT NULL DEFAULT 'application/octet-stream';

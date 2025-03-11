-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Video_published_idx" ON "Video"("published");

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "sortOrder" INTEGER;

-- CreateIndex
CREATE INDEX "Video_sortOrder_idx" ON "Video"("sortOrder");

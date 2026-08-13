-- AlterTable
ALTER TABLE "Language" ADD COLUMN "searchable" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Language_hasVideos_searchable_idx" ON "Language"("hasVideos", "searchable");

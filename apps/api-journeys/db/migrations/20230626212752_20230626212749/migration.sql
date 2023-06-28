-- DropIndex
DROP INDEX "Journey_slug_idx";

-- CreateIndex
CREATE INDEX "Journey_title_idx" ON "Journey"("title");

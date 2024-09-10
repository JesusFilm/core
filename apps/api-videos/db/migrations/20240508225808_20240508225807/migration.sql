-- AlterTable
ALTER TABLE "VideoVariant" ADD COLUMN     "editionId" TEXT;

-- CreateTable
CREATE TABLE "Edition" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Edition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtitle" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "languageId" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,

    CONSTRAINT "Subtitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EditionToSubtitle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Subtitle_languageId_idx" ON "Subtitle"("languageId");

-- CreateIndex
CREATE INDEX "Subtitle_editionId_idx" ON "Subtitle"("editionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subtitle_editionId_languageId_key" ON "Subtitle"("editionId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "_EditionToSubtitle_AB_unique" ON "_EditionToSubtitle"("A", "B");

-- CreateIndex
CREATE INDEX "_EditionToSubtitle_B_index" ON "_EditionToSubtitle"("B");

-- AddForeignKey
ALTER TABLE "VideoVariant" ADD CONSTRAINT "VideoVariant_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditionToSubtitle" ADD CONSTRAINT "_EditionToSubtitle_A_fkey" FOREIGN KEY ("A") REFERENCES "Edition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditionToSubtitle" ADD CONSTRAINT "_EditionToSubtitle_B_fkey" FOREIGN KEY ("B") REFERENCES "Subtitle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

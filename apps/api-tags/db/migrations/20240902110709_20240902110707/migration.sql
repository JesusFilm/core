/*
  Warnings:

  - You are about to drop the column `nameTranslations` on the `Tag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "nameTranslations";

-- CreateTable
CREATE TABLE "TagName" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TagName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TagName_value_idx" ON "TagName"("value");

-- CreateIndex
CREATE INDEX "TagName_primary_idx" ON "TagName"("primary");

-- CreateIndex
CREATE INDEX "TagName_languageId_idx" ON "TagName"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "TagName_tagId_languageId_key" ON "TagName"("tagId", "languageId");

-- AddForeignKey
ALTER TABLE "TagName" ADD CONSTRAINT "TagName_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

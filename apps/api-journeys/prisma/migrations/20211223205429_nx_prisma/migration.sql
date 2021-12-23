-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_journeyId_fkey";

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_blockId_fkey";

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Journey.slug_unique" RENAME TO "Journey_slug_key";

-- RenameIndex
ALTER INDEX "Journey_primaryImageBlockId_unique" RENAME TO "Journey_primaryImageBlockId_key";

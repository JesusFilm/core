-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_parentBlockId_fkey";

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_parentBlockId_fkey" FOREIGN KEY ("parentBlockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Journey.slug_unique" RENAME TO "Journey_slug_key";

-- RenameIndex
ALTER INDEX "Journey_primaryImageBlockId_unique" RENAME TO "Journey_primaryImageBlockId_key";

-- RenameIndex
ALTER INDEX "uniqueUserJourney" RENAME TO "UserJourney_userId_journeyId_key";

/*
  Warnings:

  - A unique constraint covering the columns `[logoImageBlockId]` on the table `Journey` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[menuStepBlockId]` on the table `Journey` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "JourneyMenuButtonIcon" AS ENUM ('menu1', 'equals', 'home3', 'home4', 'more', 'ellipsis', 'globe01', 'chevronDown');

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "scale" INTEGER;

-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "logoImageBlockId" TEXT,
ADD COLUMN     "menuButtonIcon" "JourneyMenuButtonIcon",
ADD COLUMN     "menuStepBlockId" TEXT,
ADD COLUMN     "showChatButtons" BOOLEAN DEFAULT true,
ADD COLUMN     "showDisplayTitle" BOOLEAN DEFAULT false,
ADD COLUMN     "showHosts" BOOLEAN DEFAULT true,
ADD COLUMN     "showLogo" BOOLEAN DEFAULT false,
ADD COLUMN     "showMenu" BOOLEAN DEFAULT false,
ADD COLUMN     "showReactionButtons" BOOLEAN DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Journey_logoImageBlockId_key" ON "Journey"("logoImageBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "Journey_menuStepBlockId_key" ON "Journey"("menuStepBlockId");

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_logoImageBlockId_fkey" FOREIGN KEY ("logoImageBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_menuStepBlockId_fkey" FOREIGN KEY ("menuStepBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - The `isMadeForKids` column on the `Resource` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `notifySubscribers` column on the `Resource` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ResourceYoutubeChannel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ResourceYoutubeChannel" DROP CONSTRAINT "ResourceYoutubeChannel_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceYoutubeChannel" DROP CONSTRAINT "ResourceYoutubeChannel_resourceId_fkey";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "isMadeForKids",
ADD COLUMN     "isMadeForKids" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "notifySubscribers",
ADD COLUMN     "notifySubscribers" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "ResourceYoutubeChannel";

-- CreateTable
CREATE TABLE "ResourceChannel" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,

    CONSTRAINT "ResourceChannel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ResourceChannel" ADD CONSTRAINT "ResourceChannel_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceChannel" ADD CONSTRAINT "ResourceChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

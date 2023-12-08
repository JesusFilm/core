-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "connected" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ChannelYoutubeCredential" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "redirectUrl" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "ChannelYoutubeCredential_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChannelYoutubeCredential" ADD CONSTRAINT "ChannelYoutubeCredential_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

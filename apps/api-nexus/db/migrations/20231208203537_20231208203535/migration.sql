-- CreateEnum
CREATE TYPE "NexusStatus" AS ENUM ('deleted', 'published');

-- CreateTable
CREATE TABLE "Nexus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "status" "NexusStatus" NOT NULL DEFAULT 'published',

    CONSTRAINT "Nexus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNexus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nexusId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "UserNexus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "nexusId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "nexusId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "refLink" TEXT,
    "videoId" TEXT,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "ChannelYoutubeCredential_channelId_key" ON "ChannelYoutubeCredential"("channelId");

-- AddForeignKey
ALTER TABLE "UserNexus" ADD CONSTRAINT "UserNexus_nexusId_fkey" FOREIGN KEY ("nexusId") REFERENCES "Nexus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_nexusId_fkey" FOREIGN KEY ("nexusId") REFERENCES "Nexus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_nexusId_fkey" FOREIGN KEY ("nexusId") REFERENCES "Nexus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelYoutubeCredential" ADD CONSTRAINT "ChannelYoutubeCredential_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

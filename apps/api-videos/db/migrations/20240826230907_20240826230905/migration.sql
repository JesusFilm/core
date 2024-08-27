-- CreateEnum
CREATE TYPE "VideoAdminUserRole" AS ENUM ('admin', 'youtubeMember', 'youtubeAdmin', 'coreMember', 'coreAdmin');

-- CreateTable
CREATE TABLE "VideoAdminUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roles" "VideoAdminUserRole"[],

    CONSTRAINT "VideoAdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoAdminUser_userId_key" ON "VideoAdminUser"("userId");

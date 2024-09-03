-- CreateEnum
CREATE TYPE "VideoRole" AS ENUM ('publisher');

-- CreateTable
CREATE TABLE "VideoAdminUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roles" "VideoRole"[],

    CONSTRAINT "VideoAdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoAdminUser_userId_key" ON "VideoAdminUser"("userId");

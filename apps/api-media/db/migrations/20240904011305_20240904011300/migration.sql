/*
  Warnings:

  - You are about to drop the `VideoAdminUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MediaRole" AS ENUM ('publisher');

-- DropTable
DROP TABLE "VideoAdminUser";

-- DropEnum
DROP TYPE "VideoRole";

-- CreateTable
CREATE TABLE "UserMediaRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roles" "MediaRole"[],

    CONSTRAINT "UserMediaRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMediaRole_userId_key" ON "UserMediaRole"("userId");

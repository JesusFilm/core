-- CreateEnum
CREATE TYPE "Role" AS ENUM ('publisher');

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roles" "Role"[],

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_key" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

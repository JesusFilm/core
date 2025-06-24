-- CreateEnum
CREATE TYPE "LanguageRole" AS ENUM ('publisher');

-- CreateTable
CREATE TABLE "UserLanguageRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roles" "LanguageRole"[],

    CONSTRAINT "UserLanguageRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLanguageRole_userId_key" ON "UserLanguageRole"("userId");

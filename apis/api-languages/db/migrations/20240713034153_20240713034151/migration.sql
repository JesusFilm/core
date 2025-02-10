/*
  Warnings:

  - The primary key for the `AudioPreview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `AudioPreview` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `AudioPreview` table. All the data in the column will be lost.
  - Added the required column `duration` to the `AudioPreview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AudioPreview" DROP CONSTRAINT "AudioPreview_pkey",
DROP COLUMN "createdAt",
-- DROP COLUMN "id",
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD CONSTRAINT "AudioPreview_pkey" PRIMARY KEY ("languageId");

-- CreateTable
CREATE TABLE "ImportTimes" (
    "modelName" TEXT NOT NULL,
    "lastImport" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportTimes_pkey" PRIMARY KEY ("modelName")
);

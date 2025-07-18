/*
  Warnings:

  - The primary key for the `AudioPreview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AudioPreview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AudioPreview" DROP CONSTRAINT "AudioPreview_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "AudioPreview_pkey" PRIMARY KEY ("languageId");

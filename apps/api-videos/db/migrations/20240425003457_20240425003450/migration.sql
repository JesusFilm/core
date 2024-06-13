/*
  Warnings:

  - You are about to drop the column `description` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `imageAlt` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `snippet` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `studyQuestions` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "description",
DROP COLUMN "imageAlt",
DROP COLUMN "snippet",
DROP COLUMN "studyQuestions";

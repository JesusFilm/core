/*
  Warnings:

  - A unique constraint covering the columns `[teamId,userId]` on the table `Visitor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Visitor_teamId_userId_key" ON "Visitor"("teamId", "userId");

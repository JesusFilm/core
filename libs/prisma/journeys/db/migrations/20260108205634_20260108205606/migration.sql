/*
  Warnings:

  - A unique constraint covering the columns `[userId,teamId,type,accountEmail]` on the table `Integration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Integration_userId_teamId_type_accountEmail_key" ON "Integration"("userId", "teamId", "type", "accountEmail");

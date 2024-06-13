/*
  Warnings:

  - You are about to drop the column `journeyAccessRequest` on the `JourneysEmailPreference` table. All the data in the column will be lost.
  - You are about to drop the column `journeyEditInvite` on the `JourneysEmailPreference` table. All the data in the column will be lost.
  - You are about to drop the column `journeyRequestApproved` on the `JourneysEmailPreference` table. All the data in the column will be lost.
  - You are about to drop the column `teamInvite` on the `JourneysEmailPreference` table. All the data in the column will be lost.
  - You are about to drop the column `teamInviteAccepted` on the `JourneysEmailPreference` table. All the data in the column will be lost.
  - You are about to drop the column `teamRemoved` on the `JourneysEmailPreference` table. All the data in the column will be lost.
  - Added the required column `accountNotifications` to the `JourneysEmailPreference` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JourneysEmailPreference" DROP COLUMN "journeyAccessRequest",
DROP COLUMN "journeyEditInvite",
DROP COLUMN "journeyRequestApproved",
DROP COLUMN "teamInvite",
DROP COLUMN "teamInviteAccepted",
DROP COLUMN "teamRemoved",
ADD COLUMN     "accountNotifications" BOOLEAN NOT NULL;

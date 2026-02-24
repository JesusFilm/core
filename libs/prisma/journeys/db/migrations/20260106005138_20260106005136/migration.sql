-- CreateEnum
CREATE TYPE "EventLabel" AS ENUM ('custom1', 'custom2', 'custom3', 'decisionForChrist', 'gospelPresentationStart', 'gospelPresentationComplete', 'inviteFriend', 'prayerRequest', 'rsvp', 'share', 'specialVideoStart', 'specialVideoComplete');

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "endEventLabel" "EventLabel",
ADD COLUMN     "eventLabel" "EventLabel";

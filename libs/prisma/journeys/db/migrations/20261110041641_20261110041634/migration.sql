-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "captureIdentity" TEXT,
ADD COLUMN     "captureTag" "EventLabel",
ADD COLUMN     "captureTrigger" TEXT,
ADD COLUMN     "templateFamilyId" TEXT;

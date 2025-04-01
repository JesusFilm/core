-- AlterTable
ALTER TABLE "JourneyEventsExportLog" ALTER COLUMN "dateRangeEnd" DROP NOT NULL,
ALTER COLUMN "dateRangeEnd" DROP DEFAULT;

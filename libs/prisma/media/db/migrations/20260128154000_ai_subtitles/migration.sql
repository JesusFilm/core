-- Add new status values
ALTER TYPE "MuxSubtitleTrackStatus" ADD VALUE IF NOT EXISTS 'not_requested';
ALTER TYPE "MuxSubtitleTrackStatus" ADD VALUE IF NOT EXISTS 'queued';

-- Allow trackId to be nullable until generated
ALTER TABLE "MuxSubtitleTrack" ALTER COLUMN "trackId" DROP NOT NULL;

-- Add workflow tracking fields
ALTER TABLE "MuxSubtitleTrack" ADD COLUMN "workflowRunId" TEXT;
ALTER TABLE "MuxSubtitleTrack" ADD COLUMN "vttUrl" TEXT;
ALTER TABLE "MuxSubtitleTrack" ADD COLUMN "errorMessage" TEXT;

-- Add idempotent uniqueness for generated tracks
CREATE UNIQUE INDEX "MuxSubtitleTrack_muxVideoId_bcp47_source_key" ON "MuxSubtitleTrack"("muxVideoId", "bcp47", "source");

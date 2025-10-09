-- AlterTable
ALTER TABLE "JourneyVisitor" ADD COLUMN     "lastMultiselectSubmission" TEXT;

-- CreateIndex
CREATE INDEX "JourneyVisitor_lastMultiselectSubmission_idx" ON "JourneyVisitor"("lastMultiselectSubmission");

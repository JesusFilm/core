-- CreateEnum
CREATE TYPE "JourneyCustomizationFieldType" AS ENUM ('text', 'link');

-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "journeyCustomizationDescription" TEXT;

-- CreateTable
CREATE TABLE "JourneyCustomizationField" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "defaultValue" TEXT,
    "fieldType" "JourneyCustomizationFieldType" NOT NULL,

    CONSTRAINT "JourneyCustomizationField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JourneyCustomizationField_journeyId_idx" ON "JourneyCustomizationField"("journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyCustomizationField_journeyId_key_key" ON "JourneyCustomizationField"("journeyId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyCustomizationField_journeyId_key_value_key" ON "JourneyCustomizationField"("journeyId", "key", "value");

-- AddForeignKey
ALTER TABLE "JourneyCustomizationField" ADD CONSTRAINT "JourneyCustomizationField_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

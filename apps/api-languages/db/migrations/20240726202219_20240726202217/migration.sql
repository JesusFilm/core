/*
  Warnings:

  - You are about to drop the `CountryContinent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CountryContinent" DROP CONSTRAINT "CountryContinent_countryId_fkey";

-- DropForeignKey
ALTER TABLE "CountryContinent" DROP CONSTRAINT "CountryContinent_languageId_fkey";

-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "continentId" TEXT;

-- AlterTable
ALTER TABLE "Language" ADD COLUMN     "hasVideos" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "CountryContinent";

-- CreateTable
CREATE TABLE "CountryLanguage" (
    "id" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "speakers" INTEGER NOT NULL,
    "displaySpeakers" INTEGER,

    CONSTRAINT "CountryLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Continent" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Continent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContinentName" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "continentId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,

    CONSTRAINT "ContinentName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CountryLanguage_languageId_idx" ON "CountryLanguage"("languageId");

-- CreateIndex
CREATE INDEX "CountryLanguage_countryId_idx" ON "CountryLanguage"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "CountryLanguage_languageId_countryId_key" ON "CountryLanguage"("languageId", "countryId");

-- CreateIndex
CREATE INDEX "ContinentName_languageId_idx" ON "ContinentName"("languageId");

-- CreateIndex
CREATE INDEX "ContinentName_primary_idx" ON "ContinentName"("primary");

-- CreateIndex
CREATE INDEX "ContinentName_continentId_idx" ON "ContinentName"("continentId");

-- CreateIndex
CREATE UNIQUE INDEX "ContinentName_languageId_continentId_key" ON "ContinentName"("languageId", "continentId");

-- CreateIndex
CREATE INDEX "Language_hasVideos_idx" ON "Language"("hasVideos");

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_continentId_fkey" FOREIGN KEY ("continentId") REFERENCES "Continent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryLanguage" ADD CONSTRAINT "CountryLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryLanguage" ADD CONSTRAINT "CountryLanguage_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContinentName" ADD CONSTRAINT "ContinentName_continentId_fkey" FOREIGN KEY ("continentId") REFERENCES "Continent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContinentName" ADD CONSTRAINT "ContinentName_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[languageId,countryId,suggested]` on the table `CountryLanguage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CountryLanguage_languageId_countryId_key";

-- CreateIndex
CREATE UNIQUE INDEX "CountryLanguage_languageId_countryId_suggested_key" ON "CountryLanguage"("languageId", "countryId", "suggested");

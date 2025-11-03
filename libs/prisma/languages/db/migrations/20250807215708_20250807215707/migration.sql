-- CreateExtension
CREATE extension IF NOT EXISTS pg_trgm;

-- DropIndex
DROP INDEX "AudioPreview_languageId_idx";

-- CreateIndex
CREATE INDEX "CountryLanguage_countryId_suggested_idx" ON "CountryLanguage"("countryId", "suggested");

-- CreateIndex
CREATE INDEX "CountryName_value_trgm_idx" ON "CountryName" USING GIN ("value" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Language_iso3_idx" ON "Language"("iso3");

-- CreateIndex
CREATE INDEX "LanguageName_value_trgm_idx" ON "LanguageName" USING GIN ("value" gin_trgm_ops);

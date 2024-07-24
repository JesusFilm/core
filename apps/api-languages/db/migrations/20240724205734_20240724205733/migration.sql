-- CreateTable
CREATE TABLE "CountryLanguage" (
    "id" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "speakers" INTEGER NOT NULL,
    "displaySpeakers" INTEGER,

    CONSTRAINT "CountryLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CountryLanguage_languageId_idx" ON "CountryLanguage"("languageId");

-- CreateIndex
CREATE INDEX "CountryLanguage_countryId_idx" ON "CountryLanguage"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "CountryLanguage_languageId_countryId_key" ON "CountryLanguage"("languageId", "countryId");

-- AddForeignKey
ALTER TABLE "CountryLanguage" ADD CONSTRAINT "CountryLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryLanguage" ADD CONSTRAINT "CountryLanguage_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

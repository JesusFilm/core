-- DropIndex
DROP INDEX "LanguageName_parentLanguageId_primary_key";

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "population" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "flagPngSrc" TEXT,
    "flagWebpSrc" TEXT,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryName" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,

    CONSTRAINT "CountryName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryContinent" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,

    CONSTRAINT "CountryContinent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CountryToLanguage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "CountryName_languageId_idx" ON "CountryName"("languageId");

-- CreateIndex
CREATE INDEX "CountryName_primary_idx" ON "CountryName"("primary");

-- CreateIndex
CREATE INDEX "CountryName_countryId_idx" ON "CountryName"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "CountryName_languageId_countryId_key" ON "CountryName"("languageId", "countryId");

-- CreateIndex
CREATE INDEX "CountryContinent_languageId_idx" ON "CountryContinent"("languageId");

-- CreateIndex
CREATE INDEX "CountryContinent_primary_idx" ON "CountryContinent"("primary");

-- CreateIndex
CREATE INDEX "CountryContinent_countryId_idx" ON "CountryContinent"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "CountryContinent_languageId_countryId_key" ON "CountryContinent"("languageId", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "_CountryToLanguage_AB_unique" ON "_CountryToLanguage"("A", "B");

-- CreateIndex
CREATE INDEX "_CountryToLanguage_B_index" ON "_CountryToLanguage"("B");

-- AddForeignKey
ALTER TABLE "CountryName" ADD CONSTRAINT "CountryName_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryName" ADD CONSTRAINT "CountryName_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryContinent" ADD CONSTRAINT "CountryContinent_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryContinent" ADD CONSTRAINT "CountryContinent_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToLanguage" ADD CONSTRAINT "_CountryToLanguage_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToLanguage" ADD CONSTRAINT "_CountryToLanguage_B_fkey" FOREIGN KEY ("B") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

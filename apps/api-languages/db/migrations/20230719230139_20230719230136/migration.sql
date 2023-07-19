/*
  Warnings:

  - You are about to drop the `Continent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Country` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ContinentToCountry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CountryToLanguage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Continent" DROP CONSTRAINT "Continent_languageId_fkey";

-- DropForeignKey
ALTER TABLE "_ContinentToCountry" DROP CONSTRAINT "_ContinentToCountry_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContinentToCountry" DROP CONSTRAINT "_ContinentToCountry_B_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToLanguage" DROP CONSTRAINT "_CountryToLanguage_A_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToLanguage" DROP CONSTRAINT "_CountryToLanguage_B_fkey";

-- DropTable
DROP TABLE "Continent";

-- DropTable
DROP TABLE "Country";

-- DropTable
DROP TABLE "_ContinentToCountry";

-- DropTable
DROP TABLE "_CountryToLanguage";

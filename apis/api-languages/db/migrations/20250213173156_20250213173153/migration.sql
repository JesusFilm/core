-- AlterTable
ALTER TABLE "_CountryToLanguage" ADD CONSTRAINT "_CountryToLanguage_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CountryToLanguage_AB_unique";

-- AlterTable
ALTER TABLE "CountryLanguage" ADD COLUMN     "order" INTEGER,
ADD COLUMN     "suggested" BOOLEAN NOT NULL DEFAULT false;

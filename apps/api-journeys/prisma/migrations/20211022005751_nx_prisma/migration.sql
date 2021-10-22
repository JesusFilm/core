-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "description" TEXT NOT NULL DEFAULT E'test description',
ADD COLUMN     "primaryImageBlockId" TEXT NOT NULL DEFAULT E'test_pibID';

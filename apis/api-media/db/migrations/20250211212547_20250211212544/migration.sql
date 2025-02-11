-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "_ParentChild" ADD CONSTRAINT "_ParentChild_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ParentChild_AB_unique";

-- AlterTable
ALTER TABLE "_VideoToKeyword" ADD CONSTRAINT "_VideoToKeyword_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_VideoToKeyword_AB_unique";

-- DropForeignKey
ALTER TABLE "Journey" DROP CONSTRAINT "Journey_teamId_fkey";

-- AlterTable
ALTER TABLE "Journey" ALTER COLUMN "teamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

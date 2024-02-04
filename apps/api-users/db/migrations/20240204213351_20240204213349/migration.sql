-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailPreferencesId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_emailPreferencesId_fkey" FOREIGN KEY ("emailPreferencesId") REFERENCES "EmailPreferences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

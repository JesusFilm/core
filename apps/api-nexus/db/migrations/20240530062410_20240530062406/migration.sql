/*
  Warnings:

  - The values [deleted,published,uploaded] on the enum `ResourceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `status` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the `ChannelYoutube` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ResourceStatus_new" AS ENUM ('created', 'processing', 'error');
ALTER TABLE "Resource" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Resource" ALTER COLUMN "status" TYPE "ResourceStatus_new" USING ("status"::text::"ResourceStatus_new");
ALTER TYPE "ResourceStatus" RENAME TO "ResourceStatus_old";
ALTER TYPE "ResourceStatus_new" RENAME TO "ResourceStatus";
DROP TYPE "ResourceStatus_old";
ALTER TABLE "Resource" ALTER COLUMN "status" SET DEFAULT 'created';
COMMIT;

-- DropForeignKey
ALTER TABLE "ChannelYoutube" DROP CONSTRAINT "ChannelYoutube_channelId_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "status",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "youtubeId" TEXT;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "publishedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'created';

-- DropTable
DROP TABLE "ChannelYoutube";

-- DropEnum
DROP TYPE "ChannelStatus";

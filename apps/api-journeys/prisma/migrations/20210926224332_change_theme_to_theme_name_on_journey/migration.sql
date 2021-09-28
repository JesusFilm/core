/*
  Warnings:

  - The values [default] on the enum `ThemeName` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `theme` on the `Journey` table. All the data in the column will be lost.

*/
BEGIN;
ALTER TABLE "Journey" DROP COLUMN "theme";
DROP TYPE "ThemeName";
CREATE TYPE "ThemeName" AS ENUM ('light');
ALTER TABLE "Journey" ADD COLUMN "themeName" "ThemeName" NOT NULL DEFAULT E'light';
COMMIT;

BEGIN;
ALTER TABLE "Journey" DROP COLUMN "themeName";
DROP TYPE "ThemeName";
CREATE TYPE "ThemeMode" AS ENUM ('light', 'dark');
CREATE TYPE "ThemeName" AS ENUM ('base');
ALTER TABLE "Journey" ADD COLUMN "themeName" "ThemeName" NOT NULL DEFAULT E'base',
ADD COLUMN "themeMode" "ThemeMode" NOT NULL DEFAULT E'light';
COMMIT;

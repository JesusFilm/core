-- One button-corners control replaces the button shape: "buttonRadius" now takes
-- the four "CampaignRadius" values. Each row keeps the corners its buttons render
-- with today: pill becomes veryRounded (now the pill look), and any other row
-- followed the theme's "radius", so it takes that value (veryRounded, which used
-- to be 24px and is now the pill, becomes rounded).
ALTER TABLE "CampaignTheme" ALTER COLUMN "buttonRadius" DROP DEFAULT;

ALTER TABLE "CampaignTheme"
  ALTER COLUMN "buttonRadius" TYPE "CampaignRadius"
  USING (
    CASE
      WHEN "buttonRadius"::text = 'pill' THEN 'veryRounded'
      WHEN "radius" = 'veryRounded' THEN 'rounded'
      ELSE "radius"
    END
  )::"CampaignRadius";

ALTER TABLE "CampaignTheme" ALTER COLUMN "buttonRadius" SET DEFAULT 'veryRounded';

-- DropEnum
DROP TYPE "CampaignButtonRadius";

-- One button-corners control replaces the button shape: "buttonRadius" now takes
-- the four "CampaignRadius" values. pill becomes veryRounded, rounded stays rounded.
ALTER TABLE "CampaignTheme" ALTER COLUMN "buttonRadius" DROP DEFAULT;

ALTER TABLE "CampaignTheme"
  ALTER COLUMN "buttonRadius" TYPE "CampaignRadius"
  USING (
    CASE "buttonRadius"::text
      WHEN 'pill' THEN 'veryRounded'
      ELSE 'rounded'
    END
  )::"CampaignRadius";

ALTER TABLE "CampaignTheme" ALTER COLUMN "buttonRadius" SET DEFAULT 'veryRounded';

-- DropEnum
DROP TYPE "CampaignButtonRadius";

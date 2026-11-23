-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "biblicallyAccuratePortrayal" BOOLEAN,
ADD COLUMN     "gospelEndSeconds" INTEGER,
ADD COLUMN     "gospelPresentation" BOOLEAN,
ADD COLUMN     "gospelStartSeconds" INTEGER,
ADD COLUMN     "opportunityToRespond" BOOLEAN,
ADD COLUMN     "opportunityToRespondEndSeconds" INTEGER,
ADD COLUMN     "personOfJesusDisplayed" BOOLEAN,
ADD COLUMN     "validationComments" TEXT;

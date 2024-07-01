/*
  Warnings:

  - The values [menu] on the enum `MessagePlatform` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MessagePlatform_new" AS ENUM ('facebook', 'telegram', 'whatsApp', 'instagram', 'viber', 'vk', 'snapchat', 'skype', 'line', 'tikTok', 'custom', 'globe2', 'globe3', 'messageText1', 'messageText2', 'send1', 'send2', 'messageChat2', 'messageCircle', 'messageNotifyCircle', 'messageNotifySquare', 'messageSquare', 'mail1', 'linkExternal', 'home4', 'home3', 'helpCircle', 'helpSquare', 'shieldCheck', 'menu1', 'checkBroken', 'checkContained', 'settings');
ALTER TABLE "ChatButton" ALTER COLUMN "platform" TYPE "MessagePlatform_new" USING ("platform"::text::"MessagePlatform_new");
ALTER TABLE "Event" ALTER COLUMN "messagePlatform" TYPE "MessagePlatform_new" USING ("messagePlatform"::text::"MessagePlatform_new");
ALTER TABLE "Visitor" ALTER COLUMN "lastChatPlatform" TYPE "MessagePlatform_new" USING ("lastChatPlatform"::text::"MessagePlatform_new");
ALTER TABLE "Visitor" ALTER COLUMN "messagePlatform" TYPE "MessagePlatform_new" USING ("messagePlatform"::text::"MessagePlatform_new");
ALTER TABLE "JourneyVisitor" ALTER COLUMN "lastChatPlatform" TYPE "MessagePlatform_new" USING ("lastChatPlatform"::text::"MessagePlatform_new");
ALTER TYPE "MessagePlatform" RENAME TO "MessagePlatform_old";
ALTER TYPE "MessagePlatform_new" RENAME TO "MessagePlatform";
DROP TYPE "MessagePlatform_old";
COMMIT;

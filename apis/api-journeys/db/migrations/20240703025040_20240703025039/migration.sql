-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MessagePlatform" ADD VALUE 'globe2';
ALTER TYPE "MessagePlatform" ADD VALUE 'globe3';
ALTER TYPE "MessagePlatform" ADD VALUE 'messageText1';
ALTER TYPE "MessagePlatform" ADD VALUE 'messageText2';
ALTER TYPE "MessagePlatform" ADD VALUE 'send1';
ALTER TYPE "MessagePlatform" ADD VALUE 'send2';
ALTER TYPE "MessagePlatform" ADD VALUE 'messageChat2';
ALTER TYPE "MessagePlatform" ADD VALUE 'messageCircle';
ALTER TYPE "MessagePlatform" ADD VALUE 'messageNotifyCircle';
ALTER TYPE "MessagePlatform" ADD VALUE 'messageNotifySquare';
ALTER TYPE "MessagePlatform" ADD VALUE 'messageSquare';
ALTER TYPE "MessagePlatform" ADD VALUE 'mail1';
ALTER TYPE "MessagePlatform" ADD VALUE 'linkExternal';
ALTER TYPE "MessagePlatform" ADD VALUE 'home3';
ALTER TYPE "MessagePlatform" ADD VALUE 'home4';
ALTER TYPE "MessagePlatform" ADD VALUE 'helpCircleContained';
ALTER TYPE "MessagePlatform" ADD VALUE 'helpSquareContained';
ALTER TYPE "MessagePlatform" ADD VALUE 'shieldCheck';
ALTER TYPE "MessagePlatform" ADD VALUE 'menu1';
ALTER TYPE "MessagePlatform" ADD VALUE 'checkBroken';
ALTER TYPE "MessagePlatform" ADD VALUE 'checkContained';
ALTER TYPE "MessagePlatform" ADD VALUE 'settings';

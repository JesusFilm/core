-- AlterEnum
-- `youtube` is the first Service value that names a product surface rather than
-- an api-* service. That is deliberate: the youtube-studio (Wheat) app mints
-- short links directly, and needs to be attributable as itself rather than
-- borrowing `apiMedia`. Nothing branches on `service` at redirect time — this is
-- provenance and enumeration only.
ALTER TYPE "Service" ADD VALUE 'youtube';

-- AlterTable
-- A single namespaced `<scheme>:<value>` attribution for the thing a link was
-- minted for. First registered scheme: `youtube-channel:<channelId>`.
ALTER TABLE "ShortLink" ADD COLUMN "sourceRef" TEXT;

-- CreateIndex
-- Supports the enumeration query: service = 'youtube' AND sourceRef = 'youtube-channel:UC...'
CREATE INDEX "ShortLink_service_sourceRef_idx" ON "ShortLink"("service", "sourceRef");

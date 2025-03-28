-- CreateEnum
CREATE TYPE "Service" AS ENUM ('apiJourneys', 'apiLanguages', 'apiMedia', 'apiTags', 'apiUsers', 'apiVideos');

-- CreateTable
CREATE TABLE "TagName" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TagName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "service" "Service",

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tagging" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tagId" TEXT NOT NULL,
    "taggableType" TEXT NOT NULL,
    "taggableId" TEXT NOT NULL,
    "context" TEXT NOT NULL,

    CONSTRAINT "Tagging_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TagName_value_idx" ON "TagName"("value");

-- CreateIndex
CREATE INDEX "TagName_primary_idx" ON "TagName"("primary");

-- CreateIndex
CREATE INDEX "TagName_languageId_idx" ON "TagName"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "TagName_tagId_languageId_key" ON "TagName"("tagId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tagging_tagId_idx" ON "Tagging"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Tagging_taggableId_taggableType_tagId_context_key" ON "Tagging"("taggableId", "taggableType", "tagId", "context");

-- AddForeignKey
ALTER TABLE "TagName" ADD CONSTRAINT "TagName_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tagging" ADD CONSTRAINT "Tagging_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "TemplateResource" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,

    CONSTRAINT "TemplateResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateResource_resourceId_key" ON "TemplateResource"("resourceId");

-- AddForeignKey
ALTER TABLE "TemplateResource" ADD CONSTRAINT "TemplateResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

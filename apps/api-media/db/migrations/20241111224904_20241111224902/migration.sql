-- CreateTable
CREATE TABLE "ShortLinkDomain" (
    "id" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "services" "Service"[],

    CONSTRAINT "ShortLinkDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortLink" (
    "id" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "service" "Service" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortLinkDomain_hostname_key" ON "ShortLinkDomain"("hostname");

-- CreateIndex
CREATE UNIQUE INDEX "ShortLink_pathname_domainId_key" ON "ShortLink"("pathname", "domainId");

-- AddForeignKey
ALTER TABLE "ShortLink" ADD CONSTRAINT "ShortLink_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "ShortLinkDomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

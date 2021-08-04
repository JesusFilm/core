CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateTable
CREATE TABLE "Journey" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

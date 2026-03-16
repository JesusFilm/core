#!/bin/sh
set -e

pnpm exec prisma migrate deploy --config ./prisma-media/prisma.config.ts
pnpm exec prisma migrate deploy --config ./prisma-languages/prisma.config.ts

exec env NODE_OPTIONS='-r next-logger' pnpm start

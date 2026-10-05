#!/bin/sh
set -e

pnpm exec prisma migrate deploy --config ./prisma-journeys/prisma.config.ts
pnpm exec prisma migrate deploy --config ./prisma-users/prisma.config.ts

exec node ./main.js

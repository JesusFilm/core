#!/bin/sh
set -e

pnpm exec prisma migrate deploy --config ./prisma/prisma.config.ts

exec node ./main.js

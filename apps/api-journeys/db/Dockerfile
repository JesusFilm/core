FROM node:20-alpine

ENV PRISMA_LOCATION_JOURNEYS=/app/node_modules/.prisma/api-journeys-client

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-journeys /app/apps/api-journeys

RUN bun install --save-dev --silent ts-node@10.9.1 tslib@^2.6.2 uuid prisma@^5.2.0 @types/node@20.12.2 lodash@^4.17.21
RUN bun install --silent @prisma/client@^5.2.0 
RUN bunx prisma@^5.2.0 generate --schema /app/apps/api-journeys/db/schema.prisma --generator client

CMD bunx prisma@^5.2.0 migrate deploy --schema /app/apps/api-journeys/db/schema.prisma; bun run ts-node /app/apps/api-journeys/db/seed.ts

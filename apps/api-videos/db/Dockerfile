FROM node:20-alpine

ENV PRISMA_LOCATION_VIDEOS=/app/node_modules/.prisma/api-videos-client

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-videos /app/apps/api-videos

RUN bun install --silent node-fetch@2.6.7 ts-node@^10.9.1 tslib@^2.6.2 prisma@^5.2.0 @prisma/client@^5.2.0 lodash@^4.17.21 jsondiffpatch@^0.5.0
RUN bunx prisma@^5.2.0 generate --schema /app/apps/api-videos/db/schema.prisma --generator client

CMD bunx prisma@^5.2.0 migrate deploy --schema /app/apps/api-videos/db/schema.prisma; bun run ts-node /app/apps/api-videos/db/seed.ts
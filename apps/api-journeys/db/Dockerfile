FROM node:20-alpine

ENV PRISMA_LOCATION_JOURNEYS=/app/node_modules/.prisma/api-journeys-client
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

RUN corepack enable

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-journeys /app/apps/api-journeys

RUN pnpm install --save-dev --silent ts-node@10.9.1 tslib@^2.6.2 uuid prisma@^5.2.0 @types/node@20.12.2 lodash@^4.17.21
RUN pnpm install --silent @prisma/client@^5.2.0 
RUN pnpm exec prisma generate --schema /app/apps/api-journeys/db/schema.prisma --generator client

CMD pnpm exec prisma migrate deploy --schema /app/apps/api-journeys/db/schema.prisma; pnpm exec ts-node /app/apps/api-journeys/db/seed.ts

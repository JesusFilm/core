FROM node:20-alpine

ENV PRISMA_LOCATION_LANGUAGES=/app/node_modules/.prisma/api-languages-client
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

RUN corepack enable

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-languages /app/apps/api-languages

RUN pnpm install lodash@^4.17.21 node-fetch@2.6.7 slugify@^1.6.6 ts-node@^10.9.1 tslib@^2.6.2 prisma@^5.2.0 @prisma/client@^5.2.0
RUN pnpm exec prisma generate --schema /app/apps/api-languages/db/schema.prisma --generator client

CMD pnpm exec prisma migrate deploy --schema /app/apps/api-languages/db/schema.prisma; pnpm run ts-node /app/apps/api-languages/db/seed.ts
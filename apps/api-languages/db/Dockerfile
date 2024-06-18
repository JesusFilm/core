FROM node:20-alpine

ENV PRISMA_LOCATION_LANGUAGES=/app/node_modules/.prisma/api-languages-client

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

ENV BUN_INSTALL="/bun"
ENV PATH=$BUN_INSTALL/bin:$PATH

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.1.13"

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-languages /app/apps/api-languages

RUN bun install lodash@^4.17.21 node-fetch@2.6.7 slugify@^1.6.6 ts-node@^10.9.1 tslib@^2.6.2 prisma@^5.2.0 @prisma/client@^5.2.0
RUN bunx prisma@^5.2.0 generate --schema /app/apps/api-languages/db/schema.prisma --generator client

CMD bunx prisma@^5.2.0 migrate deploy --schema /app/apps/api-languages/db/schema.prisma; bun run ts-node /app/apps/api-languages/db/seed.ts
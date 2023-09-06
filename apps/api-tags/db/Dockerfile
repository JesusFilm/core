FROM node:18-alpine

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-tags-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-tags /app/apps/api-tags

RUN npm install --silent ts-node@^10.9.1 tslib@^2.3.1 prisma@^4.15.0 @prisma/client@^4.15.0
RUN npx prisma@^4.15.0 generate --schema /app/apps/api-tags/db/schema.prisma

CMD npx prisma@^4.15.0 migrate deploy --schema /app/apps/api-tags/db/schemaprisma; npm run ts-node /app/apps/api-tags/db/seed.ts

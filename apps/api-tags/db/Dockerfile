FROM node:16-alpine

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-tags-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-tags /app/apps/api-tags

WORKDIR /prisma
COPY ./apps/api-tags/db .
RUN npm install --silent prisma@^3.15.2
RUN npx prisma@^3.15.2 generate

WORKDIR /app
RUN npm install --silent arangojs@^7.6.1 ts-node@^10.9.1 tslib@^2.3.1 prisma@^3.15.2 @prisma/client@^3.15.2
CMD npx prisma@^3.15.2 migrate deploy --schema /prisma/schema.prisma; npx ts-node /app/apps/api-tags/db/seed.ts
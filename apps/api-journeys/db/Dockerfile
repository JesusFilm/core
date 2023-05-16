FROM node:16-alpine

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-tags-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-journeys /app/apps/api-journeys

WORKDIR /prisma
COPY ./apps/api-journeys/db .
RUN npm install --silent prisma@^4.13.0
RUN npx prisma@^4.13.0 generate

RUN npm install arangojs@^7.6.1 ts-node@^10.9.1 tslib@^2.3.1 uuid prisma@^4.13.0 @prisma/client@^4.13.0
CMD npx prisma@^4.13.0 migrate deploy --schema /prisma/schema.prisma; npx ts-node /app/apps/api-journeys/db/seed.ts
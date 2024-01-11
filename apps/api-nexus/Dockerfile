FROM node:18-alpine

EXPOSE 4007

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-nexus-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-nexus .

# dependencies that nestjs needs
RUN npm install --production --silent

WORKDIR /prisma
COPY ./apps/api-nexus/db .
RUN npx prisma@^5.2.0 generate

WORKDIR /app

RUN npm install tslib@^2.6.2 @nestjs/mapped-types prisma@^5.2.0 @prisma/client@^5.2.0 pino-pretty@^10.2.0
CMD npx prisma@^5.2.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
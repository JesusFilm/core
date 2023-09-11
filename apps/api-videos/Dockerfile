FROM node:18-alpine

EXPOSE 4004

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-videos-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-videos .

# dependencies that nestjs needs
RUN npm install --production --silent --force

WORKDIR /prisma
COPY ./apps/api-videos/db .
RUN npx prisma@^4.15.0 generate

WORKDIR /app

RUN npm install tslib @nestjs/mapped-types pino-pretty@9.1.1 prisma@^4.15.0 @prisma/client@^4.15.0 --force
CMD npx prisma@^4.15.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js

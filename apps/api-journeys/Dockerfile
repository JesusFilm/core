FROM node:20-alpine

EXPOSE 4001

ENV PRISMA_LOCATION_JOURNEYS=/app/node_modules/.prisma/api-journeys-client

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

RUN apk add --no-cache python3 py3-pip curl-dev

WORKDIR /app
COPY ./dist/apps/api-journeys .

# dependencies that nestjs needs
RUN npm install --production

WORKDIR /prisma
COPY ./apps/api-journeys/db .
RUN npx prisma@^5.2.0 generate --generator client

WORKDIR /app

RUN npm install tslib@^2.6.2 @nestjs/mapped-types prisma@^5.2.0 @prisma/client@^5.2.0 pino-pretty@^10.2.0
CMD npx prisma@^5.2.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
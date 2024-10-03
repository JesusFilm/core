FROM node:20-alpine

EXPOSE 4004

ENV PRISMA_LOCATION_JOURNEYS_MODERN=/app/node_modules/.prisma/api-journeys-modern-client

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

RUN apk add --no-cache python3 py3-pip curl-dev

WORKDIR /app
COPY ./dist/apps/api-journeys-modern .

# dependencies that nestjs needs
RUN npm install --production

WORKDIR /prisma
COPY ./apps/api-journeys-modern/db .
RUN npx prisma@^5.2.0 generate --generator client

WORKDIR /app

RUN npm install tslib@^2.6.2 @prisma/client@^5.2.0
CMD npx prisma@^5.2.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
FROM node:20-alpine

EXPOSE 4001

ENV PRISMA_LOCATION_ANALYTICS=/app/node_modules/.prisma/api-analytics-client

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-analytics .

# dependencies that nestjs needs
RUN npm install --production --silent

WORKDIR /prisma
COPY ./apps/api-analytics/db .
RUN npx prisma@^5.2.0 generate --generator client

WORKDIR /app

RUN npm install tslib@^2.6.2 @nestjs/mapped-types prisma@^5.2.0 @prisma/client@^5.2.0 pino-pretty@^10.2.0
CMD node ./main.js
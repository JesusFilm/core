FROM node:16-alpine

EXPOSE 4001

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-journeys-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-journeys .
RUN npm install --production --silent

WORKDIR /prisma
COPY ./apps/api-journeys/db .
RUN npx prisma@^4.13.0 generate

WORKDIR /app
# dependencies that nestjs needs

RUN npm install tslib apollo-server-express @nestjs/mapped-types @prisma/client@^4.13.0 pino-pretty@9.1.1
CMD npx prisma@^4.13.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
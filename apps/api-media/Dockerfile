FROM node:18-alpine

EXPOSE 4005

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-media-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-media .

# dependencies that nestjs needs
RUN npm install --production --silent

WORKDIR /prisma
COPY ./apps/api-media/db .
RUN npx prisma@^4.15.0 generate

WORKDIR /app

RUN npm install tslib @nestjs/mapped-types prisma@^4.15.0 @prisma/client@^4.15.0 pino-pretty@9.1.1 form-data
CMD npx prisma@^4.15.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
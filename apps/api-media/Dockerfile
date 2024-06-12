FROM node:20-alpine

EXPOSE 4005

ENV PRISMA_LOCATION_MEDIA=/app/node_modules/.prisma/api-media-client
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

RUN corepack enable

WORKDIR /app
COPY ./dist/apps/api-media .

# dependencies that nestjs needs
RUN pnpm install --production --silent

WORKDIR /prisma
COPY ./apps/api-media/db .
RUN pnpx prisma@^5.2.0 generate --generator client

WORKDIR /app

RUN pnpm install tslib@^2.6.2 @nestjs/mapped-types prisma@^5.2.0 @prisma/client@^5.2.0 pino-pretty@^10.2.0 form-data@^4.0.0
CMD pnpx prisma@^5.2.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
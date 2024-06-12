FROM node:20-alpine

EXPOSE 4004

ENV PRISMA_LOCATION_VIDEOS=/app/node_modules/.prisma/api-videos-client
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

RUN corepack enable

WORKDIR /app
COPY ./dist/apps/api-videos .

# dependencies that nestjs needs
RUN pnpm install --production --silent --force

WORKDIR /prisma
COPY ./apps/api-videos/db .
RUN pnpx prisma@^5.2.0 generate --generator client

WORKDIR /app

RUN pnpm install tslib@^2.6.2 @nestjs/mapped-types pino-pretty@^10.2.0 prisma@^5.2.0 @prisma/client@^5.2.0 --force
CMD pnpx prisma@^5.2.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js

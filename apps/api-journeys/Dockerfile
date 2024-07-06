FROM node:20-alpine

EXPOSE 4001

ENV PRISMA_LOCATION_JOURNEYS=/app/node_modules/.prisma/api-journeys-client
ENV BUN_INSTALL=/bun
ENV PATH=${BUN_INSTALL}/bin:${PATH}

RUN apk upgrade --update-cache --available && \
    apk add --no-cache bash curl gcompat && \
    rm -rf /var/cache/apk/*

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.1.18"

WORKDIR /app
COPY ./dist/apps/api-journeys .

# dependencies that nestjs needs
RUN bun install --production --silent --frozen-lockfile

WORKDIR /prisma
COPY ./apps/api-journeys/db .
RUN bunx prisma@^5.2.0 generate --generator client

WORKDIR /app

RUN bun install tslib@^2.6.2 @nestjs/mapped-types prisma@^5.2.0 @prisma/client@^5.2.0 pino-pretty@^10.2.0
CMD bunx prisma@^5.2.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
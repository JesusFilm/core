FROM node:20-alpine

EXPOSE 4003

ENV PRISMA_LOCATION_LANGUAGES=/app/node_modules/.prisma/api-languages-client

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

ENV BUN_INSTALL="/bun"
ENV PATH=$BUN_INSTALL/bin:$PATH

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.1.16"

WORKDIR /app
COPY ./dist/apps/api-languages .

# dependencies that nestjs needs
RUN bun install --production --silent

WORKDIR /prisma
COPY ./apps/api-languages/db .
RUN bunx prisma@^5.2.0 generate --generator client

WORKDIR /app
RUN bun install tslib@^2.6.2 @nestjs/mapped-types @prisma/client@^5.2.0 pino-pretty@^10.2.0

CMD bunx prisma@^5.2.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
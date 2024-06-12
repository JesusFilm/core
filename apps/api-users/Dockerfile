FROM node:20-alpine

EXPOSE 4002

ENV PRISMA_LOCATION_USERS=/app/node_modules/.prisma/api-users-client
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

RUN corepack enable

WORKDIR /app
COPY ./dist/apps/api-users .

# dependencies that nestjs needs
RUN pnpm install --production --silent

WORKDIR /prisma
COPY ./apps/api-users/db .
RUN pnpm dlx prisma@^5.2.0 generate --generator client

WORKDIR /app
RUN pnpm install tslib@^2.6.2 @nestjs/mapped-types @prisma/client@^5.2.0 pino-pretty@^10.2.0

CMD pnpm dlx prisma@^5.2.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
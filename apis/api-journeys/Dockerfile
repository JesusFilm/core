FROM node:22-alpine3.20

EXPOSE 4001

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-journeys .
COPY ./libs/prisma/journeys/db ./prisma/db
COPY ./libs/prisma/journeys/prisma.config.ts ./prisma/prisma.config.ts

RUN corepack enable && corepack prepare pnpm@10.15.1 --activate
RUN pnpm install --prod --silent
RUN pnpm add @prisma/client@7.4.2 @prisma/adapter-pg@7.4.2 dotenv
RUN pnpm add -D prisma@7.4.2
CMD pnpm exec prisma migrate deploy --config ./prisma/prisma.config.ts && node ./main.js

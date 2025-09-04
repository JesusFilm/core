FROM node:22-alpine3.20

EXPOSE 4005

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV PRISMA_LOCATION_MEDIA=/app/node_modules/.prisma/api-media-client
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev postgresql-client && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-media .
COPY ./libs/prisma/media/db ./prisma

RUN corepack enable && corepack prepare pnpm --activate
RUN pnpm install --prod --silent
RUN pnpm add @prisma/client@6.5.0
RUN pnpm add -D prisma@6.5.0
RUN pnpm exec prisma generate --generator client --schema ./prisma/schema.prisma

CMD pnpm exec prisma migrate deploy --schema ./prisma/schema.prisma; node ./main.js
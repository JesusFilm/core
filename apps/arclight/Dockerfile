FROM node:22-bullseye-slim

EXPOSE 3000

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV PRISMA_LOCATION_MEDIA=/app/node_modules/.prisma/api-media-client
ENV PRISMA_LOCATION_LANGUAGES=/app/node_modules/.prisma/api-languages-client
ENV VERCEL=true
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev postgresql-client && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/arclight .
COPY ./libs/prisma/media/db ./prisma-media
COPY ./libs/prisma/languages/db ./prisma-languages

# dependencies
RUN mkdir -p $PNPM_HOME && corepack enable && corepack prepare pnpm --activate
RUN pnpm add -g next
RUN pnpm install --prod --silent
RUN pnpm add sharp pino dd-trace next-logger @prisma/client@6.5.0 --silent
RUN pnpm add -D prisma@6.5.0
RUN pnpm exec prisma generate --generator client --schema ./prisma-media/schema.prisma
RUN pnpm exec prisma generate --generator client --schema ./prisma-languages/schema.prisma

CMD pnpm exec prisma migrate deploy --schema ./prisma-media/schema.prisma && \
    pnpm exec prisma migrate deploy --schema ./prisma-languages/schema.prisma && \
    NODE_OPTIONS='-r next-logger' pnpm start


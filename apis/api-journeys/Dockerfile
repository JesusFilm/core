FROM node:24-alpine3.23

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

COPY ./apis/api-journeys/docker-entrypoint.sh ./docker-entrypoint.sh

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
RUN pnpm install --prod --silent

ENTRYPOINT ["./docker-entrypoint.sh"]

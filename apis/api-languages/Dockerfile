FROM node:24.22.3-alpine3.23@sha256:3946fb783fdce8a2812136ea694bc95c698c4f4096f3fd18568dc27a8ac389dc

EXPOSE 4003

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-languages .
COPY ./libs/prisma/languages/db ./prisma/db
COPY ./libs/prisma/languages/prisma.config.ts ./prisma/prisma.config.ts
COPY ./apis/api-languages/docker-entrypoint.sh ./docker-entrypoint.sh

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
RUN pnpm install --prod --silent

# Fetch the native migration engine during the build, before offline startup.
RUN pnpm exec prisma --version

ENTRYPOINT ["./docker-entrypoint.sh"]

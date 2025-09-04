FROM node:22-alpine3.20

EXPOSE 4008

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV PRISMA_LOCATION_ANALYTICS=/app/node_modules/.prisma/api-analytics-client
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-analytics .
COPY ./pnpm-lock.yaml .
COPY ./pnpm-workspace.yaml .
COPY ./libs/prisma/analytics/db ./prisma

RUN corepack enable && corepack prepare pnpm --activate
RUN pnpm install --prod --force --silent
RUN pnpm add @prisma/client@6.5.0 --prod
RUN pnpm add -D prisma@6.5.0
RUN pnpm exec prisma generate --generator client --schema ./prisma/schema.prisma

CMD node ./main.js
FROM node:22-alpine3.20

EXPOSE 4005

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev postgresql-client && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-media .
COPY ./libs/prisma/media/db ./prisma-media/db
COPY ./libs/prisma/media/prisma.config.ts ./prisma-media/prisma.config.ts
COPY ./libs/prisma/languages/db ./prisma-languages/db
COPY ./libs/prisma/languages/prisma.config.ts ./prisma-languages/prisma.config.ts
COPY ./apis/api-media/docker-entrypoint.sh ./docker-entrypoint.sh

RUN corepack enable && corepack prepare pnpm@10.15.1 --activate
RUN pnpm install --prod --silent

ENTRYPOINT ["./docker-entrypoint.sh"]

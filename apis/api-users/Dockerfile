FROM node:22-alpine3.20

EXPOSE 4002

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV PRISMA_LOCATION_USERS=/app/node_modules/.prisma/api-users-client

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-users .
COPY ./apis/api-users/package.json .
COPY ./bun.lock .

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.15"
# dependencies that nestjs needs
RUN bun install --production --frozen-lockfile

WORKDIR /prisma
COPY ./apis/api-users/db .
RUN bunx prisma@6 generate --generator client

WORKDIR /app

RUN bun install @prisma/client@5
CMD bunx prisma@6 migrate deploy --schema /prisma/schema.prisma; node ./main.js
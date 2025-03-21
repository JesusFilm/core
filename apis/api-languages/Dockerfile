FROM node:22-alpine3.20

EXPOSE 4003

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV PRISMA_LOCATION_LANGUAGES=/app/node_modules/.prisma/api-languages-client

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

RUN apk add --no-cache g++ make python3 py3-pip curl-dev postgresql-client

WORKDIR /app
COPY ./dist/apps/api-languages .
COPY ./package-lock.json .

# dependencies that nestjs needs
RUN npm install --production

WORKDIR /prisma
COPY ./apis/api-languages/db .
RUN npx prisma@6 generate --generator client

WORKDIR /app

RUN npm install tslib@^2.6.2 @prisma/client@5
CMD npx prisma@6 migrate deploy --schema /prisma/schema.prisma; node ./main.js
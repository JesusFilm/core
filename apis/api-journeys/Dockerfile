FROM node:22-alpine3.20

EXPOSE 4001

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV PRISMA_LOCATION_JOURNEYS=/app/node_modules/.prisma/api-journeys-client

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-journeys .
COPY ./package-lock.json .

# dependencies that nestjs needs
RUN npm install --production

WORKDIR /prisma
COPY ./apis/api-journeys/db .
RUN npx prisma@6 generate --generator client

WORKDIR /app

RUN npm install tslib@^2.6.2 @nestjs/mapped-types @prisma/client@5 pino-pretty@^10.2.0
CMD npx prisma@6 migrate deploy --schema /prisma/schema.prisma; node ./main.js
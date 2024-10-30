FROM node:20-alpine

EXPOSE 4005

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV PRISMA_LOCATION_MEDIA=/app/node_modules/.prisma/api-media-client

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-media .

# dependencies that nestjs needs
RUN npm install --production

WORKDIR /prisma
COPY ./apps/api-media/db .
RUN npx prisma@^5.2.0 generate --generator client

WORKDIR /app

RUN npm install prisma@^5.2.0 @prisma/client@^5.2.0
CMD npx prisma@^5.2.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
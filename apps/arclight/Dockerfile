FROM node:22-bullseye-slim

EXPOSE 3000

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV PRISMA_LOCATION_MEDIA=/app/node_modules/.prisma/api-media-client
ENV PRISMA_LOCATION_LANGUAGES=/app/node_modules/.prisma/api-languages-client
ENV VERCEL=true

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev postgresql-client && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/arclight .
COPY ./package-lock.json .
COPY ./libs/prisma/media/db ./prisma-media
COPY ./libs/prisma/languages/db ./prisma-languages

# dependencies
RUN npm i -g next
RUN npm i --omit=dev --force --silent
RUN npm i sharp pino dd-trace next-logger @prisma/client@6.5.0 --force --silent
RUN npm install -D prisma@6.5.0
RUN npx prisma generate --generator client --schema ./prisma-media/schema.prisma
RUN npx prisma generate --generator client --schema ./prisma-languages/schema.prisma


CMD npx prisma migrate deploy --schema ./prisma-media/schema.prisma; \
    npx prisma migrate deploy --schema ./prisma-languages/schema.prisma; \
    NODE_OPTIONS='-r next-logger' npm start
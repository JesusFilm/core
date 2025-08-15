FROM node:22-alpine3.20

EXPOSE 4005

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev postgresql-client && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-media .
COPY ./package-lock.json .
COPY ./libs/prisma/media/db ./prisma

RUN npm install --production
RUN npm install @prisma/client@6.5.0
RUN npm install -D prisma@6.5.0
RUN npx prisma generate --generator client --schema ./prisma/schema.prisma

CMD npx prisma migrate deploy --schema ./prisma/schema.prisma; node ./main.js

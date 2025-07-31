FROM node:22-alpine3.20

EXPOSE 4002

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-users .
COPY ./package-lock.json .
RUN npm install --production

WORKDIR /prisma
COPY ./libs/prisma/users/db .

WORKDIR /app
CMD npx prisma@6 migrate deploy --schema /prisma/schema.prisma; node ./main.js
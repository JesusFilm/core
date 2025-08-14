FROM node:22-alpine3.20

EXPOSE 4002

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV PRISMA_LOCATION_USERS=/app/node_modules/.prisma/api-users-client

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev && \
    rm -rf /var/cache/apk/*

WORKDIR /build
COPY . .
RUN npm install
RUN nx prisma-generate prisma-users
RUN nx build api-users --production
RUN mv /build/dist/apps/api-users /app
RUN mv /build/node_modules /app/
RUN mv /build/package-lock.json /app/

WORKDIR /prisma/users
COPY ./libs/prisma/users/db .

WORKDIR /app
RUN rm -rf /build
RUN npm install --production
RUN npm install @prisma/client@6
CMD npx prisma@6 migrate deploy --schema /prisma/users/schema.prisma; node ./main.js
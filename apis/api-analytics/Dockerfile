FROM node:22-alpine3.20
ENV PRISMA_LOCATION_ANALYTICS=/app/node_modules/.prisma/api-analytics-client

EXPOSE 4008

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"

RUN apk upgrade --update-cache --available && \
    apk add g++ make python3 py3-pip curl-dev && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-analytics .
COPY ./package-lock.json .
COPY ./libs/prisma/analytics/db ./prisma

RUN npm install --production
RUN npm install @prisma/client@6.14.0
RUN npm install -D prisma@6.14.0
RUN npx prisma generate --generator client --schema ./prisma/schema.prisma

CMD node ./main.js
FROM node:20-alpine

EXPOSE 4001

ENV PRISMA_LOCATION_ANALYTICS=/app/node_modules/.prisma/api-analytics-client

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

RUN apk add git

WORKDIR /app
COPY ./dist/apps/api-analytics .

# dependencies that nestjs needs
RUN npm install --production --silent

WORKDIR /prisma
COPY ./apps/api-analytics/db .
RUN npx prisma@^5.2.0 generate --generator client

WORKDIR /app

RUN npm install uNetworking/uWebSockets.js#v20.44.0
CMD node ./main.js
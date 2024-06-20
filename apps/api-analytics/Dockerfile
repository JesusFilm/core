FROM node:20-bookworm-slim

EXPOSE 4008

ENV PRISMA_LOCATION_ANALYTICS=/app/node_modules/.prisma/api-analytics-client

RUN apt update
RUN apt install -y git

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
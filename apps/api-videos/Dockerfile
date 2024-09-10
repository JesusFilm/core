FROM node:20-alpine

EXPOSE 4004

ENV PRISMA_LOCATION_VIDEOS=/app/node_modules/.prisma/api-videos-client
ENV NODE_ENV=production

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-videos .

# dependencies that nestjs needs
RUN npm install --production --silent --force

WORKDIR /prisma
COPY ./apps/api-videos/db .
RUN npx prisma@^5.2.0 generate --generator client

WORKDIR /app

RUN npm install tslib@^2.6.2 @nestjs/mapped-types pino-pretty@^10.2.0 prisma@^5.2.0 @prisma/client@^5.2.0 --force
CMD npx prisma@^5.2.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js

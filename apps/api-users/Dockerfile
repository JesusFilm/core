FROM node:20-alpine

EXPOSE 4002

ENV PRISMA_LOCATION_USERS=/app/node_modules/.prisma/api-users-client

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

RUN apk add --no-cache python3 py3-pip

WORKDIR /app
COPY ./dist/apps/api-users .

# dependencies that nestjs needs
RUN npm install --production

WORKDIR /prisma
COPY ./apps/api-users/db .
RUN npx prisma@^5.2.0 generate --generator client

WORKDIR /app

RUN npm install tslib@^2.6.2 @prisma/client@^5.2.0 pino-pretty@^10.2.0
CMD npx prisma@^5.2.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
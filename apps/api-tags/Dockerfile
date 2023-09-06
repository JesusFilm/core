FROM node:18-alpine

EXPOSE 4006

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-tags-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-tags .

# dependencies that nestjs needs
RUN npm install --production --silent

WORKDIR /prisma
COPY ./apps/api-tags/db .
RUN npx prisma@^4.15.0 generate

WORKDIR /app
RUN npm install tslib @nestjs/mapped-types @prisma/client@^4.15.0 pino-pretty@9.1.1

CMD npx prisma@^4.15.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
FROM node:16-alpine

EXPOSE 4003

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-languages-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-languages .

# dependencies that nestjs needs
RUN npm install --production --silent --force

WORKDIR /prisma
COPY ./apps/api-languages/db .
RUN npx prisma@^4.15.0 generate

WORKDIR /app
RUN npm install tslib @nestjs/mapped-types @prisma/client@^4.15.0 pino-pretty@9.1.1 --force

CMD npx prisma@^4.15.0 migrate deploy --schema /prisma/schema.prisma; node ./main.js
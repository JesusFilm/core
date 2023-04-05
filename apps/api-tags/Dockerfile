FROM node:16-alpine

EXPOSE 4006

RUN apk upgrade --update-cache --available && \
    apk add openssl openssl-dev libc6-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-tags .

# dependencies that nestjs needs
RUN npm install --production --silent

WORKDIR /prisma
COPY ./apps/api-tags/db .
RUN npm install --silent prisma@^3.15.2
RUN npx prisma@^3.15.2 generate
RUN npx prisma@^3.15.2 migrate deploy

WORKDIR /app
RUN npm install tslib apollo-server-express @nestjs/mapped-types @prisma/client@^3.15.2 pino-pretty@9.1.1

CMD node ./main.js
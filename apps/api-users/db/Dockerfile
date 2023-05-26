FROM node:16-alpine

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-users-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

RUN npm i -g --silent prisma@^4.13.0

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-users /app/apps/api-users

RUN npm install --silent arangojs@^7.6.1 ts-node@^10.9.1 tslib@^2.3.1 prisma@^4.13.0 @prisma/client@^4.13.0
RUN npx prisma@^4.13.0 generate --schema /app/apps/api-users/db/prisma.schema
CMD npx prisma@^4.13.0 migrate deploy --schema /app/apps/api-users/db/prisma/schema.prisma; npx ts-node /app/apps/api-users/db/seed.ts
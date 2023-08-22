FROM node:16-alpine

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-journeys-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-journeys /app/apps/api-journeys

RUN npm install --save-dev --silent ts-node@10.9.1 tslib@2.3.1 uuid prisma@^4.15.0 @types/node@14.14.33 lodash@^4.17.21
RUN npm install --silent @prisma/client@^4.15.0 
RUN npx prisma@^4.15.0 generate --schema /app/apps/api-journeys/db/schema.prisma

CMD npx prisma@^4.15.0 migrate deploy --schema /app/apps/api-journeys/db/schema.prisma; npm run ts-node /app/apps/api-journeys/db/seed.ts

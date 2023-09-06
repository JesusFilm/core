FROM node:18-alpine

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-videos-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-videos /app/apps/api-videos

RUN npm install --silent node-fetch@2.6.7 ts-node@^10.9.1 tslib@^2.3.1 prisma@^4.15.0 @prisma/client@^4.15.0 lodash@^4.17.21 jsondiffpatch@^0.4.1
RUN npx prisma@^4.15.0 generate --schema /app/apps/api-videos/db/schema.prisma

CMD npx prisma@^4.15.0 migrate deploy --schema /app/apps/api-videos/db/schema.prisma; npm run ts-node /app/apps/api-videos/db/seed.ts

FROM node:16-alpine

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-languages-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-languages /app/apps/api-languages

RUN npm install lodash@^4.17.21 node-fetch@2.6.7 slugify ts-node@^10.9.1 tslib@^2.3.1 prisma@^4.15.0 @prisma/client@^4.15.0
RUN npx prisma@^4.15.0 generate --schema /app/apps/api-languages/db/schema.prisma

CMD npx prisma@^4.15.0 migrate deploy --schema /app/apps/api-languages/db/schema.prisma; npm run ts-node /app/apps/api-languages/db/seed.ts
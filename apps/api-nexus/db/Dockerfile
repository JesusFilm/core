FROM node:18-alpine

ENV PRISMA_LOCATION=/app/node_modules/.prisma/api-nexus-client

RUN apk upgrade --update-cache --available && \
    apk add openssl1.1-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-nexus /app/apps/api-nexus

RUN npm install --save-dev --silent ts-node@10.9.1 tslib@^2.6.2 uuid prisma@^5.2.0 @types/node@18.14.2 lodash@^4.17.21
RUN npm install --silent @prisma/client@^5.2.0 
RUN npx prisma@^5.2.0 generate --schema /app/apps/api-nexus/db/schema.prisma

CMD npx prisma@^5.2.0 migrate deploy --schema /app/apps/api-nexus/db/schema.prisma; npm run ts-node /app/apps/api-nexus/db/seed.ts
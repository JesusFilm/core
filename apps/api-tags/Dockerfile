FROM node:16-alpine
ARG PRISMA_LOCATION=/app/node_modules/.prisma/api-tags-client

EXPOSE 4006

ENV PG_DATABASE_URL=$PG_DATABASE_URL

WORKDIR /app
COPY ./dist/apps/api-tags .

# dependencies that nestjs needs
RUN npm install --production --silent

WORKDIR /prisma
COPY ./apps/api-tags/prisma .
RUN npx prisma@^3.15.2 generate

WORKDIR /app
RUN npm install tslib apollo-server-express @nestjs/mapped-types @prisma/client@^3.15.2 pino-pretty@9.1.1

CMD node ./main.js
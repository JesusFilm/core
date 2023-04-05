FROM node:16-alpine

EXPOSE 4006

WORKDIR /app
COPY ./dist/apps/api-tags .

# dependencies that nestjs needs
RUN npm install --production --silent

WORKDIR /prisma
COPY ./apps/api-tags/prisma .
RUN npx prisma@^3.15.2 generate
RUN npx prisma@^3.15.2 migrate deploy

WORKDIR /app
RUN npm install tslib apollo-server-express @nestjs/mapped-types @prisma/client@^3.15.2 pino-pretty@9.1.1

CMD node ./main.js
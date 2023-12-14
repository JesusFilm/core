FROM node:18-alpine

EXPOSE 4007

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/api-journeys-worker .

# dependencies that nestjs needs
RUN npm install --production --silent

WORKDIR /app

RUN npm install tslib@^2.6.2 @nestjs/mapped-types pino-pretty@^10.2.0
CMD  node ./main.js
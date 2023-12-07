FROM node:18-alpine

EXPOSE 4007

WORKDIR /app
COPY ./dist/apps/mq .

# dependencies that nestjs needs
RUN npm install --production --silent

WORKDIR /app
RUN npm install tslib@^2.6.2 @nestjs/mapped-types pino-pretty@^10.2.0

CMD node ./main.js
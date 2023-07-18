FROM node:16-alpine
WORKDIR /app
COPY ./dist/apps/api-languages .
EXPOSE 4003
# dependencies that nestjs needs
RUN npm install --production --silent
RUN npm install tslib apollo-server-express @nestjs/mapped-types pino-pretty@9.1.1
CMD node ./main.js
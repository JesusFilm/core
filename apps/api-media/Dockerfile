FROM node:16-alpine
WORKDIR /app
COPY ./dist/apps/api-media .
EXPOSE 4005
# dependencies that nestjs needs
RUN npm install --production --silent
RUN npm install tslib apollo-server-express @nestjs/mapped-types pino-pretty@9.1.1 form-data
CMD node ./main.js
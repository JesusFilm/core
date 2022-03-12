FROM node:14-alpine
WORKDIR /app
COPY ./dist/apps/api-journeys .
EXPOSE 4001
# dependencies that nestjs needs
RUN npm install --production --silent
RUN npm install tslib apollo-server-express @nestjs/mapped-types
CMD node ./main.js
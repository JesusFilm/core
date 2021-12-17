FROM node:14-alpine
WORKDIR /app
COPY ./dist/apps/api-users .
EXPOSE 4002
# dependencies that nestjs needs
RUN npm install tslib apollo-server-express @nestjs/mapped-types
RUN npm install --production --silent
CMD node ./main.js
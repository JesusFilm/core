FROM node:16-alpine
WORKDIR /app
COPY ./dist/apps/api-languages .
EXPOSE 4003
# dependencies that nestjs needs
RUN npm install --production
RUN npm install tslib apollo-server-express @nestjs/mapped-types
CMD node ./main.js
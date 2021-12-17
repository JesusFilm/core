FROM node:14-alpine
WORKDIR /app
COPY ./dist/apps/api-users .
EXPOSE 4002
# RUN apk add --no-cache python3 make g++
RUN npm install --production --silent
# dependencies that nestjs needs
RUN npm install tslib apollo-server-express
CMD node ./main.js
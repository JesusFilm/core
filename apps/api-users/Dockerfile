ARG DATABASE_USER
ARG DATABASE_PASS
ARG DATABASE_URL
FROM node:14-alpine
ENV DATABASE_USER=$DATABASE_USER
ENV DATABASE_PASS=$DATABASE_PASS
ENV DATABASE_URL=$DATABASE_URL
WORKDIR /app
COPY ./dist/apps/api-users .
EXPOSE 4002
# RUN apk add --no-cache python3 make g++
RUN npm install --production --silent
# dependencies that nestjs needs
RUN npm install tslib apollo-server-express
CMD node ./main.js
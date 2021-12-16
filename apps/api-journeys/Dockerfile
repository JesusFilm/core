ARG DATABASE_USER_INPUT
ARG DATABASE_PASS_INPUT
ARG DATABASE_URL_INPUT
ARG DATABASE_DB_INPUT
FROM node:14-alpine
ENV DATABASE_USER=$DATABASE_USER_INPUT
ENV DATABASE_PASS=$DATABASE_PASS_INPUT
ENV DATABASE_URL=$DATABASE_URL_INPUT
ENV DATABASE_DB=$DATABASE_DB_INPUT
WORKDIR /app
COPY ./dist/apps/api-journeys .
EXPOSE 4001
RUN apk add --no-cache python3 make g++ pkgconfig build-base cairo-dev jpeg-dev pango-dev giflib-dev
RUN npm install --production --silent
# dependencies that nestjs needs
RUN npm install tslib apollo-server-express
CMD node ./main.js
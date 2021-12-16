ARG DATABASE_USER
ARG DATABASE_PASS
ARG DATABASE_URL
ARG DATABASE_DB
FROM node:14-alpine
ENV DATABASE_USER=$DATABASE_USER
ENV DATABASE_PASS=$DATABASE_PASS
ENV DATABASE_URL=$DATABASE_URL
ENV DATABASE_DB=$DATABASE_DB
WORKDIR /app
COPY ./dist/apps/api-journeys .
EXPOSE 4001
RUN apk add --no-cache python3 make g++ pkgconfig build-base cairo-dev jpeg-dev pango-dev giflib-dev
RUN npm install --production --silent
# dependencies that nestjs needs
RUN npm install tslib apollo-server-express
CMD node ./main.js
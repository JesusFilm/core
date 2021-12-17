FROM node:14-alpine
WORKDIR /app
COPY ./dist/apps/api-journeys .
EXPOSE 4001
RUN apk add --no-cache python3 make g++ pkgconfig build-base cairo-dev jpeg-dev pango-dev giflib-dev
RUN npm install --production --silent
# dependencies that nestjs needs
RUN npm install tslib apollo-server-express
CMD node ./main.js
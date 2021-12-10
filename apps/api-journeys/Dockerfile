FROM node:lts-alpine
WORKDIR /app
COPY ./dist/apps/api-journeys .
ENV PORT=4001
EXPOSE ${PORT}
RUN apk add --no-cache python3 make g++
RUN npm install --production
# dependencies that nestjs needs
RUN npm install reflect-metadata tslib rxjs
CMD node ./main.js
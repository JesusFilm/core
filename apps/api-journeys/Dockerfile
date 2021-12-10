FROM node:14-alpine
WORKDIR /app
COPY ./dist/apps/api-journeys .
EXPOSE 4001
RUN apk add --no-cache python3 make g++ pkgconfig
RUN npm install --production
RUN apk del .gyp
# dependencies that nestjs needs
RUN npm install tslib
CMD node ./main.js
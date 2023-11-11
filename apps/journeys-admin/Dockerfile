FROM node:18-alpine

EXPOSE 3000

RUN apk upgrade --update-cache --available && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/journeys-admin .

# dependencies
RUN npm install --production --silent

CMD npm start
FROM node:18-alpine

EXPOSE 3000

RUN apk upgrade --update-cache --available && \
    apk add libc6-compat python3 build-base g++ cairo-dev pixman pango && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY ./dist/apps/journeys-admin/.next/standalone .
COPY ./package-lock.json .

# dependencies
RUN npm install --omit=dev 

CMD node ./apps/journeys-admin/server.js
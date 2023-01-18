FROM node:16-alpine
WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
COPY ./apps/api-journeys/seed .

RUN npm install --silent
CMD npx ts-node ./seed.ts
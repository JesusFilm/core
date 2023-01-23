FROM node:16-alpine
WORKDIR /app
# COPY ./package.json .
# COPY ./package-lock.json .
COPY ./apps/api-journeys/db .

RUN npm install -g npm@latest
RUN npm install arangojs
CMD npx ts-node ./seed.ts
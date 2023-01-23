FROM node:16-alpine
WORKDIR /app
COPY ./apps/api-users/db .

RUN npm install --silent arangojs
CMD npx ts-node ./seed.ts
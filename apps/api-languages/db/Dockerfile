FROM node:16-alpine
WORKDIR /app
COPY ./apps/api-languages/db .

RUN npm install arangojs aws-sdk lodash node-fetch slugify
CMD npx ts-node ./seed.ts
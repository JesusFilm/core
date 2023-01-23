FROM node:16-alpine
WORKDIR /app
COPY ./apps/api-videos .

RUN npm install --silent arangojs node-fetch
CMD npx ts-node ./db/seed.ts
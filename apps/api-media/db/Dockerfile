FROM node:16-alpine
WORKDIR /app
COPY ./apps/api-media .

RUN npm install --silent arangojs
CMD npx ts-node ./db/seed.ts
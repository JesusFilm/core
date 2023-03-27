FROM node:16-alpine
WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-videos /app/apps/api-videos

RUN npm install --silent arangojs@^7.6.1 node-fetch@2.6.7 ts-node@^10.9.1 tslib@^2.3.1
CMD npx ts-node /app/apps/api-videos/db/seed.ts
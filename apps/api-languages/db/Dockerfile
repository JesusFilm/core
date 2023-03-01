FROM node:16-alpine
WORKDIR /app
COPY ./tsconfig.base.json /app/tsconfig.base.json
COPY ./apps/api-languages /app/apps/api-languages

RUN npm install arangojs@^7.6.1 aws-sdk@2.1062.0 lodash@^4.17.21 node-fetch@2.6.7 slugify ts-node@^10.9.1 tslib@^2.3.1
CMD npx ts-node /app/apps/api-languages/db/seed.ts
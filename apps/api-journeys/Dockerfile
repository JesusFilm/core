FROM node:14-bullseye-slim
WORKDIR /app
COPY ./dist/apps/api-journeys .
EXPOSE 4001
RUN apt-get update
RUN apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN npm install --production --silent
# dependencies that nestjs needs
RUN npm install tslib apollo-server-express
CMD node ./main.js
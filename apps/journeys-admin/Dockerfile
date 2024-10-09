FROM node:20-bullseye-slim

EXPOSE 3000

ENV VERCEL=true

WORKDIR /app
COPY ./dist/apps/journeys-admin .
COPY ./package-lock.json .

# dependencies
RUN npm i -g next
RUN npm i --omit=dev --force --silent
RUN npm i sharp pino dd-trace next-logger --force --silent

CMD NODE_OPTIONS='-r next-logger' npm start
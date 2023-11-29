FROM node:18-bullseye-slim

EXPOSE 3000

WORKDIR /app
COPY ./dist/apps/journeys-admin .

# dependencies
RUN npm i -g next
RUN npm i --omit=dev --force --silent

CMD npm start
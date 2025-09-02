FROM node:22-bullseye-slim

EXPOSE 3000

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV VERCEL=true

WORKDIR /app
COPY ./dist/apps/arclight .
COPY ./package-lock.json .

# dependencies
RUN npm i -g next
RUN npm i --omit=dev --force --silent
RUN npm i sharp pino dd-trace next-logger --force --silent

CMD NODE_OPTIONS='-r next-logger' npm start
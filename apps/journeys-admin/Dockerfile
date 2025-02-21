FROM node:22-bullseye-slim

EXPOSE 3000

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV VERCEL=true

WORKDIR /app
COPY ./dist/apps/journeys-admin .
COPY ./package.json .
COPY ./bun.lock .

# dependencies
RUN bun install -g next
RUN bun install --production --frozen-lockfile
RUN bun install sharp pino dd-trace next-logger --force --silent

CMD NODE_OPTIONS='-r next-logger' bun run start
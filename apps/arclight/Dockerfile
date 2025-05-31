FROM node:22-bullseye-slim

EXPOSE 3000

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV VERCEL=true

WORKDIR /app
COPY ./dist/apps/arclight .
COPY ./apps/arclight/package.json .
COPY ./bun.lock .

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.15"
# dependencies
RUN bun install --production --frozen-lockfile

CMD NODE_OPTIONS='-r next-logger' bun run start
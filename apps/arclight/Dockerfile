FROM node:22-bullseye-slim

EXPOSE 3000

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV VERCEL=true

WORKDIR /app
COPY ./dist/apps/arclight .
COPY ./pnpm-lock.yaml .

# dependencies
RUN corepack enable && corepack prepare pnpm --activate
RUN pnpm add -g next
RUN pnpm install --prod --frozen-lockfile --force --silent
RUN pnpm add sharp pino dd-trace next-logger --force --silent

CMD NODE_OPTIONS='-r next-logger' pnpm start
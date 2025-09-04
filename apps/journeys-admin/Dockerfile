FROM node:22-bullseye-slim

EXPOSE 3000

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV VERCEL=true
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
COPY ./dist/apps/journeys-admin .


RUN mkdir -p $PNPM_HOME && corepack enable && corepack prepare pnpm --activate
RUN pnpm add -g next
RUN pnpm install --prod --silent
RUN pnpm add sharp pino dd-trace next-logger  --silent

CMD NODE_OPTIONS='-r next-logger' pnpm start
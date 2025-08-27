FROM node:22-bullseye-slim

EXPOSE 3000

ARG SERVICE_VERSION=0.0.1
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"
ENV VERCEL=true

WORKDIR /app
COPY ./dist/apps/arclight .
COPY ./pnpm-lock.yaml .

# dependencies
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* && \
    curl -fsSL https://get.pnpm.io/install.sh | sh -s -- --bin-dir $PNPM_HOME --version 9.0.0
RUN pnpm add -g next
RUN pnpm install --prod --frozen-lockfile --force --silent
RUN pnpm add sharp pino dd-trace next-logger --force --silent

CMD NODE_OPTIONS='-r next-logger' pnpm start